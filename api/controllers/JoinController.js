/**
 * JoinController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

	// Retourne la liste des participants à une playlist Bubble
	joinedUsers: function(req, res, next){

		Join.findByPlaylistUrl( req.param('url') ).populate('user').exec(function foundJoinedUsers(err, users){

			if (err) return next(err);
			if (!users) return next();

			console.log('on est là : JoinController.js > joinedUsers >> *findByUrl*  ');

				return res.json({joinedUsers:users});

		});

	},


	// Un participant vient d'arriver sur une room
	joined: function(req, res, next){

		var playlistUrl = req.param('url');

		req.socket.join(playlistUrl);
		req.socket.broadcast.to(playlistUrl).emit('message', {thisIs: 'Hey je viens d\'arriver ! :D'});

		// Subscribes client to ONLY the update events for every `User` record.
	    User.find({}).exec(function(e,listOfUsers){
	        User.subscribe(req.socket, listOfUsers, 'update');
	        console.log('User with socket id '+req.socket.id+' is now subscribed ');
	    });

		Song.count({url: req.route.params.url}).exec(function countSongs(err, found){

			console.log("JoinController.js / joined >> Nb de song dans la playlist : "+found);
			res.json({
				joined:true,
		    	success: true,
		    	count:found
	    	});

		});
	}


};