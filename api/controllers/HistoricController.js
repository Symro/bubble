/**
 * HistoricController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

	getHistoric: function( req, res, next ){
		var userId = req.session.User.id;

		// récupère les url playlist dans lequel il a participé
		Join.find({ user:userId }).populate('playlist').sort('playlistUrl ASC').exec(function foundUserHistoric(err, historic){
			var historic;
			var fullHistoric = historic;

			if (err) return next(err);

			if (!historic){
				historic = {};
			}

			results = [];

			// récupère les utilisateurs de chaque playlist
			historic.forEach(function (doc, i){
				// récupère les utilisateurs ayant rejoint les mêmes playlist que l'utilisateur connecté
        Join.find({playlistUrl : doc.playlistUrl}).populate('user').sort('playlistUrl ASC').exec( function foundUsersHistoric(err,users){
        	// Pour chaque utilisateur on l'ajoute au JSON dans la bonne playlist
            fullHistoric[i].users = users;

            // On récupère les songs de chaque playlist
            Song.find({url:doc.playlistUrl}).populate('user').exec(function foundPlaylistSongs(err,song){
          		fullHistoric[i].songs=song;
          		// Quand tout est fini, on retourne le JSON final
	            if(i == historic.length-1){
								// return res.json({
								// 	historic:fullHistoric
								// });
								return res.view('playlistMobile/partials/historic',{
									historic:fullHistoric,
									layout: null
								});
           		}
            });

       	});

      });

			// return res.json({
			// 	historic:historic
			// });

			// return res.view('playlistMobile/partials/historic',{
			// 	historic:historic,
			// 	layout: null
			// });

		});


	}

	// // Retourne la liste des participants à une playlist Bubble
	// joinedUsers: function(req, res, next){

	// 	Join.findByPlaylistUrl( req.param('url') ).populate('user').exec(function foundJoinedUsers(err, users){

	// 		if (err) return next(err);
	// 		if (!users) return next();

	// 		console.log('on est là ! *findByPlaylistUrl* sur du : ');

	// 		return res.json({joinedUsers:users});

	// 	});

	// },


	// // Un participant vient d'arriver sur une room
	// joined: function(req, res, next){

	// 	var playlistUrl = req.param('url');

	// 	req.socket.join(playlistUrl);
	// 	req.socket.broadcast.to(playlistUrl).emit('message', {thisIs: 'Hey Im new !! _______theMessage'});

	// 	res.json({
	// 		joined:true,
	//     	success: true
	//     });

	// }


};