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
        var room = req.param('room');
        var ajout = {};
        ajout.song = req.param('song');
        ajout.user = req.session.User.id;

        Discover.create(ajout).exec(function discoveryAdded(err, song){
        	if(err) return res.json({error:true, message:err});

            sails.sockets.broadcast(room,'message',{
                verb:'update',
                device:'desktop',
                info:'songLiked',
                datas:{}
            });

        	return res.json({error:false, message:"ok"});
            
        });
	},

	showDiscovery: function (req, res, next) {

		Discover.find().where({user:req.session.User.id}).populate('song').exec(function discoveryDisplay(err,discoveries){
			if(err) return next(err);

			var fullDiscoveries = discoveries;

			var nbDiscoveries1 = discoveries.length;
			var nbDiscoveries2 = nbDiscoveries1-1;

			// Somme du nombre d'itération dans la boucle
			var addition = (nbDiscoveries1*nbDiscoveries2)/2;
			var additionBoucle = 0;

			if (err) return next(err);

			if (discoveries.length == 0){
				return res.view('playlistMobile/partials/discovery',{
					discoveries:{},
					layout: null
				});
			}


			// récupère les info d'utilisateur qui avait ajouté le morceau
			discoveries.forEach(function (doc, i){

                User.find({
                    id : doc.song.user
                }).exec( function foundUsersHistoric(err,users){
                	if(err) return next(err);

                	// Pour chaque utilisateur on l'ajoute au JSON
                    fullDiscoveries[i].song.userInfo = users[0];
                    additionBoucle += i;
                    // Quand tout est fini, on retourne le JSON final
                    if(additionBoucle == addition){
						return res.view('playlistMobile/partials/discovery',{
							discoveries:fullDiscoveries,
							layout: null
						});
	               	}
               	});

            });

		});
	},

	deleteDiscovery: function (req,res,next){
		console.log("on est ds deleteDiscovery");
		var discoveryId= req.param('id');

		Discover.destroy({ id:discoveryId }).exec(function discoveryDestroyed(err,song) {
        	if (err) return next(err);
        	console.log("suppression de : " );
        	console.dir(song);

        	sails.sockets.broadcast(req.route.params.url,'message',{
                verb:'delete',
                device:'mobile',
                info:'discoveryRemoved',
                datas:{discoveryId:discoveryId}
            });

        });
	}


};