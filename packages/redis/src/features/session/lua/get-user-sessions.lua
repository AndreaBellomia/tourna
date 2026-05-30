-- get-user-sessions.lua
-- Fetches all active sessions for a user in a single round-trip:
--   1. ZREMRANGEBYSCORE to clean up expired index entries
--   2. ZRANGE to get all remaining session IDs
--   3. GET each session's data
--   4. ZREM ghost entries (IDs whose session key has already expired)
--   5. Return a JSON array of { sessionId, data } objects
--
-- KEYS[1]  userIdxKey (user sessions sorted-set)
--
-- ARGV[1]  now       (ms timestamp for expired-entry cleanup)
-- ARGV[2]  keyPrefix (e.g. "auth:v1" — used to build session keys)

local userIdxKey = KEYS[1]
local now        = tonumber(ARGV[1])
local keyPrefix  = ARGV[2]

redis.call('ZREMRANGEBYSCORE', userIdxKey, '-inf', now)

local sessionIds = redis.call('ZRANGE', userIdxKey, 0, -1)

if #sessionIds == 0 then
  return '[]'
end

local results = {}
local ghosts  = {}

for _, sessionId in ipairs(sessionIds) do
  local sessionKey = keyPrefix .. ':session:' .. sessionId
  local raw = redis.call('GET', sessionKey)
  if raw then
    results[#results + 1] = { sessionId = sessionId, data = cjson.decode(raw) }
  else
    ghosts[#ghosts + 1] = sessionId
  end
end

for _, ghostId in ipairs(ghosts) do
  redis.call('ZREM', userIdxKey, ghostId)
end

return cjson.encode(results)
