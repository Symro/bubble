/**
 * SongController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

    add:function(req, res, next, songFromHistoric){
        // Log son à ajouter
        // console.dir(req.params.all());
        // console.dir(req.param('song'));

        // req.sessoin.id
        // req.param.url
        if (typeof songFromHistoric != undefined) {
            var song=songFromHistoric;
            var img='/images/icon_music.png';
        }else{
            var song     = req.param('song');
            var img=req.param('img');
        }

        song["user"] = req.session.User.id;
        song["url"]  = req.route.params.url;

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

        Song.update({songStatus:"playing"},{songStatus:"played"}).where({id: songId, url: room}).exec(function statusUpdated(err, song){
            if(err) return next(err);

            Song.findOne({ where:{ url:room, songStatus:"waiting" } }).sort('createdAt ASC').limit(1).done(function(err, song) {
                // Error handling
                if (err) return next(err);

                console.log("Le morceau suivant est : ", song);

                // S'il y a un morceau suivant à lire en BDD, on retourne le json qui lancera la lecture
                if(typeof(song) != "undefined"){

                    song.songStatus = "playing";
                    song.save(function(err) {
                        if(err) return next(err);

                        sails.sockets.broadcast(req.route.params.url,'message',{
                            verb:'update',
                            device:'mobile',
                            info:'resetLikeDislike',
                            datas:{}
                        });

                        return res.json(song);
                    });

                }
                else{
                    var song = {songStatus:"undefined"};
                    return res.json(song);
                }



            });

        });
    },

    playerPosition:function(req, res, next){
        var position           = req.params.all().position;
        var duration           = req.params.all().duration;
        var currentPlaylist    = req.params.all().currentPlaylist;
        var room               = req.param('url');

        sails.sockets.broadcast(room,'message',{

            verb:'update',
            device:'mobile',
            info:'playerPosition',
            datas:{
                position:position,
                duration:duration,
                currentPlaylist : currentPlaylist
            }

        });

    },

    dislikeSong:function(req, res, next){

        var room  = req.param('url');
        var song  = req.param('song'); // BDD id ! et pas songTrackId

        Song.findOne({ where:{ id:song } }).done(function(err, song) {

            song.songCounter = parseInt(song.songCounter)+1;
            song.save(function(err) {
                if(err) return next(err);

                sails.sockets.broadcast(req.route.params.url,'message',{
                    verb:'update',
                    device:'desktop',
                    info:'songDisliked',
                    datas:{}
                });

                return res.json(song);
            });

        });

    },

    addFromBubble:function(req,res,next){
        console.log('add from historic');
        var songId=req.param('song');
        console.dir(req.param);

        Song.findOneBySongTrackId(songId).exec(function(err,song){
            if(err) return next(err);
            // console.dir(song);
            sails.controllers.song.add(req,res,next,song);
        });

    }

};