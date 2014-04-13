/**
 * DiscoverController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */ 

module.exports = {

	getDiscovery: function( req, res, next ){
			Discover.find({user:req.session.User.id}).populate('song').exec(function getDiscoveries(err,songs){
            console.dir(songs);
        });

	},

	addDiscovery: function (req, res, next) { //Alex
		song=req.param('song');
        song["user"]=req.session.User.id;
        console.dir(song);

        Discover.create(song).exec(function discoveryAdded(err, song){
        	console.log(err);
        	console.log(song);
        });
	},

	showDiscovery: function (req, res, next) {
		Discover.find({user: req.session.User.id}).populate('song').exec(function discoveryDisplay(err,discoveries){
			if(err) return next(err);
			console.dir(discoveries);
			// res.view({
			// 	discoveries: discoveries,
			// 	layout:"layout_mobile"
			// });
			return res.view('playlistMobile/partials/discovery',{
				discoveries:discoveries,
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