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
        console.log(playlist);
        res.view({
			layout: "layout_mobile"
		});

	},

	join:function(req,res,next){
	    console.log('join playlist url : '+req.param('playlist_url'));
	    var playlistUrl = req.param('playlist_url');

	    // Si le champ n'est pas remplit
		if( playlistUrl == "" ){
			req.session.flash = { err : [{name:'fieldRequired',message:'Please enter a url to join a playlist.'}] };
			return res.redirect('/mobile/playlist');
	    }

	    PlaylistDesktop.findOneByUrl(playlistUrl).exec(function findCb(err, found){
	    	if(err){return res.redirect('/mobile/playlist');};
	    	// Si la playlist n'existe pas, on s'arrête
	    	if(!found){
	    		console.log("join failed!");
				req.session.flash = { err : [{name:'fieldRequired',message:'Please enter a valid code.'}] };
				return res.redirect('/mobile/playlist');
	    	}

	    	else{

		    	// Ajoute l'utilisateur à la collection (table) JOIN
				// S'il n'est pas déjà présent
				CheckJoined = Join.findOneByPlaylistUrl(playlistUrl);
				CheckJoined.where({'user':req.session.User.id});
				CheckJoined.exec(function callback(err,results){
					if(err) return next(err);
					if(!results){
						Join.create({
							user:req.session.User.id,
							playlistUrl:playlistUrl,
							playlist:playlistUrl
						}).exec(function cb(err,created){
						  console.log('User : '+req.session.User.id+' ( '+req.session.User.firstname+' ) --> Joined : '+playlistUrl);

						  	sails.sockets.broadcast(playlistUrl, 'message' , {
						    	verb 	: "add",
						    	device 	: "desktop",
						    	info 	: "userJoined",
						    	data 	: { firstname: req.session.User.firstname, image: req.session.User.image }
						    });

						    // Redirection vers l'affichage de la playlist
		       				res.redirect('/mobile/playlist/'+playlistUrl);
						});
					}
					else{
						res.redirect('/mobile/playlist/'+playlistUrl);
					}
				});
			    
	    	}

	   	});

		

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
			    // envoie d'une socket au desktop pour prévenir
			    // de l'arrivée d'un nouveau participant
			    console.log('envoie socket à la room !');

			    // sails.sockets.broadcast(playlistUrl, 'message' , {
			    // 	verb 	: "add",
			    // 	device 	: "desktop",
			    // 	info 	: "userJoined",
			    // 	data 	: { firstname: req.session.User.firstname, image: req.session.User.image }
			    // });

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
