/**
 * PlaylistDesktopController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

	// Retourne la liste des participants à une playlist Bubble
	joinedUsers: function(req, res, next){

		Join.findByPlaylistUrl( req.param('url') ,function foundJoinedUsers(err,users){
			if (err) return next(err);
			if (!users) return next();

			console.log('on est là ! *findByPlaylistUrl*');


			return res.json({users:users});
			//console.dir(users);
			//res.json({users:users});

			// res.view('playlistDesktop/index',{
			// 	users: users
			// });

		});


	}


};