(function() {
  module.exports.registerRoutes = function(app, mongoose) {
    var User;
    User = mongoose.model("User");
    app.get("/user/new.:format?", function(req, res) {
      return res.render("user/edit", {
        layout: "layout_no_rightnav",
        title: "Create Account"
      });
    });
    app.post("/user.:format?", function(req, res) {
      var user;
      user = new User(req.body.user);
      return user.save(function(err) {
        if ((!err)(console.log("Success!"))) {
          ;
        } else {
          req.flash("error", "Can't save!");
          return res.render("index", {
            title: "A Title"
          });
        }
      });
    });
    return app.post("/user/login.:format?", function(req, res) {});
    /*
        User.findOne { "email": req.body.username, "password": req.body.password } (err, user) ->
          if user?
            req.session.regenerate ->
              req.session.user = user
              res.redirect "/feed"
          else
            req.session.error = "Authentication failed, please check your username and password."
      */
  };
}).call(this);
