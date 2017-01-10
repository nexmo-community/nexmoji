// datastore for conversations

const TIMEOUT = 60

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

    keys.forEach(key => pipeline.lrange(key, 0, 30))

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


exports.push = (uuid, data) => {
  const key = `conversation:${uuid}`

  redis
    .lpush(key, JSON.stringify({
      t: Date.now(),
      data
    }))
    .then(
      redis.expire(key, TIMEOUT)
    )

  // todo - emit
}
