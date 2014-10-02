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

	addDiscovery: function (req, res, next) {
        var songId          = req.param('song');
        var roomId          = req.param('room');
        var songInitialUser = req.param('songInitialUser');
        var userId          = req.session.User.id;

        // Préparation des champs à ajouter en BDD
        var ajout = {
          song            : songId,
          user            : userId,
          songInitialUser : songInitialUser
        }

        Discover.create(ajout).exec(function discoveryAdded(err, song){

            if(err){            
                // Log des actions
                //sails.controllers.log.info(req, res, next , {action:"ADD", type:"DISCOVER", info:"FAILED"});

                return next(err);
            }

            // Log des actions
            sails.controllers.log.info(req, res, next , {action:"ADD", type:"DISCOVER", info:"SUCCESS"});

            sails.sockets.broadcast(roomId,'message',{
                verb:'update',
                device:'desktop',
                info:'songLiked',
                datas:{}
            });

            return res.json({error:false, message:"ok"});

        });

	},

	showDiscovery: function (req, res, next) {

		Discover.find({ where: { user: req.session.User.id } }).populateAll().exec(function(err,discoveries){
			if(err) return next(err);

            //console.log("showDiscovery");
            //console.dir(discoveries);

            return res.view('playlistMobile/partials/discovery',{
              discoveries:discoveries,
              layout: null
            });

		});
    
	},

	deleteDiscovery: function (req,res,next){
		var discoveryId = req.param('id');

        console.log("DiscoverController.js / deleteDiscovery : Suppression de "+discoveryId);

		Discover.destroy({ id:discoveryId }).exec(function discoveryDestroyed(err,song) {
        	if (err){
                // Log des actions
                sails.controllers.log.info(req, res, next , {action:"REMOVE", type:"DISCOVER", info:"FAILED"});
                // Retourne une erreur
                return res.json({
                    status:"error",
                    id:discoveryId
                });
            }

            // Log des actions
            sails.controllers.log.info(req, res, next , {action:"REMOVE", type:"DISCOVER", info:"SUCCESS"});

            // Retourne un succès + id découverte à supprimer
            return res.json({
                status:"ok",
                id:discoveryId
            });

        });
	}


};