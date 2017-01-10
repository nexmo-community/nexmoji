require('dotenv-safe').load()

const express = require('express')
const bodyParser = require('body-parser')
const app = express()

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



app.listen(process.env.PORT || 3000)
