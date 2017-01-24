require('dotenv-safe').load()

const server = require('http').createServer()
const WebSocketServer = require('ws').Server
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const wsApp = new WebSocketServer({ server: server })

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
  res.sendStaus(501)
})

app.get('/answer/:key', (req, res) => {

  const ws_url = process.env.PUBLIC_URL.replace(/^http/, 'ws') + '/socket'
  const event_url = process.env.PUBLIC_URL + '/call/event'

  console.log('directing call to ' + ws_url)

  res.send([
    {
      action: 'talk',
      voiceName: 'Celine',
      text: 'Lorem ipsum'
    },
    {
      'action': 'connect',
      'eventUrl': [
        event_url
      ],
      'endpoint': [
        {
          'type': 'websocket',
          'uri': ws_url,
          'content-type': 'audio/l16;rate=16000',
          'headers': {
            'whatever': 'metadata_you_want'
          }
        }
      ]
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
  })

  if(url == '/sms') {
    connections.set(ws, 'sms')
  }

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
