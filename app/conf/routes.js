module.exports.registerRoutes = function(app, mongoose){
    var fs = require("fs"), 
    files = fs.readdirSync("./app/routes");
	for (var index in files) {
		// If [ it's a javascript file ] Then [ process the routes ]
		if (files[index].endsWith(".js")) {
		  console.log("Registering route: " + files[index]);
			require("../routes/" + files[index]).registerRoutes(app, mongoose);
		}
	}
};

