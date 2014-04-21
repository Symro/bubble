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
        var img=req.param('img');

        // console.dir(song);

        Song.create(song).exec(function songAdded(err,added){
          // console.dir(err);
          // console.dir('Song ajouté');
          // console.dir(added)
          var songId = added.id;

          Song.count({url: req.route.params.url}).exec(function countSongs(err, found){
            console.log("Nb de song dans la playlist : "+found);
            // Si c'est le premier morceau, on informe le desktop qu'il doit lancer le player
            if(found == 1){
                // mais avant on met à jour le status du morceau
                Song.update({songStatus:"waiting"},{songStatus:"playing"}).where({id: songId}).exec(function statusUpdated(err, song){
                    if(err) return next(err);

                    sails.sockets.broadcast(req.route.params.url,'message',{
                        verb:'add',
                        device:'desktop',
                        info:'startPlaying',
                        datas:song[0]
                    });

                });


            }

          });

          // Ajout DOM mobile
          sails.sockets.broadcast(req.param('url'),'message',{
            verb:'add',
            device:'mobile',
            info:'songAdded',
            datas:{song:song}
          });

          // Ajout DOM desktop
          sails.sockets.broadcast(req.param('url'),'message',{
            verb:'add',
            device:'desktop',
            info:'songAdded',
            datas:{song:song,id:added.id,img:img}
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

            // Suppression DOM^mobile
            sails.sockets.broadcast(req.route.params.url,'message',{
                verb:'delete',
                device:'mobile',
                info:'songRemoved',
                datas:{songTrackId:songId}
            });

            // Supression DOM desktop
            sails.sockets.broadcast(req.route.params.url,'message',{
                verb:'delete',
                device:'desktop',
                info:'songRemoved',
                datas:{songTrackId:songId}
            });

        });
    },


    nextSong:function(req, res, next){

        var songId = req.params.all().id;
        var room   = req.param('url');
        console.log("SongId : "+songId+" room : "+room);

        Song.update({songStatus:"playing"},{songStatus:"played"}).where({id: songId}).exec(function statusUpdated(err, song){
            if(err) return next(err);

            Song.findOne({ where:{ url:room, songStatus:"waiting" } }).sort('createdAt ASC').limit(1).done(function(err, song) {
                // Error handling
                if (err) return next(err);

                console.log("Le morceau suivant est : ", song);

                song.songStatus = "playing";
                song.save(function(err) {
                    if(err) return next(err);

                    return res.json(song);
                    // sails.sockets.broadcast(room,'message',{
                    //     verb:'add',
                    //     device:'desktop',
                    //     info:'startPlaying',
                    //     datas:song
                    // });
                });


            });

        });

        //return res.json(test);

    }



};