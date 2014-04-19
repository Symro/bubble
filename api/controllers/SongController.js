/**
 * SongController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

    add:function(req, res, next){
        // Log son à ajouter
        // console.dir(req.params.all());
        // console.dir(req.param('song'));

        // req.sessoin.id
        // req.param.url
        var song     = req.param('song');
        song["user"] = req.session.User.id;
        song["url"]  = req.route.params.url;

        // console.dir(song);

        Song.create(song).exec(function songAdded(err,added){
          // console.dir(err);
          console.dir('Song ajouté');
          // console.dir(added)

          Song.count({url: req.route.params.url}).exec(function countSongs(err, found){
            console.log("Nb de song dans la playlist : "+found);
            // Si c'est le premier morceau, on informe le desktop qu'il doit lancer le player
            if(found == 1){
                sails.sockets.broadcast(req.route.params.url,'message',{
                    verb:'add',
                    device:'desktop',
                    info:'startPlaying',
                    datas:song
                });
            }

          });

          // Ajout DOM sur mobile
          sails.sockets.broadcast(req.route.params.url,'message',{
            verb:'add',
            device:'mobile',
            info:'songAdded',
            datas:{song:song}
          });

        });

    },

    remove:function(req,res,next){

        // Récupération id song
        songId=Number(req.param('song'));

        // Suprresion du son ciblé
        Song.destroy({songTrackId:songId,url:req.route.params.url}).exec(function getSong(err,song){
            console.log("song supprimé !");
            // console.dir(song);

            // Suppression DOM
            sails.sockets.broadcast(req.route.params.url,'message',{
                verb:'delete',
                device:'mobile',
                info:'songRemoved',
                datas:{songTrackId:songId}
            });
        });
    }

};