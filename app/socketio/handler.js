(function() {
  module.exports.registerSocketHandler = function(app, mongoose, redis) {
    var Session, ejs, formatDate, fs, parseCookie, viewsRoot;
    ejs = require("ejs");
    fs = require("fs");
    formatDate = require("./../modules/dateFormat.js");
    viewsRoot = "" + __dirname + "/../views";
    parseCookie = require("connect").utils.parseCookie;
    Session = require("connect").middleware.session.Session;
    app.io.configure(function() {
      return app.io.set('authorization', function(handshakeData, accept) {
        if (handshakeData.headers.cookie != null) {
          handshakeData.sessionID = (parseCookie(handshakeData.headers.cookie))["connect.sid"];
          return app.sessionStore.get(handshakeData.sessionID, function(err, session) {
            if (err != null) {
              console.log("Socketio auth failed: " + err);
              return accept(err, false);
            } else {
              console.log("Socketio auth succeeded");
              handshakeData['session'] = new Session(handshakeData, session);
              return accept(null, true);
            }
          });
        } else {
          return accept("No cookies set!", false);
        }
      });
    });
    return app.io.sockets.on('connection', function(socket) {
      var hs, redisClient, user, _ref;
      hs = socket.handshake;
      console.dir(hs);
      user = hs.session.user;
      redisClient = redis.createClient(6379);
      if (((_ref = user.favHashtags) != null ? _ref.length : void 0) > 0) {
        redisClient.subscribe("" + user.location.pattern + ".{" + (user.favHashtags.join(',')) + "}");
      } else {
        redisClient.subscribe("" + user.location.pattern + ".*");
      }
      redisClient.on("message", function(channel, message) {
        console.log("pubsub msg received:  " + message);
        message = JSON.parse(message);
        /*
               keep track of sent message ids in the user's session to avoid dups when a message is 
               sent to more than one channed that the user might be registered to
               keep only the last 150 sent message ids.
               
               Prolly not necessary using glob patterns.  dups are removed I think.  See below.
        
              */
        return mongoose.model(message.schema).findById(message.id, function(err, post) {
          if (!(err != null) && (post != null)) {
            return socket.emit("feed", ejs.render(fs.readFileSync("" + viewsRoot + "/feed/_post.ejs", "utf8"), {
              locals: {
                post: post,
                formatDate: formatDate
              }
            }));
          } else {
            return console.error("************************** ERROR: " + err);
          }
        });
      });
      socket.on("message", function(message) {
        return console.log("Client sent a message through websockets: " + (json.parse(message)));
      });
      return socket.on("disconnect", function() {
        return redisClient.quit();
      });
    });
  };
}).call(this);
