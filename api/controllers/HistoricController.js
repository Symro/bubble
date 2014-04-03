/**
 * HistoricController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

	getHistoric: function( req, res, next ){

		// récupère les url playlist dans lequel il a participé
		Join.find().populate('user').where({ 'user' : req.param('userId') }).populate('playlist').exec(function foundUserHistoric(err, historic){
			var historic;

			if (err) return next(err);

			if (!historic){
				historic = {};
			}

			//return res.json({historic:historic});

			return res.view('playlistMobile/partials/historic',{
				historic:historic,
				layout: null
			});

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