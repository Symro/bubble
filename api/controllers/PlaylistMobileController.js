/**
 * PlaylistMobileController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

	index:function(req,res,next){

		// res.view({
		// 	layout: "layout_mobile"
		// }); // équivaut à res.view('playlistMobile/index');

        //res.view(); // équivaut à res.view('playlistMobile/index');
        res.view({
			layout: "layout_mobile"
		});

	},

	join:function(req,res,next){
	    console.log('join playlist url : '+req.param('playlist_url'));
	    var playlistUrl = req.param('playlist_url');

	    // Si le champ n'est pas remplit
		if( playlistUrl == "" ){
			console.log('url is empty');

			var fieldRequired=[{name:'fieldRequired',message:'Please enter a url to join a playlist.'}];

			req.session.flash={
				err:fieldRequired
			};

			return res.redirect('/mobile/playlist');
	    }

    	// Ajoute l'utilisateur à la collection (table) JOIN
		// S'il n'est pas déjà présent
		CheckJoined = Join.findOneByPlaylistUrl(playlistUrl);
		CheckJoined.where({'user':req.session.User.id});
		CheckJoined.exec(function callback(err,results){
			if(err) return next(err);
			if(!results){
				Join.create({
					user:req.session.User.id,
					playlistUrl:playlistUrl
				}).exec(function cb(err,created){
				  console.log('User : '+req.session.User.id+' ( '+req.session.User.firstname+' ) --> Joined : '+playlistUrl);
				});
			}
		});
	    
        // Redirection vers l'affichage de la playlist
        res.redirect('/mobile/playlist/'+playlistUrl);
    },

    show:function(req,res,next){
    	var playlistUrl = req.param('url');

    	if(playlistUrl){
	        // Affichage de la playlist
			PlaylistDesktop.findOneByUrl(playlistUrl,function foundPlaylistDesktop(err,playlist){
				if (err) return next(err);
				if (!playlist){
					req.session.flash={
						err:[{name:'playlistDoesntExist',message:'This playlist doesn\'t exist. Please try again.'}]
					}
			     	return res.redirect('/mobile/playlist/');
			    }
				res.view({
					playlist: playlist,
					room:playlistUrl,
					layout: "layout_mobile"
				});
			});
		}

		else{
			res.view({
				layout: "layout_mobile"
			});
		}

	}

};
