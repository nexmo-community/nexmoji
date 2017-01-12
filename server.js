require('dotenv-safe').load()

const server = require('http').createServer()
const WebSocketServer = require('ws').Server
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const wsApp = new WebSocketServer({ server: server })

const store = require('./lib/store')

// frontend and details
app.use(express.static('ui'))

app.get('/heading-text', (req, res) =>
  res.send(`Text ${process.env.NUMBER} to join`)
)

app.get('/sms/:token', (req, res) => {

  res.sendStatus(200)

  // TODO
  if(req.params.token == process.env.WEBHOOK_TOKEN) {
    console.log('webhook match')

  }

})


app.get('/conversations', (req, res) => {
  store
    .all()
    .then(res.send.bind(res))
})


app.post('/event/:key', bodyParser.json(), (req, res) => {

  console.log('TODO: ensure key match - ' + req.params.key)

  const {conversation_uuid, status} = req.body

  store.push(conversation_uuid, {status})

  res.send('ok')
})

app.get('/answer/:key', (req, res) => {

  res.send([
    {
      action: 'talk',
      voiceName: 'Celine',
      text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore.'
    }
  ])

})


const storeConnections = new WeakSet


wsApp.on('connection', function connection(ws) {

  const url = ws.upgradeReq.url

  if(url == '/store') {

    storeConnections.add(ws)

    // configure
    ws.send(JSON.stringify({
      type: 'configure',
      TIMEOUT: store.TIMEOUT,
      RANGE_LIMIT: store.RANGE_LIMIT
    }))

    // backfill
    store
      .scan( (key, items) => {
        ws.send(JSON.stringify({
          type: 'backfill',
          key, items
        }))
      })


  }


})

// update
store.listen( (key, item) => {
  const message = JSON.stringify({
    type: 'update',
    key, item
  })
  wsApp.clients
    .filter(
      client => storeConnections.has(client)
    )
    .forEach(
      client => client.send(message)
    )
})


// const r = n =>
//   Math.random().toString(16).substr(2,n)
//
// setInterval(() => {
//   const k = 'foo-' + r(1)
//   store.push(k, {value: r(4)})
// }, 5000)


server.on('request', app)
server.listen(process.env.PORT || 3000,
  () => { console.log('Listening on ' + server.address().port) }
)
