const redis = require('redis')

const redisClient = redis.createClient({
    port: 6379
})

module.exports = {
    redisClient
}