/**
 * LogController
 *
 * @description :: Server-side logic for managing Logs
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	// Permet d'ajouter aux log des infos concernant l'utilisateur
	info: function(req, res, next, log){

		// Exemple d'utilisation du LogController : 
		//
		//  // Log des actions
		// 	sails.controllers.log.info(req, res, next , {action:"LOGIN", type:"USER", info:"SUCCESS"});
		//
		//	IMPORTANT :
		//
		// >> le 4è paramètre est un objet ayant au minimum une action de type string ayant une valeur spécifique (voir api/models/Log.js)
		// >> les autres paramètres (type et info) sont optionnels et de type string (voir api/models/Log.js pour utiliser les bonnes valeurs)
		//


		if(log && log.action && req.session && res.locals.ua){

			log.type 	= (log.type) 	? log.type 		: "";
			log.info 	= (log.info) 	? log.info 		: "";

			var params = {
				  	user: 	req.session.User.id,
				  	action: log.action,
				  	type: 	log.type,
				  	info: 	log.info,
				  	ip: 	res.locals.ua.ip,
				  	browser:res.locals.ua.browser,
				  	version:res.locals.ua.version,
				  	device: res.locals.ua.device,
				  	os: 	res.locals.ua.os
			}

			Log.create( params ,function log(err,user){
	    		if (err){ console.log("Erreur LogController");	}
				//return next();
			});

		}
		else{
			console.log("Erreur LogController - Paramètres manquants REQ / RES / LOG ?");
		}

	},
	
};

