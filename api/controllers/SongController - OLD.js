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

        // ---------- INFORMATON COMPORTEMENT ACTUEL SongController.js / Août 2014 ----------- 
        // 
        // 1) ON RECUPERE LE MORCEAU LE PLUS RECENT DE LA PLAYLIST EN COURS (pour connaitre son status de lecture)
        //
        // 2) ON AJOUTE LE NOUVEAU MORCEAU A LA PLAYLIST
        //
        // 3) ON COMPTE LE NOMBRE DE MORCEAU ACTUELLEMNT PRÉSENT
        //      >> Si le status 1) était à played ==> la musique était terminée ==> on relance le player
        //      >> Si il n'y a qu'1 seul morceau dans la playlist ==> on lance le player pour la 1ère fois
        //
        // 4) ON ENVOIE LES INFORMATIONS VIA SOCKET AUX DESKTOP + MOBILE
        // 

        Song.findOne({url:req.route.params.url}).sort('createdAt DESC').exec(function getSongs(err, lastSong){
            if(err){
                console.log("SongController > Song.findOne() > ERREUR");
                return next(err);
            }

            if (songFromBubble != undefined) {
                console.log('ajout par histo');
                var song    = songFromBubble;
                var img     = '/images/icon_music.png';
                // console.dir(songFromBubble);
            }else{
                console.log('ajout normal');
                var song    = req.param('song');
                var img     = req.param('img');
            }

            var d = new Date();

            song.user       = req.session.User.id;
            song.url        = req.route.params.url;
            song.songStatus = "waiting";
            song.createdAt  = d.toISOString();

            if(song["songService"] == "deezer"){
                song["songTrackDuration"] = song["songTrackDuration"]*1000;
            }

            Song.create(song).exec(function songAdded(err,added){
                if(err) return next(err);
                // console.dir(err);
                // console.dir('Song ajouté');
                // console.dir(added)
                var songId = added.id;
                var newTrack = added;

                Song.count({url: req.route.params.url}).exec(function countSongs(err, found){
                    console.log("Nb de song dans la playlist : "+found);


                    if (lastSong && lastSong.songStatus=="played") {
                        sails.controllers.song.restartPlayer(req, res, next , added);
                    }


                    // Si c'est le premier morceau, on informe le desktop qu'il doit lancer le player
                    if(found == 1){
                        console.log("songId : "+songId);
                        // mais avant on met à jour le status du morceau

                        // /!\ IMPOSSIBLE D'UPDATE UN SON PAR RAPPORT A SON _id -- (Aout 2014)
                        //    | ALTERNATIVE | > union de caractéristiques qui permette de trouver 1 seule morceau 
                        //    | TEMPORAIRE  | >  ==> date d'ajout + user + url playlist = 1 morceau unique identifié..?

                        var whereParams = { user: newTrack.user, url: req.route.params.url, createdAt: newTrack.createdAt };

                        Song.update({songStatus:"waiting"}, {songStatus:"playing"}).where(whereParams).exec(function statusUpdated(err, song){
                            if(err) return next(err);

                            console.log("SONG CONTROLLER - ADD ");

                            if(song){

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
                                    datas:{test:"test"} // temp ! normalement, datas:{}
                                });

                            }

                        });

                    }

                });


              	User.findOne(req.session.User.id).exec(function getImage(err,user){
              		if(err) return next(err);

    				// Ajout DOM mobile
    				sails.sockets.broadcast(req.param('url'),'message',{
    					verb:'add',
    					device:'mobile',
    					info:'songAdded',
    					datas:{song:song, userImg:user.image}
    				});

    				// Ajout DOM desktop
    				sails.sockets.broadcast(req.param('url'),'message',{
    					verb:'add',
    					device:'desktop',
    					info:'songAdded',
    					datas:{song:song, id:added.id, img:img, userImg:user.image}
    				});

              	});

            }); // Fin Song.create(song)


        }); // Fin Song.findOne(...)

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
        var position           = req.param("position");
        var duration           = req.param("duration");
        var currentPlaylist    = req.param("currentPlaylist");
        var room               = req.param('url');

        sails.sockets.broadcast(room,'message',{
            verb:   'update',
            device: 'mobile',
            info:   'playerPosition',
            datas:{
                position:position,
                duration:duration,
                currentPlaylist: currentPlaylist
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