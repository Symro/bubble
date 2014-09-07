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
			// (s'il n'est pas déjà présent)
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
						if(err) return next(err);
					  	console.log('User : '+req.session.User.id+' ( '+req.session.User.firstname+' ) --> Joined : '+playlistUrl);

						// Récupère la liste des participants à la room pour transmettre à la vue
					  	Join.findByPlaylistUrl( playlistUrl ).populate('user').exec(function foundJoinedUsers(err, users){
							if (err) return next(err);
							if (!users){ joinedUsers = {}	}
							else{ joinedUsers = users;		}

							// On compte le nombre de morceaux présents dans la playlist qu'on vient de rejoindre
							// (en cas d'url direct)
			        Song.find().populate('url').where({url:playlistUrl}).populate('user').exec(function countSongs(err, songs){
								console.log("Nb de song dans la playlist : "+songs);
								// S'il n'y a aucun morceau, on informe le desktop que songs est null
								console.log(typeof(songs));

						    return res.view('playlistDesktop/index',{
									playlist 	: playlist,
									joinedUsers : joinedUsers,
									room 		: playlistUrl,
									songs 		: songs
								});


								});

						});

					});
				}

				else{

					// Récupère la liste des participants à la room pour transmettre à la vue
					// ... bon ok ici on se répète..
				  	Join.findByPlaylistUrl( playlistUrl ).populate('user').exec(function foundJoinedUsers(err, users){
						if (err) return next(err);
						if (!users){ joinedUsers = {}	}
						else{ joinedUsers = users;		}

							// On compte le nombre de morceaux présents dans la playlist qu'on vient de rejoindre
							// (en cas d'url direct)
					        Song.find().populate('url').where({url:playlistUrl}).populate('user').exec(function countSongs(err, songs){
								console.log("Nb de song dans la playlist : "+songs);
								// S'il n'y a aucun morceau, on informe le desktop que songs est null
								console.log(typeof(songs));

							    return res.view('playlistDesktop/index',{
									playlist 	: playlist,
									joinedUsers : joinedUsers,
									room 		: playlistUrl,
									songs 		: songs
								});


							});

					});

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
