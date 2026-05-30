-- create-session.lua
-- Creates a session atomically:
--   1. SET session data with TTL
--   2. SET refresh-token mapping with TTL
--   3. ZADD session ID to user sessions index (score = expiresAt)
--   4. ZREMRANGEBYSCORE to clean up expired index entries
--
-- KEYS[1]  sessionKey
-- KEYS[2]  refreshKey
-- KEYS[3]  userIdxKey
--
-- ARGV[1]  sessionJson
-- ARGV[2]  refreshJson
-- ARGV[3]  ttl (seconds)
-- ARGV[4]  expiresAt (ms timestamp)
-- ARGV[5]  sessionId
-- ARGV[6]  now (ms timestamp)

local sessionKey  = KEYS[1]
local refreshKey  = KEYS[2]
local userIdxKey  = KEYS[3]

local sessionJson = ARGV[1]
local refreshJson = ARGV[2]
local ttl         = tonumber(ARGV[3])
local expiresAt   = tonumber(ARGV[4])
local sessionId   = ARGV[5]
local now         = tonumber(ARGV[6])

redis.call('SET', sessionKey, sessionJson, 'EX', ttl)
redis.call('SET', refreshKey, refreshJson, 'EX', ttl)
redis.call('ZADD', userIdxKey, expiresAt, sessionId)
redis.call('ZREMRANGEBYSCORE', userIdxKey, '-inf', now)

return 1
