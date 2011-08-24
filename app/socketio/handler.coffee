module.exports.registerSocketHandler = (app, mongoose, redis) ->
  ejs = require "ejs"
  fs = require "fs"
  formatDate = require "./../modules/dateFormat.js"
  viewsRoot = "#{__dirname}/../views"
  parseCookie = require("connect").utils.parseCookie
  Session = require("connect").middleware.session.Session

  app.io.configure ->
    app.io.set 'authorization', (handshakeData, accept) ->
      # Bind ExpressJS session
      # Note: This assumes that both socketIO server and express are hosted on the same domain.
      # The session binding won't work otherwise.
      if handshakeData.headers.cookie?
        handshakeData.sessionID = (parseCookie handshakeData.headers.cookie)["connect.sid"]
        app.sessionStore.get handshakeData.sessionID, (err, session) ->
          if err?
            console.log "Socketio auth failed: #{err}"
            accept err, false
          else
            console.log "Socketio auth succeeded"
            handshakeData['session'] = new Session handshakeData, session
            accept null, true
      else
        accept "No cookies set!", false
      
 
  app.io.sockets.on 'connection', (socket) ->
    hs = socket.handshake
    console.dir hs
    user = hs.session.user
    redisClient = redis.createClient 6379

    redisClient.on "message", (channel, message) ->
      console.log "pubsub msg received:  #{message}"
      message = JSON.parse message
    
    # This is never invoked at the moment
    # The client sends messages through an http post request and not through websockets.
    socket.on "message", (message) ->
      console.log "Client sent a message through websockets: #{json.parse message}"
    
    socket.on "disconnect", () ->
      redisClient.quit()
