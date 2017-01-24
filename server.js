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

app.get('/nexmoji-heading', (req, res) =>
  res.send(`:calling::heart::heavy_plus_sign::poop::arrow_right: ${process.env.NUMBER.replace('44', 0)}`)
)



app.get('/sms/:token', (req, res) => {

  // TODO
  if(req.params.token == process.env.WEBHOOK_TOKEN) {

    // we trust this
    broadcast(JSON.stringify(req.query), 'sms')

  } else {
    console.error('token mismatch')
  }

  res.sendStatus(200)
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


// the type of each connection (for broadcast)
const connections = new WeakMap


wsApp.on('connection', function connection(ws) {

  const url = ws.upgradeReq.url

  console.log('incoming! ' + url)

  ws.on('message', data => {
    console.log('message', data)
    console.log('length:', data.length)
    // sample.write(data)
  })

  if(url == '/sms') {
    connections.set(ws, 'sms')
  }

  if(url == '/store') {
    connections.set(ws, 'store')

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
  broadcast(message, 'store')
})


function broadcast(message, key) {
  wsApp.clients
    .filter(
      client => !key || (connections.get(client) == key)
    )
    .forEach(
      client => client.send(message)
    )
}


server.on('request', app)
server.listen(process.env.PORT || 3000,
  () => { console.log('Listening on ' + server.address().port) }
)
