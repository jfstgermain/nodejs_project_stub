module.exports.registerRoutes = (app, mongoose) ->
  User = mongoose.model "User"
  
  # Middelwares    
  # Route for '/user/routeName'
  app.get "/user/new.:format?", (req, res) ->
    #req.flash('error', 'email sent');
    res.render "user/edit", {
      layout: "layout_no_rightnav",
      title: "Create Account"
    }

  # Route for '/user/save'
  app.post "/user.:format?", (req, res) ->
    user = new User(req.body.user)
    
    user.save (err) ->
      if (!err) console.log("Success!")
      else req.flash("error", "Can't save!");

      res.render "index", {
        title: "A Title"
      }
     
  app.post "/user/login.:format?", (req, res) ->
  ###
    User.findOne { "email": req.body.username, "password": req.body.password } (err, user) ->
      if user?
        req.session.regenerate ->
          req.session.user = user
          res.redirect "/feed"
      else
        req.session.error = "Authentication failed, please check your username and password."
  ###
