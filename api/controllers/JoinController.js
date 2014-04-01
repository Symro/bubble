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

			console.log('on est là ! *findByPlaylistUrl* sur du : ');

			return res.json({joinedUsers:users});

		});

	},


	// Un participant vient d'arriver sur une room
	joined: function(req, res, next){

		var playlistUrl = req.param('url');

		req.socket.join(playlistUrl);
		req.socket.broadcast.to(playlistUrl).emit('message', {thisIs: 'Hey Im new !! _______theMessage'});

		res.json({
			joined:true,
	    	success: true
	    });

	}


};