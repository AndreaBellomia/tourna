-- revoke-session.lua
-- Atomically revokes a session:
--   1. Reads the session data to find the associated refresh-token hash
--      and userId.
--   2. Deletes the refresh-token mapping.
--   3. Removes the session from the user sessions index.
--   4. Deletes the session itself.
--
-- Idempotent: returns 0 if the session was already gone, 1 if revoked.
--
-- NOTE: constructs keys dynamically from a prefix — not Redis-Cluster safe.
--
-- KEYS[1]  sessionKey
--
-- ARGV[1]  keyPrefix
-- ARGV[2]  sessionId

local sessionKey = KEYS[1]
local keyPrefix  = ARGV[1]
local sessionId  = ARGV[2]

local sessionRaw = redis.call('GET', sessionKey)
if not sessionRaw then
  return 0
end

local session = cjson.decode(sessionRaw)

local refreshKey = keyPrefix .. ':refresh:' .. session.tokenHash
local userIdxKey = keyPrefix .. ':user_sessions:' .. session.userId

redis.call('DEL', refreshKey)
redis.call('ZREM', userIdxKey, sessionId)
redis.call('DEL', sessionKey)

return 1
