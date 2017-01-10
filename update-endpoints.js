require('dotenv-safe').load()

const Nexmo = require('nexmo')

const privateKey = Buffer.from(process.env.PRIVATE_KEY)

const nexmo = new Nexmo({
  apiKey:        process.env.KEY,
  apiSecret:     process.env.SECRET,
  applicationId: process.env.APP_ID,
  privateKey:    privateKey
})


const answer_url = process.env.PUBLIC_URL + '/answer/' + process.env.WEBHOOK_TOKEN
const event_url = process.env.PUBLIC_URL + '/event/' + process.env.WEBHOOK_TOKEN

console.log(`Updating:
 app:        ${process.env.APP_ID}
 answer url: ${answer_url}
 event url:  ${event_url}
`)

nexmo.applications
  .update(
    process.env.APP_ID,
    'Peeps (auto updated)',
    'voice',
    answer_url, event_url,
    {},
    (err) => {
      if(err) throw err
      console.log('..Updated')
    })
