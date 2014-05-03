/**
 * SongController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

    add:function(req, res, next, songFromBubble){
        // Log son à ajouter
        // console.dir(req.params.all());
        // console.dir(req.param('song'));

        // req.sessoin.id
        // req.param.url
        Song.findOne({url:req.route.params.url}).sort('createdAt DESC').exec(function getSongs(err, lastSong){

            if (songFromBubble != undefined) {
                console.log('ajout par histo');
                var song=songFromBubble;
                var img='/images/icon_music.png';
                // console.dir(songFromBubble);
            }else{
                console.log('ajout normal');
                var song = req.param('song');
                var img=req.param('img');
            }

            song["user"] = req.session.User.id;
            song["url"]  = req.route.params.url;
            song.songStatus="waiting";
            var d=new Date();
            song.createdAt=d.toISOString();

            // console.dir(song);
            sails.log(song);
            Song.create(song).exec(function songAdded(err,added){
              // console.dir(err);
              // console.dir('Song ajouté');
              // console.dir(added)
              var songId = added.id;

              Song.count({url: req.route.params.url}).exec(function countSongs(err, found){
                console.log("Nb de song dans la playlist : "+found);


                if (lastSong && lastSong.songStatus=="played") {
                    sails.controllers.song.restartPlayer(req, res, next , added);
                }


                // Si c'est le premier morceau, on informe le desktop qu'il doit lancer le player
                if(found == 1){
                    // mais avant on met à jour le status du morceau
                    Song.update({songStatus:"waiting"},{songStatus:"playing"}).where({id: songId}).exec(function statusUpdated(err, song){
                        if(err) return next(err);

                        // affichage player sur desktop + lancement du son (1er son ajouté de toute la playlist)
                        sails.sockets.broadcast(req.route.params.url,'message',{
                            verb:'add',
                            device:'desktop',
                            info:'startPlaying',
                            datas:song[0]
                        });

                        // affichage player sur mobile
                        sails.sockets.broadcast(req.route.params.url,'message',{
                            verb:'update',
                            device:'mobile',
                            info:'showPlayer',
                            datas:{}
                        });

                    });


                }

              });


              	User.findOne(song.user).exec(function getImage(err,imgUser){
              		if(err) return next(err);
    				// Ajout DOM mobile
    				sails.sockets.broadcast(req.param('url'),'message',{
    					verb:'add',
    					device:'mobile',
    					info:'songAdded',
    					datas:{song:song,userImg:imgUser.image}
    				});

    				// Ajout DOM desktop
    				sails.sockets.broadcast(req.param('url'),'message',{
    					verb:'add',
    					device:'desktop',
    					info:'songAdded',
    					datas:{song:song,id:added.id,img:img,userImg:imgUser.image}
    				});
              	});

            });
        });

    },

    remove:function(req,res,next){

        // Récupération id song
        var songId  = String(req.param('song'));
        var service = req.param('service');

        Song.findOneBySongTrackId(songId).exec(function FindSong (err, song) {
            if (err) return next(err);
            // Can delete only waiting songs
            if (song.songStatus === 'waiting') {

                // Suprresion du son ciblé
                Song.destroy({songTrackId:songId, songService:service ,url:req.route.params.url}).exec(function getSong(err,song){
                    console.log("song supprimé !");
                    // console.dir(song);

                    // Suppression DOM mobile
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

            }
        });
    },


    nextSong:function(req, res, next){

        var songId = req.param('id');
        var room   = req.param('url');
        console.log("SongId : "+songId+" room : "+room);

        if(typeof(songId) != "undefined"){

            Song.update({songStatus:"playing"},{songStatus:"played"}).where({id: songId, url: room}).exec(function statusUpdated(err, song){
                if(err) return next(err);
                console.log("SONG UPDATE playing > played where songId & room : "+song);

                Song.findOne({ where:{ url:room, songStatus:"waiting" } }).sort('createdAt ASC').exec(function(err, song2) {
                    // Error handling
                    if (err) return next(err);

                    console.log("SONG FINDONE > played where songId & room : "+song2);

                    // S'il y a un morceau suivant à lire en BDD, on retourne le json qui lancera la lecture
                    if(typeof(song2) != "undefined"){

                        song2.songStatus = "playing";
                        song2.save(function(err) {
                            if(err) return next(err);

                            sails.sockets.broadcast(req.route.params.url,'message',{
                                verb:'update',
                                device:'mobile',
                                info:'resetLikeDislike',
                                datas:song2
                            });

                            return res.json(song2);
                        });

                    }
                    else{
                        var song2 = {songStatus:"undefined"};
                        return res.json(song2);
                    }



                });

            });

        }

    },

    restartPlayer:function(req, res, next, song){

        song.songStatus = "playing";
        song.save(function(err) {
            if(err) return next(err);

            sails.sockets.broadcast(req.route.params.url,'message',{
                verb:'update',
                device:'mobile',
                info:'resetLikeDislike',
                datas:song
            });

            sails.sockets.broadcast(req.route.params.url,'message',{
                verb:'add',
                device:'desktop',
                info:'startPlaying',
                datas:song
            });

            return res.json(song);
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

        Song.findOne({ where:{ id:song } }).exec(function(err, song) {

            song.songCounter = parseInt(song.songCounter)+1;
            song.save(function(err) {
                if(err) return next(err);


                sails.sockets.broadcast(req.route.params.url,'message',{
                    verb:'update',
                    device:'desktop',
                    info:'songDisliked',
                    datas:{
                        subscribers: sails.sockets.subscribers(room),
                        user:{
                            firstname:req.session.User.firstname,
                            image:req.session.User.image
                        }
                    }
                });

                return res.json(song);


            });

        });

    },

    addFromBubble:function(req,res,next){
        console.log('add from historic');
        var songId=req.param('song');
        console.log("___addFromBubble songId : "+songId);

        Song.findOneBySongTrackId(songId).exec(function(err,song){
            if(err) return next(err);
            console.dir(song);
            sails.controllers.song.add(req,res,next,song);
        });

    }

};