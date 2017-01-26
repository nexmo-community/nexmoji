require('dotenv-safe').load()

const server = require('http').createServer()
const WebSocketServer = require('ws').Server
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const app = express()
const wsApp = new WebSocketServer({ server: server })

// frontend and details
app.use(express.static('static'))

app.get('/heading-text', (req, res) =>
  res.send(`Text ${process.env.NUMBER} to join`)
)

app.get('/nexmoji-heading', (req, res) =>
  res.send(`:calling::heart::heavy_plus_sign::poop::arrow_right: ${process.env.NUMBER.replace('44', 0)}`)
)

const keycheck = (req, res, next) => {
  if(req.params.key != process.env.WEBHOOK_TOKEN)
    res.sendStatus(401)
  else
    next()
}

app.get('/sms/:key', keycheck, (req, res) => {

  broadcast(JSON.stringify(req.query), 'sms')

  res.sendStatus(200)

})


app.post('/event/:key', keycheck, bodyParser.json(), (req, res) => {
  res.sendStaus(501)
})

app.get('/answer/:key', keycheck, (req, res) => {

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


const RedisStore = require('connect-redis')(session)
const Redis = require('ioredis')
const redis = new Redis(process.env.REDIS_URL)

const sess = {
  store: new RedisStore({
    client: redis
  }),
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {}
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1)
  sess.cookie.secure = true
}

app.use(session(sess))

app.get('/auth/status', (req, res) => {
  res.sendStatus(req.session.logged_in ? 200 : 401)
})

app.post('/auth/login', bodyParser.urlencoded({extended:false}), (req, res) => {
  req.session.logged_in = req.body.password == process.env.PASSWORD
  res.redirect('/auth.html')
})

const protect = (req, res, next) => {
  if(req.session.logged_in)
    next()
  else
    res.redirect('/auth.html')
}


app.post('/demo-01.html', protect, bodyParser.urlencoded({extended:false}), (req, res) => {

  console.log('Run Demo One:', req.body)

  res.redirect('/demo-01.html')
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
