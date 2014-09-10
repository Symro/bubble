/**
 * AdminController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');
var fs     = require('fs');

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

		var d = new Date();
		d.setDate(d.getDate() - 1);

		Log.find(
			{ createdAt: 
				{ '>': new Date(new Date().setDate(new Date().getDate()-1)),
				  '<': new Date(new Date())
				}, sort:"createdAt DESC" 
			}).populate("user").exec(function foundUsers(err,logs){

				// console.dir(logs);

				if (err) return next(err);
				res.view({
					moment:moment,
					activity:logs,
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
		
    },





    /* PARTIE ADMIN USERS */

    userShow: function(req,res,next){

    	var id = req.param('id');
    	var user_obj = {};

    	if(!id){ return next(err); }

    	// Retrouve l'utilisateur
		User.findOne({ id: id }).exec(function foundUsers(err,user){
			if (err) return next(err);

			user_obj.infos = {
				id			: user.id,
				firstname	: user.firstname,
				mail		: user.mail,
				grade 		: user.grade,
				status		: user.status,
				image		: user.image

			}
			user_obj.moment = moment; // on passe le require("moment.js") pour l'utiliser dans la vue

			var user_photos_folder 	= "upload/user/"+user.firstname+"-"+user.id+"/";
			var user_photos_300, 
				user_photos_date;

			// On essaie de lire le dossier contenant les photos de l'utilisateur
			try {
				var user_photos_files = fs.readdirSync(user_photos_folder);
			} catch (e) {
			  	// Oups il y a une erreur
			  	console.log("Impossible de lire le dossier !")
			}
	
			if(user_photos_files){
				// on trie les photos des plus récentes aux plus anciennes
				// on ne garde que les photos 300px
				// on récupère la première partie du nom de l'image qui contient le timestamp
				user_photos_files = _(user_photos_files).reverse().value();
				user_photos_300  = _.remove(user_photos_files, function(file) { return file.indexOf("-300.") != -1; });
				user_photos_date = _.map(user_photos_300, function(file){ return parseInt(file.substring(0, parseInt(file.indexOf("-")))); });
			}else{
				user_photos_300 = user_photos_date = undefined;
			}
			
			user_obj.dir_photos  = user_photos_folder; // chemin dossier des photos
			user_obj.date_photos = user_photos_date;   // dates des photos au format Unix Timestamp
			user_obj.photos 	 = user_photos_300;	   // tableau contenant les noms complets des photos	

			// Retouve les playlists que l'utilisateur a créé
			PlaylistDesktop.find({ host: id }).exec(function foundUserPlaylist(err,playlists){
				if (err) return next(err);
				user_obj.nb_playlists 	= playlists.length;
				user_obj.playlists 	 	= playlists;

				// Retouve les playlists que l'utilisateur a rejoint
				Join.find({ user: id }).exec(function foundUserPlaylist(err,joined){
					if (err) return next(err);
					user_obj.nb_joined 	= joined.length;
					user_obj.joined 	= joined;


					Log.find({ where : { user: id }, sort:"createdAt DESC" }).exec(function logUser(err, log){
						if (err) return next(err);
						// Nombre de connexion au site
						user_obj.nb_login = _.find(log, function(chr) {
						  return chr.action == "LOGIN" && chr.action == "SUCCESS";
						});
						// Activité de l'utilisateur
						user_obj.activity = log;

						// Appel de la vue "show.ejs" avec toutes les infos qu'il faut
				    	res.view("admin/user/show" ,{
							user: user_obj,
							layout: "layout_admin"
						});

					});

				});

			});

		});




    },


    userEdit: function(req,res,next){

    	var id = req.param('id');
    	var user_obj = {};

    	if(!id){ return next(err); }

    	// Modification des info de l'utilisateur
    	if(req.method == "POST"){

    		var firstname 	= req.param("form-firstname");
    		var mail 		= req.param("form-mail");
    		var image 		= req.param("form-image");
    		var grade 		= req.param("form-grade");
    		var password 	= req.param("form-password");

    		var values = (password.length < 6 || password == "") ? {firstname:firstname,mail:mail,image:image,grade:grade} : {firstname:firstname,mail:mail,image:image,grade:grade,password:password};

    		User.update({ id: id }, values).exec(function afterwards(err,updated){
				if (err) { return next(err); }
				console.log('Updated user');

			  	// Redirection vers la page d'edition
	    		res.redirect("/admin/user/edit/"+id);
			});

    	}
    	else{

	    	// Retrouve l'utilisateur
			User.findOne({ id: id }).exec(function foundUsers(err,user){
				if (err) return next(err);

				user_obj.infos = {
					id			: user.id,
					firstname	: user.firstname,
					mail		: user.mail,
					grade		: user.grade,
					status 		: user.status,
					image		: user.image
				}
				user_obj.moment = moment; // on passe le require("moment.js") pour l'utiliser dans la vue

				// Appel de la vue "show.ejs" avec toutes les infos qu'il faut
		    	res.view("admin/user/edit" ,{
					user: user_obj,
					layout: "layout_admin"
				});

	    	});

		}



    },

   	userDelete: function(req,res,next){
   		var id = req.param('id');
    	var user_obj = {};

    	if(!id){ return next(err); }

    	User.findOne({ id: id }).exec(function user(err,user){
    		var status = (user.status == 1) ? 0 : 1;

		   	User.update({ id: id }, {status: status}).exec(function afterwards(err,updated){
				if (err) { return next(err); }

			  	// Redirection vers la page d'edition
	    		res.redirect("/admin/user/");
			});

	   	});

   	}

	
};

