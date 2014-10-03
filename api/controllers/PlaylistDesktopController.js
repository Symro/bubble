/**
 * PlaylistDesktopController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

	createRoom: function(req,res,next){

		//res.view(); // équivaut à res.view('playlistDesktop/index');
		res.view('playlistDesktop/create_room');

	},

	index: function(req,res,next){

		console.log('affichage de la playlist : '+req.param('url'));
		//console.dir(req);
		var playlistUrl = req.param('url');
		var joinedUsers;

		PlaylistDesktop.findOneByUrl(playlistUrl,function foundPlaylistDesktop(err,playlist){
			if (err) return next(err);
			// Handler Erreur en cas d'URL incorrect rentrée manuellement
			if (!playlist){
				req.session.flash={
					err:[{name:'playlistDoesntExist',message:'This playlist doesn\'t exist. Please create a new one.'}]
				}
		     	return res.redirect('/desktop/playlist');
		    }

			// Ajoute l'utilisateur à la collection (table) JOIN
			Join.findOrCreate({ playlist:playlistUrl }, { playlist:playlistUrl } ).exec(function callback(err,results){
				if(err) return next(err);
				if(results){

					Join.find({ where : { playlist: playlistUrl} }).populate("user").exec(function(err, joined){
						// Ajout des utilisateurs dans la variable destinée au template
						joinedUsers = joined[0].user;

						var userAlreadyExists = _.where(joinedUsers, function(chr) {  return chr.id == req.session.User.id;   });
						sails.log.info("PlaylistDesktopController / index : userAlreadyExists length : "+userAlreadyExists.length);

						if(userAlreadyExists.length != 0){
							sails.log.info("PlaylistDesktopController / index : userAlreadyExists log : ");
							console.dir(userAlreadyExists[0]);

							// On compte le nombre de morceaux présents dans la playlist qu'on vient de rejoindre
							// (en cas d'url direct)
				       		Song.find().populate('url').where({url:playlistUrl}).populate('user').exec(function countSongs(err, songs){
								if (err) return next(err);

								console.log("Nb de song dans la playlist : "+songs);
								// S'il n'y a aucun morceau, on informe le desktop que songs est null
								console.log(typeof(songs));

								// On check l'host de la playlist
								sails.controllers.song.checkHostPlaylist(req, res, next);

								sails.log.info("PlaylistDesktopController / index : joinedUsers log : ");

						    	return res.view('playlistDesktop/index',{
									playlist 	: playlist,
									joinedUsers : joinedUsers,
									room 		: playlistUrl,
									songs 		: songs
								});

							});
						}
						else{
							sails.log.warn("PlaylistDesktopController / index : userDoesn't exist !");
							sails.log.info("PlaylistDesktopController / index : ajout ds table JOIN !");

							results.user.add(req.session.User.id);
							results.save(function(err, s){
								if(err) return next(err);
								
								joinedUsers = s.user;

								// On compte le nombre de morceaux présents dans la playlist qu'on vient de rejoindre
								// (en cas d'url direct)
					       		Song.find().populate('url').where({url:playlistUrl}).populate('user').exec(function countSongs(err, songs){
									if (err) return next(err);

									console.log("Nb de song dans la playlist : "+songs);
									// S'il n'y a aucun morceau, on informe le desktop que songs est null
									console.log(typeof(songs));

									// On check l'host de la playlist
									sails.controllers.song.checkHostPlaylist(req, res, next);

							    	return res.view('playlistDesktop/index',{
										playlist 	: playlist,
										joinedUsers : joinedUsers,
										room 		: playlistUrl,
										songs 		: songs
									});

								});

							});


						}	

					});

				}
				else{
					sails.log.warn("PlaylistDesktopController / index : ELSE !! ..........");
				}
				
			}); // FIN -- CheckJoined.exec
		}); // FIN -- PlaylistDesktop.findOneByUrl
	},

	create: function(req,res,next){

		if(req.param('playlist_name')==""){
			console.log('playlist_name is empty');

			var fieldsRequired=[{name:'fieldsRequired',message:'Please enter a name for the playlist.'}]
			req.session.flash={
				err:fieldsRequired
			}
	     	return res.redirect('/desktop/playlist');

		}
		else{
				// génère une short url
		    	var keylist="abcdefghijklmnopqrstuvwxyz123456789";
				var temp="";
				for (i=0;i<4;i++){
					temp+=keylist.charAt(Math.floor(Math.random()*keylist.length))
				};

				var playlistObj={
					name:req.param('playlist_name'),
					url:temp,
					host:req.session.User.id
				};

			// création de la Playlist en BDD
			PlaylistDesktop.create(playlistObj,function playlistDesktopCreated(err,playlistdesktop){
				if (err){
					var error=[{name:'error',message:'try again'}];
					req.session.flash={
						err:error
					};
					return res.redirect('/desktop/playlist');
				}

				// console.log('playlist added : '+playlistObj.name);
				// console.log('url redirection : /desktop/playlist/'+temp);

				// Log des actions
				sails.controllers.log.info(req, res, next , {action:"CREATE", type:"PLAYLIST"});

				return res.redirect('/desktop/playlist/'+temp);

			});
		}

	}


};
