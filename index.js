const express = require('express')
const line = require('@line/bot-sdk')
const app = express()
const port = process.env.PORT || 5000
const config = {
  channelAccessToken: `{LINE_CHANNEL_ACCESS_TOKEN}`,
  channelSecret: `{LINE_CHANNEL_SECRET}`
}
let baseURL = 'https://s3.amazonaws.com/line-message-api-demo-2'
const client = new line.Client(config)

app.get('/', (req, res) => {
  res.send({
    status: 200,
    message: 'Hello World heroku',
    server_time: new Date()
  })
})

app.post('/webhook', line.middleware(config), (req, res) => {
  console.log('/webhook')
  Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result))
})


function handleEvent(event) {
  console.log('---------------- event ---------------------')
  console.log(event, 'event')
  console.log('---------------- event ---------------------')
  switch (event.type) {
    case 'message':
      const message = event.message
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken, event.source)
        case 'image':
          return handleImage(message, event.replyToken)
        case 'video':
          return handleVideo(message, event.replyToken)
        case 'audio':
          return handleAudio(message, event.replyToken)
        case 'location':
          return handleLocation(message, event.replyToken)
        case 'sticker':
          return handleSticker(message, event.replyToken)
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`)
      }
      
    case 'postback':
      let data = event.postback.data
      if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
        data += `(${JSON.stringify(event.postback.params)})`
      }
      return replyText(event.replyToken, `Got postback: ${data}`)

    case 'beacon':
      return replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`)

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`)
  }
}

function handleText(message, replyToken, source) {
  const buttonsImageURL = `https://www.pixelstalk.net/wp-content/uploads/2016/08/Space-Ship-and-Blue-Planet-1024x768-Wallpaper.jpg`
  const buttonsImageURL2 = `${baseURL}/buttons/1024.jpg`
  console.log('---------------- buttonsImageURL ---------------------')
  console.log(buttonsImageURL)
  console.log('---------------- buttonsImageURL ---------------------')
  console.log('---------------- buttonsImageURL2 ---------------------')
  console.log(buttonsImageURL2)
  console.log('---------------- buttonsImageURL2 ---------------------')
  console.log('---------------- message ---------------------')
  console.log(message)
  console.log('---------------- message ---------------------')
  console.log('---------------- replyToken ---------------------')
  console.log(replyToken)
  console.log('---------------- replyToken ---------------------')
  console.log('---------------- source ---------------------')
  console.log(source)
  console.log('---------------- source ---------------------')
  
  switch (message.text) {
    case 'profile':
      if (source.userId) {
        return client.getProfile(source.userId)
          .then((profile) => replyText(
            replyToken,
            [
              `Display name: ${profile.displayName}`,
              `Status message: ${profile.statusMessage}`,
            ]
          ))
      } else {
        return replyText(replyToken, 'Bot can\'t use profile API without user ID')
      }
    case 'buttons':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Buttons alt text',
          template: {
            type: 'buttons',
            thumbnailImageUrl: buttonsImageURL,
            title: 'My button sample',
            text: 'Hello, my button',
            actions: [
              { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
              { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
              { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
              { label: 'Say message', type: 'message', text: 'Rice=米' },
            ],
          },
        }
      )
    case 'confirm':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Confirm alt text',
          template: {
            type: 'confirm',
            text: 'Do it?',
            actions: [
              { label: 'Yes', type: 'message', text: 'Yes!' },
              { label: 'No', type: 'message', text: 'No!' },
            ],
          },
        }
      )
    case 'carousel':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Carousel alt text',
          template: {
            type: 'carousel',
            columns: [
              {
                thumbnailImageUrl: buttonsImageURL,
                title: 'hoge',
                text: 'fuga',
                actions: [
                  { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
                  { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
                ],
              },
              {
                thumbnailImageUrl: buttonsImageURL2,
                title: 'hoge',
                text: 'fuga',
                actions: [
                  { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
                  { label: 'Say message', type: 'message', text: 'Rice=米' },
                ],
              },
            ],
          },
        }
      )
    case 'image carousel':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Image carousel alt text',
          template: {
            type: 'image_carousel',
            columns: [
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Go to LINE', type: 'uri', uri: 'https://line.me' },
              },
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
              },
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Say message', type: 'message', text: 'Rice=米' },
              },
              {
                imageUrl: buttonsImageURL,
                action: {
                  label: 'datetime',
                  type: 'datetimepicker',
                  data: 'DATETIME',
                  mode: 'datetime',
                },
              },
            ]
          },
        }
      )
    case 'datetime':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Datetime pickers alt text',
          template: {
            type: 'buttons',
            text: 'Select date / time !',
            actions: [
              { type: 'datetimepicker', label: 'date', data: 'DATE', mode: 'date' },
              { type: 'datetimepicker', label: 'time', data: 'TIME', mode: 'time' },
              { type: 'datetimepicker', label: 'datetime', data: 'DATETIME', mode: 'datetime' },
            ],
          },
        }
      )
    case 'imagemap':
      return client.replyMessage(
        replyToken,
        {
          type: 'imagemap',
          baseUrl: `${baseURL}/rich`,
          altText: 'Imagemap alt text',
          baseSize: { width: 1040, height: 1040 },
          actions: [
            { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'message', text: 'image carousel' },
            { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'message', text: 'datetime' },
            { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
            { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'next rich message' },
          ],
          video: {
            originalContentUrl: `${baseURL}/imagemap/video.mp4`,
            previewImageUrl: `${baseURL}/imagemap/preview.jpg`,
            area: {
              x: 280,
              y: 385,
              width: 480,
              height: 270,
            },
            externalLink: {
              linkUri: 'https://line.me',
              label: 'LINE'
            }
          }
        }
      )
    case 'next rich message':
    return client.replyMessage(
      replyToken,
      {
        type: 'imagemap',
        baseUrl: `${baseURL}/rich`,
        altText: 'Imagemap alt text',
        baseSize: { width: 1040, height: 1040 },
        actions: [
          { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
          { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
          { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
          { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'start rich message' },
        ]
      }
    ).then(d => {
      console.log('---------------- d ---------------------')
      console.log(d)
      console.log('---------------- d ---------------------')
    }).catch(err => {
      console.log('---------------- err ---------------------')
      console.log(err)
      console.log('---------------- err ---------------------')
    })
    case 'bye':
      switch (source.type) {
        case 'user':
          return replyText(replyToken, 'Bot can\'t leave from 1:1 chat')
        case 'group':
          return replyText(replyToken, 'Leaving group')
            .then(() => client.leaveGroup(source.groupId))
        case 'room':
          return replyText(replyToken, 'Leaving room')
            .then(() => client.leaveRoom(source.roomId))
      }
    default:
      console.log(`Echo message to ${replyToken}: ${message.text}`)
      return replyText(replyToken, message.text)
  }
}

function handleLocation(message, replyToken) {
  console.log('---------------- handleLocation message ---------------------')
  console.log(message)
  console.log('---------------- handleLocation message ---------------------')
  const options = {
    type: 'location',
    title: 'title' in message ? message.title : 'my location',
    address: message.address.length > 100 ? message.address.substring(0, 100) : message.address,
    latitude: message.latitude,
    longitude: message.longitude,
  }
  console.log('---------------- options ---------------------')
  console.log(options)
  console.log('---------------- options ---------------------')
  return client.replyMessage(
    replyToken,
    options
  );
}
// function handleMessageEvent(event) {
//   var msg = {
//       type: 'text',
//       text: 'สวัสดีครัช'
//   }

//   return client.replyMessage(event.replyToken, msg)
// }
const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts]
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  )
}

app.listen(port, () => {
  console.log(`listening on ${port}`)
})
