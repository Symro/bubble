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
		song=req.param('song');
        song["user"]=req.session.User.id;
        console.dir(song);

        Discover.create(song).exec(function discoveryAdded(err, song){
        	console.log(err);
        	console.log(song);
        });
	},

	showDiscovery: function (req, res, next) {
		Discover.find({user: req.session.User.id}).populate('song').exec(function discoveryDisplay(err,discoveries){
			if(err) return next(err);

			var fullDiscoveries = discoveries;

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
                	// Pour chaque utilisateur on l'ajoute au JSON
                    fullDiscoveries[i].song.userInfo = users[0];
                    // Quand tout est fini, on retourne le JSON final
                    if(i == discoveries.length-1){
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
		Song=req.song.id;
		console.log(songId);
		Song.destroy(req.param('id'), function discoveryDestroyed(err,song) {
        	if (err) return next(err);
        });


	}

};