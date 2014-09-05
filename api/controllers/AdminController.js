/**
 * AdminController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');

module.exports = {


	show: function(req, res, next) {
	    User.findOne(req.param('id'), function foundUser(err, user) {
			if (err) return next(err);
			
			if (!user) return next();
			res.view({
				user: user,
				layout: "layout_admin"
			});
	    });
	},

	index:function(req,res,next){

		var user_obj 	 = {};
		var song_obj 	 = {};
		var playlist_obj = {};
		var room_obj 	 = {};

		// REQUETE UTILISATEUR
		User.find().exec(function foundUsers(err,users){
			if (err) return next(err);

			user_obj.nb 	= users.length; // Nombre d'utilisateur en BDD
			user_obj.detail = users;		// Détails de chaque utilisateur

			// REQUETE PLAYLIST
			PlaylistDesktop.find().exec(function foundPlaylist(err, playlists){

				playlist_obj.nb   = playlists.length;		   // Nombre de playlist en BDD
				playlist_obj.uniq = _.uniq(playlists , 'host').length; // Nombre d'utilisateur ayant créé au moins 1 playlist


				// REQUETE SONS
				Song.find().exec(function foundPlaylist(err, songs){

					song_obj.nb = songs.length; // Nombre de morceau en BDD

					
						// REQUETE ROOMS / SOCKETS
					    //room_obj.nb = JSON.stringify(sails.sockets.rooms());
					    
						res.view({
							users: 		user_obj,
							playlists: 	playlist_obj,
							songs: 		song_obj,
							rooms: 		room_obj,
							me: 		req.session.User,
							layout: 	"layout_admin"
						});

				});


			});
		
		});

    },


    /* PARTIE UTILISATEURS */

	user:function(req,res,next){

		User.find(function foundUsers(err,users){
			if (err) return next(err);
			res.view({
				moment:moment, // Export de moment pour formater les dates
				users:users,
				layout: "layout_admin"
			});
		});

    },


    /* PARTIE ACTIVITÉS */

	activity:function(req,res,next){

		User.find(function foundUsers(err,users){
			if (err) return next(err);
			res.view({
				users:users,
				layout: "layout_admin"
			});
		});
		
    },


    /* PARTIE MESSAGES */

	message:function(req,res,next){

		User.find(function foundUsers(err,users){
			if (err) return next(err);
			res.view({
				users:users,
				layout: "layout_admin"
			});
		});
		
    }

	
};

