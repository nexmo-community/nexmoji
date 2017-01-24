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
const sms_url = process.env.PUBLIC_URL + '/sms/' + process.env.WEBHOOK_TOKEN

console.log(`Updating endpoints:
 app:        ${process.env.APP_ID}
 answer url: ${answer_url}
 event url:  ${event_url}
 sms url:    ${sms_url}  (takes longer)
`)

console.log('Setting app answer/event urls...')
nexmo.applications
  .update(
    process.env.APP_ID,
    'Nexmoji (auto updated)',
    'voice',
    answer_url, event_url,
    {},
    (err) => {
      if(err) throw err
      console.log('...Done')

      console.log('Looking up number...')
      nexmo.numberInsight.get(
        {level: 'standard', number: process.env.NUMBER},
        (err, result) => {
          if(err) throw err

          console.log('...Done')
          console.log('Updating sms endpoint...')

          nexmo.number.update(
            result.country_code,
            result.international_format_number, {
              moHttpUrl: sms_url
            }, (err, result) => {
              if(err) throw err

              console.log(`...Done (${result['error-code-label']})`)

            })

        }
      )



    })
