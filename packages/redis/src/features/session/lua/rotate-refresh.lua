-- rotate-refresh.lua
-- Atomically rotates a refresh token:
--   1. Reads old refresh-token mapping; returns TOKEN_NOT_FOUND if gone
--      (covers concurrent rotation / token reuse).
--   2. Reads old session to carry over metadata (userAgent, ip).
--   3. Deletes old refresh mapping and old session.
--   4. Creates new session + refresh mapping with TTL.
--   5. Updates user sessions index (ZREM old, ZADD new, cleanup).
--
-- Returns a JSON string:
--   { "status": "OK", "userId": "...", "userAgent": "...", "ip": "..." }
--   { "status": "TOKEN_NOT_FOUND" }
--
-- NOTE: constructs keys dynamically from a prefix — not Redis-Cluster safe.
--
-- KEYS[1]  oldRefreshKey
--
-- ARGV[1]  keyPrefix
-- ARGV[2]  newSessionId
-- ARGV[3]  newTokenHash
-- ARGV[4]  ttl (seconds)
-- ARGV[5]  now (ms timestamp)

local oldRefreshKey = KEYS[1]
local keyPrefix     = ARGV[1]
local newSessionId  = ARGV[2]
local newTokenHash  = ARGV[3]
local ttl           = tonumber(ARGV[4])
local now           = tonumber(ARGV[5])

local oldRefreshRaw = redis.call('GET', oldRefreshKey)
if not oldRefreshRaw then
  return cjson.encode({status = 'TOKEN_NOT_FOUND'})
end

local oldRefresh   = cjson.decode(oldRefreshRaw)
local oldSessionId = oldRefresh.sessionId
local userId       = oldRefresh.userId

local oldSessionKey = keyPrefix .. ':session:' .. oldSessionId
local oldSessionRaw = redis.call('GET', oldSessionKey)

local userAgent
local ip

if oldSessionRaw then
  local oldSession = cjson.decode(oldSessionRaw)
  userAgent = oldSession.userAgent
  ip        = oldSession.ip
  redis.call('DEL', oldSessionKey)
end

redis.call('DEL', oldRefreshKey)

local expiresAt = now + ttl * 1000

local newSessionData = {
  userId    = userId,
  tokenHash = newTokenHash,
  createdAt = now,
  expiresAt = expiresAt
}
if userAgent then newSessionData.userAgent = userAgent end
if ip        then newSessionData.ip        = ip end

local newRefreshData = {
  userId    = userId,
  sessionId = newSessionId
}

local newSessionKey = keyPrefix .. ':session:' .. newSessionId
local newRefreshKey = keyPrefix .. ':refresh:' .. newTokenHash
local userIdxKey    = keyPrefix .. ':user_sessions:' .. userId

redis.call('SET', newSessionKey, cjson.encode(newSessionData), 'EX', ttl)
redis.call('SET', newRefreshKey, cjson.encode(newRefreshData), 'EX', ttl)

redis.call('ZREM', userIdxKey, oldSessionId)
redis.call('ZADD', userIdxKey, expiresAt, newSessionId)
redis.call('ZREMRANGEBYSCORE', userIdxKey, '-inf', now)

return cjson.encode({
  status    = 'OK',
  userId    = userId,
  userAgent = userAgent or '',
  ip        = ip or ''
})
