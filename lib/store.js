// datastore for conversations

const TIMEOUT = 15
const RANGE_LIMIT = 30

const Redis = require('ioredis')
const redis = new Redis()

const scanKeys = (match) =>
  new Promise((resolve) => {
    const all = []
    redis.scanStream({ match: match })
      .on('data', keys => all.push.apply(all,keys))
      .on('end', () => resolve(all))
  })

const ListMap = (keys, keyfn, itemfn) =>
  new Promise((resolve) => {
    var pipeline = redis.pipeline()

    keys.forEach(key => pipeline.lrange(key, 0, RANGE_LIMIT))

    pipeline.exec( (err, data) => {

      resolve(keys.reduce((memo, key, i) => {

        memo[keyfn(key)] = data[i][1].map(itemfn)

        return memo
      }, {}))
    })
  })


exports.all = () =>
  scanKeys('conversation:*')
    .then( keys => ListMap(keys,
      k => k.substr(13),
      JSON.parse
    ))


const listeners = []
exports.listen = (handler) => {
  listeners.push(handler)
}


exports.scan = (callback) =>
  redis.scanStream({ match: 'conversation:*' })
    .on('data', keys => keys.forEach(key => {
      redis.lrange(key, 0, RANGE_LIMIT)
        .then(values => values.map(JSON.parse))
        .then(items => callback(key.substr(13), items))
    }))


exports.push = (uuid, data) => {
  const key = `conversation:${uuid}`
  const t = Date.now()

  redis
    .lpush(key, JSON.stringify({
      t, data
    }))
    .then(
      redis.expire(key, TIMEOUT)
    )

  listeners.forEach( l => l(uuid, {t, data}) )
}

exports.TIMEOUT = TIMEOUT
exports.RANGE_LIMIT = RANGE_LIMIT
