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
			req.session.flash = { err : [{name:'fieldRequired',message:'Please enter an url to join a playlist.'}] };
			return res.redirect('/mobile/playlist');
	    }

	    PlaylistDesktop.findOneByUrl(playlistUrl).exec(function findCb(err, found){
	    	if(err){return res.redirect('/mobile/playlist');};
	    	// Si la playlist n'existe pas, on s'arrête
	    	if(!found){
	    		console.log("join failed!");
				req.session.flash = { err : [{name:'fieldRequired',message:'Please enter a valid code.'}] };

				// Log des actions
				sails.controllers.log.info(req, res, next , {action:"JOIN", type:"PLAYLIST", info:"INVALID_CODE"});

				return res.redirect('/mobile/playlist');
	    	}

	    	else{

		    	// Ajoute l'utilisateur à la collection (table) JOIN
				Join.find({ where: {playlist: playlistUrl} }).populate('user').exec(function callback(err,results){
					if(err) return next(err);
					if(results){
						//sails.log.info("results Join.find().populate('playlist',{playlist:playlistUrl})");
						//console.dir(results);

						results[0].user.add(req.session.User.id);
						results[0].save(function(err, s){
							if(err) return next(err);
							sails.log.info("results save : ");
							console.dir(s);

							// Log des actions
							sails.controllers.log.info(req, res, next , {action:"JOIN", type:"PLAYLIST", info:playlistUrl});

						  	sails.sockets.broadcast(playlistUrl, 'message' , {
						    	verb 	: "add",
						    	device 	: "desktop",
						    	info 	: "userJoined",
						    	data 	: { id:req.session.User.id, firstname: req.session.User.firstname, image: req.session.User.image }
						    });

						    // Redirection vers l'affichage de la playlist
		       				res.redirect('/mobile/playlist/'+playlistUrl);

						});

					}
					else{
						console.log('PlaylistMobileController.js / join : pas de result');
						//res.redirect('/mobile/playlist/'+playlistUrl);
					}
				});

	    	}

	   	});



    },

    show:function(req,res,next){
    	var playlistUrl = req.param('url');

    	if(playlistUrl){
	        // Affichage de la playlist
				PlaylistDesktop.findOneByUrl(playlistUrl).exec(function(err,playlist){
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

				    PlaylistDesktop.find({url:playlist.url}).populate('songs').exec(function getSongs(err,songs){

			    		// console.dir(songs);

			    		// return res.json({playlist:songs});
			    		sails.log(songs);
			    		res.view({
								playlist: playlist,
								songs:songs,
								room:playlistUrl,
								layout: "layout_mobile"
							});
				    });

				    // console.dir(playlist);
				    // sails.sockets.broadcast(playlistUrl, 'message' , {
				    // 	verb 	: "add",
				    // 	device 	: "desktop",
				    // 	info 	: "userJoined",
				    // 	data 	: { firstname: req.session.User.firstname, image: req.session.User.image }
				    // });


				});
			}

		else{
			res.view({
				layout: "layout_mobile"
			});
		}

	}

};
