/**
 * SongController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

    // Vérifie que l'host (l'utilisateur connecté sur desktop) est bien le créateur de la Bubble Room.
    checkHostPlaylist:function(req, res, next){

        PlaylistDesktop.findOneByUrl(req.route.params.url).exec(function(err, playlist){
            if(err) return next(err);

            if(playlist){
                var hostId = playlist.host;
                var userId = req.session.User.id;

                if(hostId === userId){
                    console.log("Vous êtes le créateur de la playlist");
                    console.log("APPEL de checkSongStatus");
                    sails.controllers.song.checkSongStatus(req, res, next);
                }
                else{
                    console.log("Cette playlist n'est pas la votre");
                }

            }

        });


    },

    // Vérifie en BDD les morceaux de la playlist
    checkSongStatus: function(req, res, next){
        
        Song.find({url : req.route.params.url}).sort({ createdAt: 'asc'}).exec(function(err, songs){
            if(err) return next(err);

            var songsWithStatusPlaying = _.where(songs, function(chr) {  return chr.songStatus == "playing";  });
            var songsWithStatusWaiting = _.where(songs, function(chr) {  return chr.songStatus == "waiting";  });
            var songsWithStatusPlayed  = _.where(songs, function(chr) {  return chr.songStatus == "played";   });

            sails.log.info("Il y a "+ songsWithStatusPlaying.length +" morceau(x) en lecture");
            sails.log.info("Il y a "+ songsWithStatusWaiting.length +" morceau(x) en attente");
            sails.log.info("Il y a "+ songsWithStatusPlayed.length  +" morceau(x) déjà joués");


            
            // AUCUN MORCEAU EN LECTURE
            if(songsWithStatusPlaying.length == 0){
                sails.log.info("Pas de morceau en cours de lecture dans la playlist");

                // VÉRIFICATION DES MORCEAUX EN ATTENTE
                if(songsWithStatusWaiting.length > 1){
                    console.log(songsWithStatusWaiting.length+" en attente... on devrait lancer un morceau non..?");

                    sails.controllers.song.waiting2playing(songsWithStatusWaiting, req.route.params.url);

                }


            }


            // 1 MORCEAU EN LECTURE !? on lance/relance le player
            else if(songsWithStatusPlaying.length == 1){
                sails.log.info("1 morceau en cours de lecture dans la playlist");

                setTimeout(function(){
                    console.log("SongController.js / checkSongStatus : Reprise de la playlist à l'endroit où elle s'été arrêtée");

                    console.dir(songsWithStatusPlaying);
                    // affichage player sur desktop + lancement du son (1er son ajouté de toute la playlist)
                    sails.sockets.broadcast(req.route.params.url,'message',{
                        verb:'add',
                        device:'desktop',
                        info:'startPlaying',
                        datas:songsWithStatusPlaying[0]
                    });

                }, 2000);

            }


            // PLUS D'1 MORCEAU EN LECTURE.. Lancement de la réparation
            else if(songsWithStatusPlaying.length > 1){
                sails.log.warn("SongController.js / checkSongStatus : quelque chose ne va pas !");
                console.log("APPEL de playing2waiting");
                sails.controllers.song.playing2waiting(songsWithStatusPlaying, req.route.params.url);
            }


        });


    },

    // Permet de réparer une playlist qui contiendrait plusieurs morceaux en lecture (songStatus à "playing")
    // @songs : OBJECT contenant les morceaux avec toutes les données
    // @url   : STRING contenant l'url de la playlist
    playing2waiting: function(songs, url){

        if(songs && typeof(songs) == "object"){
            // Extrait le premier élement du tableau (qui doivent être triés par date >> .sort({ createdAt: 'asc'}) )
            songToPlay = songs.shift(); 

            // console.log(typeof(songToPlay));
            // console.dir(songToPlay);

            // Récupère uniquement les ID des songs à réparer et retourne un tableau des valeurs
            var songToConvert = _.pluck(songs, 'id');

            // console.log(typeof(songToConvert));
            // console.dir(songToConvert);

            if(songToConvert){
                // Modifie les morceaux de "playing" à "waiting"
                Song.update({ id : songToConvert }, { songStatus : "waiting" }).exec(function(err, songsConverted){
                    sails.log.info(songsConverted.length + " morceaux réparées");
                    
                    setTimeout(function(){
                        console.log("SongController.js / playing2waiting : Reprise de la playlist à l'endroit où elle s'été arrêtée");

                        // affichage player sur desktop + lancement du son (1er son ajouté de toute la playlist)
                        sails.sockets.broadcast(url ,'message',{
                            verb:'add',
                            device:'desktop',
                            info:'startPlaying',
                            datas:songToPlay[0]
                        });
                    },2000);

                });

            }
        }
        else{
            sails.log.warn("SongController.js / playing2waiting : paramètres vides ou invalides (!= object && string) ");
        }

    },


    // Permet de passer au morceau suivant
    // @songs : OBJECT contenant les morceaux en attente (triés du plus ancien au plus récent)
    // @url   : STRING contenant l'url de la playlist
    waiting2playing: function(songs, url){

        if(songs && typeof(songs) == "object"){
            // Extrait le premier élement du tableau (qui doivent être triés par date >> .sort({ createdAt: 'asc'}) )
            songToPlay = songs.shift(); 

            if(songToPlay){
                // Modifie les morceaux de "waiting" à "playing"
                Song.update({ id : songToPlay.id }, { songStatus : "playing" }).exec(function(err, song2Play){
                    
                    console.log("Morceau à jouer : ");
                    console.dir(song2Play);
                    return {
                        error  : false,
                        status : "converted",
                        song   : song2Play
                    }

                });

            }
            else{
                return { 
                    error  : true, 
                    status : "converting",  
                    song  : songToPlay  
                }
            }
        }
        else{
            sails.log.warn("SongController.js / waiting2playing : paramètres vides ou invalides (!= object && string) ");
            
            return {
                error  : true,
                status : "converting",
                song   : undefined
            }
        }

    },

    // Permet de passer un morceau au status "joué"
    // @songs : OBJECT contenant l'ID du morceau en lecture
    // @url   : STRING contenant l'url de la playlist
    playing2played: function(song, url){

        if(song && typeof(song) == "object"){

            // Modifie les morceaux de "playing" à "played"
            Song.update({ id : song.id }, { songStatus : "played" }).exec(function(err, songPlayed){
                if(err) return next(err);
                
                console.log("Morceau qui a été joué : ");
                console.dir(songPlayed);

                return {
                    error  : false,
                    status : "converted",
                    song   : songPlayed
                }

            });

        }
        else{
            sails.log.warn("SongController.js / playing2played : paramètres vides ou invalides (!= object && string) ");

            return {
                error  : true,
                status : "converting",
                song   : undefined
            }

        }

    },





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
                console.log('SongController.js / add : Ajout par historic ou discoveries');
                // Assigne les propriétés du morceau à la variable song
                var song    = songFromBubble;
                // Supprimer la propriété ID qui doit être générée par MongoDB
                delete song['id'];
                // Assigne une image par défaut
                var img     = '/images/icon_music.png';

                console.dir(songFromBubble);
            }
            else{
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

            // Passe le morceau du status Playing à Played
            Song.update({songStatus:"playing"},{songStatus:"played"}).where({id: songId, url: room}).exec(function statusUpdated(err, song){
                if(err) return next(err);
                console.log("SongController.js / nextSong : UPDATE playing > played");


                //console.log("APPEL checkSongStatus");
                //sails.controllers.song.checkSongStatus(req, res, next);


                Song.findOne({ where:{ url:room, songStatus:"waiting" } }).sort('createdAt ASC').exec(function(err, song2) {
                    if (err) return next(err);

                    console.log("SongController.js / nextSong : SONG FINDONE");

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

        var room    = req.param('url');
        var songId  = req.param('song'); // BDD id ! et pas songTrackId

        Song.findOne({ where:{ id:songId } }).populate("songDislike").exec(function(err, song) {

            // Stock les utilisateurs ayant disliké
            var dislikeUsers = song.songDislike;
            // Recherche si l'utilisateur connecté en fait parti
            var userAlreadyDislike = _.where(dislikeUsers, function(chr) {  return chr.id == req.session.User.id;   });

            // L'utilisateur a déjà voté !
            if(userAlreadyDislike.length != 0){
                console.log("SongController.js / dislikeSong : Tu as déjà voté !");
                return res.json({
                    "error": true,
                    "info" : "AlreadyDislike"
                });
            }
            // Ajoute le dislike au morceau en cours
            else{

                song.songDislike.add(req.session.User.id);
                song.save(function(err, s){
                    if(err) return next(err);

                    // Récupère la liste à jour des utilisateurs ayant disliké
                    Song.findOne({ where:{ id:songId } }).populate("songDislike").exec(function(err, songAfterSaved) {

                        // Envoie d'une socket de dislike
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

                        /* TO DO */
                        /*
                        retourner que les infos utiles 
                        (firstname, id, image) rien de plus ! */


                        console.log("SongController.js / dislikeSong : song");
                        console.dir(songAfterSaved.songDislike);

                        return res.json({
                            "error": false,
                            "info" : "OK",
                            "datas": songAfterSaved.songDislike
                        });

                    });

                });

            }




        });

    },

    addFromDiscoveries:function(req,res,next){
        var songId = req.param('song');

        console.log('SongController.js / addFromDiscoveries '+ songId);

        Song.findOne(songId).exec(function(err,song){
            if(err) return next(err);

            console.dir(song);
            sails.controllers.song.add(req,res,next,song);
            
        });

    }

};