module.exports.registerCollections = function(mongoose) {
	// The User collection
	var User = new mongoose.Schema({
		first_name: String,
		last_name: String,
		password: String,
		email: {type: String, unique: true},
		aliases: [Alias],
		salt: String,
		location: [Location],
		favHashtags: [String]
	});
	/*
	User.static({
		loadUser: function() {
			
		}
	});*/

	//mongoose.model('User', User);
	module.exports['User'] = mongoose.model('User', User);
	
	// The Post collection
	var Post = new mongoose.Schema({
		author: mongoose.Schema.ObjectId, /* User ref */
		title: String,
		body: String,
		publicComments: [Comment],
		privateComments: [Comment],
		streamId: String,
		hashtags: [String],
		places: [String],
		dateCreated: {type: Date, index: true},
	});
	
	Post.virtual('bodyHead').get(function() {
		return "toto";
	});

	Post.method({
		splitBody: function(length) {
			var textTuple = {head: "", tail: ""};
			var charcount = 0;
			var tokens = this.body.split(" ");
	
			if (this.body.length > length) {
				for (var i = 0; i < tokens.length && charcount <= length; i++) {
					charcount = charcount + tokens[i].length;
					textTuple.head += (" " + tokens.shift());
				}
	
				textTuple.tail = tokens.join(" ");
			} else {
				textTuple.tail = this.body;
			}
	
			return textTuple;
		}
	});
}
