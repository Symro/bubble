/**
 * JoinController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

	// Retourne la liste des participants à une playlist Bubble
	joinedUsers: function(req, res, next){
		var url = req.param('url');

		if(url){

			Join.find({ playlist: req.param('url') }).populate('user').exec(function foundJoinedUsers(err, users){

				if (err) return next(err);
				if (!users) return next();

				console.log('on est là : JoinController.js > joinedUsers >> *findByUrl*  ');
				console.dir(users);

				return res.json({joinedUsers:users});

			});

		}

	},


	// Un participant vient d'arriver sur une room
	joined: function(req, res, next){
		var playlistUrl = req.param('url');

		console.dir(req.param('device'));

		// On vérifie que la demande a bien été faite par Socket
		if(req.isSocket === true){

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
	}


};