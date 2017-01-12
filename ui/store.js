/* global ReconnectingWebSocket */

// tread carefully with this store, it's delicate
window.store = (function(){
  var _data = {}
  var _expires = {}
  var listeners = []

  var TIMEOUT = 60
  var RANGE_LIMIT = 30

  function setex(key) {
    clearTimeout(_expires[key])
    _expires[key] = setTimeout(function(){
      console.log('expiring key:' + key)
      delete _data[key]
    }, TIMEOUT * 1000)
  }

  function notify(key) {
    listeners.forEach(function(listener) {
      listener(key, _data[key], _data)
    })
  }

  const host = location.origin.replace(/^http/, 'ws') + '/store'

  const ws = new ReconnectingWebSocket(host)

  ws.onmessage = event => {
    try {
      var data = JSON.parse(event.data)
      handle(data)
    } catch (e) {
      console.error(e)
    }
  }

  ws.onopen = () => { console.log('Connected to store') }

  function handle(data) {
    switch (data.type) {

    case 'configure':
      RANGE_LIMIT = data.RANGE_LIMIT || 30
      TIMEOUT = data.TIMEOUT || 30
      break

    case 'backfill':
      _data[data.key] = data.items
      setex(data.key)
      notify(data.key)

      break
    case 'update':
      var items = (_data[data.key] = _data[data.key] || [])
      items.unshift(data.item)
      while(items.length > RANGE_LIMIT) items.pop()
      setex(data.key)
      notify(data.key)
      break
    default:
      console.error('unhandled event ' + data.type)

    }
  }

  return {
    data: _data,
    listen: function(fn) {
      listeners.push(fn)
    }
  }
})()
