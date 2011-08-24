###
Module dependencies.
###
express = require('express')
sys = require("sys")
mongoose = require("mongoose")
io = require("socket.io")
redis = require('redis')

RedisStore = require('connect-redis')(express)
app = module.exports = express.createServer()

app.sessionStore = new RedisStore {port: 6379}
app.settings.db = JSON.parse(require('fs').readFileSync("#{__dirname}/app/conf/database.json", "utf-8"))[app.settings.env]
global.db = mongoose.connect "mongodb://localhost/meatme"

String.prototype.endsWith = (str) ->
  this.substring(this.length - str.length) is str

app.configure ->
  #app.use(express.staticProvider(__dirname + '/public'));
  app.use express.logger()
  app.use express.static(__dirname + '/public')
  app.set "views", "#{__dirname}/app/views"
  app.set "view engine", "ejs"
  app.use express.bodyParser()
  app.use express.cookieParser()
  app.use express.session({ secret: 'keyboard cat', store: app.sessionStore })
  app.use express.methodOverride()
  app.use app.router

collections = require('./app/schema/collections.js').registerCollections mongoose

app.configure "development", ->
  app.use express.errorHandler({ dumpExceptions: true, showStack: true })
  # ******************************************************** dummy session user
  app.use (req, res, next) ->
    User = mongoose.model "User"
    
    User.findOne {email: 'jfstgermain@gmail.com'}, (err, user) ->
      if user?
        console.log "Added user #{user.email} to session"
        req.session.user = user
      else
        console.error "Can't find dummy user. #{err}"
      next()

app.configure "staging", ->
  app.use express.errorHandler({ dumpExceptions: true, showStack: true })

app.configure "test", ->
  app.use express.errorHandler({ dumpExceptions: true, showStack: true })
  app.settings.quiet = true

app.configure "production", ->
  app.use express.errorHandler()
  app.settings.quiet = true

# Helpers
app.dynamicHelpers
  # express-messages is a dynamicHelper that
  # renders the flash messages to HTML for you
  #    $ npm install express-messages
  messages: require "express-messages"

# Default empty list for variable scriptSources
# app.set('view options', {locals: {scriptSources: []}});
app.helpers
  formatDate: require("./app/modules/dateFormat.js"),
  scriptSources: (req, res) -> return [],
  renderScriptTags: (scriptSources) ->
    res = ''

    if scriptSources?
      for s in scriptSources
        res += "<script src='/javascripts#{scriptSources[s]}' type='text/javascript'></script>\n"

    return res

routes = require('./app/conf/routes.js').registerRoutes app, mongoose

# Only listen on $ node app.js
if not module.parent?
  app.listen 3000
  console.log "Express server listening on port %d", app.address().port

app.io = io.listen app
socketHandler = require('./app/socketio/handler.js').registerSocketHandler app, mongoose, redis
