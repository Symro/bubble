/**
 * app.js
 *
 * This file contains some conventional defaults for working with Socket.io + Sails.
 * It is designed to get you up and running fast, but is by no means anything special.
 *
 * Feel free to change none, some, or ALL of this file to fit your needs!
 */


window.isMobile  = ($("body").hasClass('mobile'))  ? true : false;
window.isDesktop = ($("body").hasClass('desktop')) ? true : false;


(function (io) {

  // as soon as this file is loaded, connect automatically,
  var socket = io.connect();
  if (typeof console !== 'undefined') {
    log('Connecting to Sails.js...');
  }

  socket.on('connect', function socketConnected() {

    console.log("This is from the connect: ", this.socket.sessionid);

    // Listen for Comet messages from Sails
    socket.on('message', function messageReceived(message) {


      // '''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
      // /!\ A LIRE ! /!\
      // .......................................................................................

      // Un message arrivera d'un contrôleur avec les infos suivantes :
      // __ VERB doit être soit : get (obtenir), add (ajouter), update (modifier), delete (supprimer)
      // __ DEVICE doit être : desktop, mobile, all
      // __ INFO : information de ce qu'il se passe (écrit en CamelCase please!)
      // __ DATA : un JSON de préférence pour manipuler ensuite en jQuery et insérer dans le DOM

      // EXEMPLE
      // message =  {
      //      verb    : "add",
      //      device  : "desktop",
      //      info    : "userJoined",
      //      data    : { firstname: req.session.User.firstname, image: req.session.User.image }
      // }


      // log('New comet message received :: ', message);

      messageReceivedFromServer(message);

    });


    // Ecouteur pour les Publish de la table 'User'
    socket.on('user',function(obj){
      console.dir(obj);

      if (obj.verb == 'updated') {

        if(obj.data.type == "image"){

          var message = {
            device:"all",
            info:"imageUpdated",
            datas:obj.data
          };

          updateInDom(message);

        }

        console.log('PublishUpdate socket.on("user") !');

      }
      
    });

    // Rejoindre la room avec son socket ID
    if(typeof(user) != "undefined" && user.room != "false"){
      var device = (isDesktop === true) ? "desktop" : "mobile";
      socket.get('/desktop/playlist/'+user.room+'/joined', { device:device }, function(response) {
        console.log(response);
      });
    }


    ///////////////////////////////////////////////////////////
    // Here's where you'll want to add any custom logic for
    // when the browser establishes its socket connection to
    // the Sails.js server.
    ///////////////////////////////////////////////////////////
    // log(
    //     'Socket is now connected and globally accessible as `socket`.\n' +
    //     'e.g. to send a GET request to Sails, try \n' +
    //     '`socket.get("/", function (response) ' +
    //     '{ console.log(response); })`'
    // );
    ///////////////////////////////////////////////////////////


  });

  // Expose connected `socket` instance globally so that it's easy
  // to experiment with from the browser console while prototyping.
  window.socket = socket;


  // Simple log function to keep the example simple
  function log () {
    if (typeof console !== 'undefined') {
      console.log.apply(console, arguments);
    }
  }


})(

  // In case you're wrapping socket.io to prevent pollution of the global namespace,
  // you can replace `window.io` with your own `io` here:
  window.io

);


var currentPlaylist;

function messageReceivedFromServer(message){


    if (message.verb === 'add') {
      // console.log('envoi message');
      addInDom(message);
    }
    if (message.verb === 'delete') {
      //console.log('envoi suppression message');
      removeInDom(message);
    }
    if (message.verb === 'update') {
      //console.log("message recu pour de l'update");
      updateInDom(message);
    }



}

// FONCTON DE ROUTAGE DU DOM
function addInDom(message){
    switch (message.device) {
      case 'desktop': if(isDesktop) { addInDesktopDom(message); }
                      break;
      case 'mobile' : if(isMobile)  { addInMobileDom(message);  }
                      break;
      case 'all'    : addInAllDom(message);
                      break;
    }
}
function removeInDom(message){
    switch (message.device) {
      case 'desktop': if(isDesktop) { removeInDesktopDom(message); }
                      break;
      case 'mobile' : if(isMobile)  { removeInMobileDom(message);  }
                      break;
      case 'all'    : removeInAllDom(message);
                      break;
    }
}
function updateInDom(message){
    switch (message.device) {
      case 'desktop': if(isDesktop) { updateInDesktopDom(message); }
                      break;
      case 'mobile' : if(isMobile)  { updateInMobileDom(message);  }
                      break;
      case 'all'    : updateInAllDom(message);
                      break;
    }
}

// --------------------------------------
// PLAYER DESKTOP
// --------------------------------------

  if(isDesktop){

    // REGLAGES SOUNDMANAGER PLAYER
    soundManager.setup({
      // path to directory containing SM2 SWF
      url: '/swf/',
      debugFlash: false,
      
      onready: function(){
        console.log('soundManager est pret ! ');
        //player();
      },
      ontimeout: function() {
        // console.log('SM2 init failed!');
      },
      defaultOptions: {
        // set global default volume for all sound objects
        volume: 100
      }

    });

    /* LIVE BUBBLE - PLAYER POSITION */

    // var get_player_position_timer;

    // // Lance le Timer d'envoie de la position du lecteur
    // function get_player_position(position, duration){
    //   stop_send_player_position(); // on clear le timer avant de le relancer
    //   get_player_position_timer = setInterval(function(){ send_player_position(position, duration); }, 1000);
    // }

    // // Envoie par socket l'instant ds le morceau en lecture, et la durée totale du morceau
    // function send_player_position(position, duration){
    //   socket.post('/desktop/playlist/'+user.room+'/playerPosition' , {
    //       position : (position) ? position : 0,
    //       duration : (duration) ? duration : 0,
    //       currentPlaylist : currentPlaylist
    //     }, function(response){
    //       console.log("send_player_position SOCKET to room : "+user.room);
    //       console.log(response);
    //   });
    // }

    // // Arrêter l'envoie de la position du player desktop au mobile chaque seconde
    // function stop_send_player_position(){
    //   clearInterval(get_player_position_timer);
    // }



    // /* GESTION PLAYER SOUNDMANAGER - DESKTOP */
    // function player(new_track){
    //   console.log(">> function player(new_track)");

    //   var player_circle = $(".player_circle");
    //   var player_timing = $(".player_timing");

    //   if(new_track){
    //     console.log(">> function player(new_track) > IF ! :) ");
    //     console.log(">> Lecture d'un nouveau morceau : "+new_track.songTrackName);
        
    //     $('li[data-db-id="'+new_track.id+'"]').prevAll("li").addClass('played');

    //     $('.player_track_name').html(new_track.songTrackName);
    //     $('.player_track_artist').html(new_track.songTrackArtist);

    //     // Création du cercle de progression
    //     player_circle.knob({
    //       "release" : function (value) {
    //         var minutes = Math.floor(value / 60);
    //         var secondes = value - minutes * 60;
    //         var zero = (secondes < 10)? "0" : "";
    //         player_timing.html(minutes+"’"+zero+secondes);
    //       }
    //     });

    //     var songURL = "";
    //     // Change l'url dynamiquement et joue le morceau
    //     switch (new_track.songService) {
    //       case 'soundcloud' : 
    //         songURL = "http://api.soundcloud.com/tracks/"+new_track.songTrackId+"/stream?client_id=933d179a29049bde6dd6f1c2db106eeb";
    //       break;
    //       case 'spotify' : 
    //         songURL = new_track.songSongUrl;
    //       break;
    //       case 'deezer' : 
    //         songURL = new_track.songSongUrl;
    //       break;
    //     }

    //     window.playerDesktop = soundManager.createSound({
    //       id: 'bubble_player',
    //       autoLoad: true,
    //       // useful for URLs without obvious filetype extensions
    //       url: songURL,

    //       whileplaying: function(){

    //         player_circle.val( (this.position/1000).toFixed(2) ).trigger('change');
    //         player_circle.trigger(
    //             'configure',{
    //                 "min":0,
    //                 "max":(this.duration/1000).toFixed(2)
    //             }
    //         );

    //         send_player_position( (this.position/1000).toFixed(2) , (this.duration/1000).toFixed(2) );

    //         // console.log( (this.position/1000).toFixed(2) );
    //         // console.log( (this.duration/1000).toFixed(2) );
    //         // console.log( this.id );
    //         //soundManager._writeDebug('sound '+this.id+' playing, '+this.position+' of '+this.duration);
    //       },
    //       //onplay:   function(){ get_player_position( (this.position/1000).toFixed(2) , (this.duration/1000).toFixed(2) ); },
    //       //onresume:   function(){ get_player_position( (this.position/1000).toFixed(2) , (this.duration/1000).toFixed(2) ); },
    //       //onpause:  function(){ stop_send_player_position(); }

    //     });


    //     soundManager.play('bubble_player',{
    //       onfinish: function() {
    //         alert('The sound '+this.id+' finished playing.');
    //         playerDesktop.destruct();
    //         next_song();
    //       }
    //     });

    //     $('.player_play_pause').on("click", function(){
    //       $(this).toggleClass("paused");
    //       soundManager.togglePause('bubble_player');
    //     });

    //     $("#test_1").on("click",function(e){
    //       // Place le player à 2sec de la fin
    //       playerDesktop.setPosition(playerDesktop.duration-2000);
    //     });

    //   }
    //   else{
    //     console.log(">> function player(new_track) > ELSE");
    //   }

    // }


    /* GESTION PLAYER SOUNDMANAGER - DESKTOP */
    function PlayerDesktop(new_track){
      var player_circle       = $(".player_circle");
      var player_timing       = $(".player_timing");
      var player_track_name   = $(".player_track_name");
      var player_track_artist = $(".player_track_artist");

      this.init = function(){
        var that = this;
        that.initDone = false;

        // Création du cercle de progression
        console.log('playerDesktop >> init');
        if(player_circle.length){
          player_circle.knob({
            "release" : function (value) {
              var minutes = Math.floor(value / 60) || 0;
              var secondes = value - minutes * 60  || 0;
              var zero = (secondes < 10)? "0" : "";
              player_timing.html(minutes+"’"+zero+secondes);

              
            }
          });

          that.initDone = true;
        }
      }

      this.playSoundCloud = function(track){
        console.log('playerDesktop >> playSoundCloud');
        var that = this;

        // On check si le cercle Knob est initialisé.
        if(!this.initDone){
          this.init();
        }

        window.playerDesktop = soundManager.createSound({
          id: 'bubble_player',
          autoLoad: true,
          // useful for URLs without obvious filetype extensions
          url: "http://api.soundcloud.com/tracks/"+track.songTrackId+"/stream?client_id=933d179a29049bde6dd6f1c2db106eeb",

          whileplaying: function(){
            //console.log(this);

            player_track_artist.text(track.songTrackArtist);
            player_track_name.text(track.songTrackName);

            that.updatePosition({
              position: this.position, 
              duration: this.duration
            });

          }
          //onplay:   function(){ get_player_position( (this.position/1000).toFixed(2) , (this.duration/1000).toFixed(2) ); },
          //onresume:   function(){ get_player_position( (this.position/1000).toFixed(2) , (this.duration/1000).toFixed(2) ); },
          //onpause:  function(){ stop_send_player_position(); }

        });

        soundManager.play('bubble_player',{
          onfinish: function() {
            alert('The sound '+this.id+' finished playing.');
            playerDesktop.destruct();
            next_song();
          },
          onload: function() {

            if (this.readyState == 2) {
              // TODO
              alert("Désolé, ce morceau est introuvable sur le serveur");
              playerDesktop.destruct();
              next_song();
            }
          }

        });

        // Pause du lecteur
        $('.player_play_pause').on("click", function(){
          $(this).toggleClass("paused");
          soundManager.togglePause('bubble_player');
        });

        // Place le player à 2sec de la fin
        $("#test_1").on("click",function(e){
          playerDesktop.setPosition(playerDesktop.duration-2000);
        });

        // Permet de griser les morceaux déjà écoutés
        $('li[data-db-id="'+track.id+'"]').prevAll("li").addClass('played');


      }

      this.updatePosition = function(info){
        // réceptionne un objet content : info.position + info.duration
        // console.log('playerDesktop >> updatePosition');

        player_circle.val( (parseFloat(info.position)/1000).toFixed(2) ).trigger('change');
        player_circle.trigger(
            'configure',{
                "min":0,
                "max":(parseFloat(info.duration)/1000).toFixed(2)
            }
        );

        this.sendPosition(info);
      }

      this.sendPosition = function(info){
        // Envoie la position du player via socket pour le mobile
        // console.log('playerDesktop >> sendPosition');
        socket.post('/desktop/playlist/'+user.room+'/playerPosition' , {
            position : (info.position) ? (parseFloat(info.position)/1000).toFixed(2) : 0,
            duration : (info.duration) ? (parseFloat(info.duration)/1000).toFixed(2) : 0,
            currentPlaylist : (currentPlaylist) ? currentPlaylist : {}
          }, function(response){
            console.log("send_player_position SOCKET to room : "+user.room);
            console.log(response);
        });

      }

      // Nombre de like sur le morceau
      this.like = {
        nb    : 0,
        user  : []
      }

      // Nombre de like sur le morceau
      this.dislike = {
        nb    : 0,
        user  : []
      }


    } // Fin playerDesktop()


    var player_desktop = new PlayerDesktop();
    player_desktop.init();



  } // FIN isDestkop()



  function next_song(){

    var likeContainer    = $('.player_track_like span');
    var dislikeContainer = $('.player_track_dislike span');
    var player_track_name   = $(".player_track_name");
    var player_track_artist = $(".player_track_artist");

    console.log("Envoie socket.put avec id = "+currentPlaylist.id);
    socket.put('/desktop/playlist/'+user.room , { id: currentPlaylist.id }, function (response) {
      console.log("Reponse : ");
      console.dir(response);
      if(response.songStatus != "undefined"){
          currentPlaylist = response;

          // Remet le compteur de like & dislike à zéro
          player_desktop.like.nb = 0;
          player_desktop.dislike.nb = 0;

          // Lancement de la musique
          player_desktop.playSoundCloud(currentPlaylist);

          // currentLike = 0; TODELETE
          // currentDislike.count = 0; TODELETE
          likeContainer.text(player_desktop.like.nb);
          dislikeContainer.text(player_desktop.dislike.nb);

      }
      else{
          // Pas de son à lire dans la playlist
          console.log(" AUCUN SONG A LIRE ");
          // stop_send_player_position(); TODELETE

          // Masquage du player sur Desktop
          var playerDesktopContainer = $('.desktop-container .player');
          playerDesktopContainer.addClass('invisible');
      }

    });

  }





// --------------------------------------
// PARTIE AJOUT DANS LE DOM
// --------------------------------------

function addInDesktopDom(message){
  console.log("addInDesktopDom : ");
  console.dir(message);

  if(message.info == "userJoined"){

    $('.listeParticipant ul')
      .append('<li><img alt="'+message.data.firstname+'" src="'+message.data.image+'" data-user-id="'+message.data.id+'" /></li>')
      .parents('.listeParticipant')
      .jcarousel('reload');

  }
  else if(message.info == "startPlaying"){
    console.log("Lancer la musique !");
    console.dir(message.datas);

    // Ajoute le morceau au tableau de lecture
    currentPlaylist = message.datas;

    // Apparition du player sur Desktop et mobile
    var playerDesktopContainer = $('.desktop-container .player');
    playerDesktopContainer.removeClass('invisible');

    $('.playlistInfo').hide();

    // Lancement musique sur le player Desktop
    if(currentPlaylist.songService == "soundcloud"){
      var player_desktop = new PlayerDesktop();
      player_desktop.playSoundCloud(currentPlaylist);
    }
    else{
      console.log("Lecture d'une plateforme différente de Soundcloud.. feature COMING SOON");
    }

    // Supprime la classe "Active" des boutons pour permettre de voter à nouveau
    var $btnLike    = $('#song-like');
    var $btnDislike = $('#song-dislike');

    $btnLike.add($btnDislike).removeClass('active');



  }
  else if (message.info == "songAdded") {

    // Ajoute le morceau au tableau de lecture
    //currentPlaylist.push(message.datas.song);

    // affichage DOM
    $('#playlistencours ul').append('<li data-id="'+message.datas.song.songTrackId+'"data-db-id="'+message.datas.id+'"><div data-songService="'+message.datas.song.songService+'" data-songId="'+message.datas.song.songTrackId+'"><strong>'+message.datas.song.songTrackName+'</strong><span>'+message.datas.song.songTrackArtist+'</span></div><div><img src="'+message.datas.userImg+'" alt="" data-user-id="'+message.datas.song.user+'"></div></li>');
    // console.log('j"affiche '+message.datas.song.songTrackName);

    // cache de variable
    var player_desktop  = $('.player_bubble');
    var reception       = $('#reception');

    console.log(message.datas.img);

    // ajout de l'image dans le DOM
    $('<img>').attr('src', message.datas.img).appendTo(reception);

    // détermine la distance entre le centre du player
    // et le bord gauche de l'écran
    var player_desktop_left = player_desktop.offset().left;
    player_desktop_left += (player_desktop.width()/2);

    var player_desktop_top = player_desktop.offset().top;
    player_desktop_top += (player_desktop.height()/2);

    $('#reception').children('img').css({
      "position":"absolute",
      "left":player_desktop_left,
      "top":$(window).height()+200
    }).animate({
      "top":player_desktop_top
    }, 600, function(){
      $(this).fadeOut(3000, function(){
        $(this).remove();
      })
    });

    // Actualisation de la scroll bar
    $('#playlistencours').mCustomScrollbar("update");
    $('#playlistencours').mCustomScrollbar("scrollTo","li:last",{scrollInertia:1000,scrollEasing:"easeInOutQuad"});

  }

}

function addInMobileDom(message){
  console.log("addInMobileDom : ");
  console.dir(message);

  if (message.info=="songAdded") {

    // Calcul duree en secondes
    var minutes = Math.floor(message.datas.song.songTrackDuration / 60000);
    var secondes = Math.round( (message.datas.song.songTrackDuration - minutes * 60000)/1000 );
    var duree = minutes+"'"+secondes;


    // Si c'est l'user qui a ajouté il peut supprimer
    if (message.datas.song.user==user.id) {
      $i="<i class='icon-croixclosesuppr'></i>";
    }else{
      $i='';
    }

    var eltm = $('.song ul li').length;

    if (eltm == 0)
      var insert = '<li data-id="'+message.datas.song.songTrackId+'" data-songService="'+message.datas.song.songService+'"><div class="action delete"></div><div><strong>'+message.datas.song.songTrackName+'</strong><span>'+message.datas.song.songTrackArtist+'</span></div><div><span>'+duree+'</span><img src="'+message.datas.userImg+'"></div></li>'
    else
      var insert = '<li data-id="'+message.datas.song.songTrackId+'" data-songService="'+message.datas.song.songService+'"><div class="action delete">'+$i+'</div><div><strong>'+message.datas.song.songTrackName+'</strong><span>'+message.datas.song.songTrackArtist+'</span></div><div><span>'+duree+'</span><img src="'+message.datas.userImg+'"></div></li>'


    // affichage DOM
    $('.song ul').append(insert);

  }

}

function addInAllDom(message){
  // console.log("addInAllDom : ");
  // console.dir(message);

}


function removeInDesktopDom(message){
  // console.log("removeInDesktopDom : ");
  // console.dir(message);

  if (message.info=='songRemoved') {

    // cible la musique à supprimer
    var deleteSong = $('#playlistencours ul > li').filter('[data-id='+message.datas.songTrackId+']');

    //console.log(deleteSong);

    // slide up + suppression DOM
    deleteSong.slideUp(function(){
      // console.log($(this));
      $(this).remove();
    });

  }

}

// --------------------------------------
// PARTIE SUPPRESSION DANS LE DOM
// --------------------------------------

function removeInMobileDom(message){
  // console.log("removeInMobileDom : ");
  // console.dir(message.datas.songTrackId);

  // Suppression d'un morceau de la playlist en lecture
  if (message.info == 'songRemoved') {

    // cible la musique à supprimer
    var deleteSong = $('.current-playlist .song ul > li').filter('[data-id='+message.datas.songTrackId+']');

    //console.log(deleteSong);

    // récupère la position par rapport aux autres li
    // console.log("Index :songTrackId"+deleteSong.index());
    // var indexSong = deleteSong.index();

    // slide up + suppression DOM
    deleteSong.slideUp(function(){
      $(this).remove();
    });
  }

  // Suppression d'une découverte
  if(message.info == 'discoveryRemoved') {

      var deleteDiscovery = $('.discoveries ul > li div').filter('[data-id='+message.datas.discoveryId+']');
      var li = deleteDiscovery.parent();

      li.slideUp(function(){
        li.remove();
      });

  }

}

function removeInAllDom(message){
  // console.log("removeInAllDom : ");
  // console.dir(message);

}


// --------------------------------------
// PARTIE MISE A JOUR DANS LE DOM
// --------------------------------------

// 'FAKE' PLAYER MOBILE - PROGRESSION


  if(isMobile){

    // Bug fix du 11-09-2014
    // Initialisation du Swiper AVANT de dessiner le cercle 'canvas' du player
    var mySwiper = new Swiper('.swiper-container', {
      pagination: '.pagination',
      loop:true,
      paginationClickable: true,
      onSlideChangeStart: function(swiper, direction){
        var nav = $('.nav-top .right');
        switch(swiper.activeLoopIndex){
          case 0:
            nav.children('a').removeClass('visible').filter(':first-child').addClass("visible");
            break;
          case 1:
            nav.children('a').removeClass('visible').filter(':nth-child(2)').addClass("visible");
            $.get( "/mobile/discover", {userId:user.id}, function( data ) {
              //console.dir(data);
              $('.discoveries').html(data);
            });
            
            break;
          case 2:
            nav.children('a').removeClass('visible');
            $.get( "/mobile/playlist/"+user.room+"/historic", {userId:user.id}, function( data ) {
              //console.log(data);
              $('.historic').html(data);
            });

            break;
        }
      }
    }); 


    function PlayerMobile(){
      var player_circle  = $(".player_circle");
      var player_timing  = $(".player_timing");

      this.dom = {
        player : '.player_circle',
        timer  : '.player_timing',
        artist : '.current-song strong',
        song   : '.current-song span'
      },
      this.like = {
        nb : 0,
        user : {}
      },
      this.dislike = {
        nb : 0,
        user : {}
      },
      this.init = function(){
        console.log("Initialisation du Player Mobile");

        var that = this;
        that.initDone = false;

        if( player_circle.length ){
          console.log("Player Mobile existe dans le DOM :)");
          // Initialisation
          player_circle.knob({
              "release" : function (value) {
                if(value){
                  var minutes   = Math.floor(value / 60) || 0;
                  var secondes  = value - minutes * 60   || 0;
                  var zero      = (secondes < 10)? "0" : "";
                  player_timing.html(minutes+"’"+zero+secondes);
                }
              }
          });
          that.initDone = true;

        }

      },
      this.update = function(val){
          console.log("Player Mobile this.update ! =) ");
          player_circle.trigger(
              'configure',
              {
                "min":0,
                "max":val
              }
          );
      },
      this.updatePosition = function(info){
        // réceptionne un objet content : info.position + info.duration
        //console.log('playerDesktop >> updatePosition');
        if(!this.initDone){
          this.init();
        }

        player_circle.val( parseFloat(info.position) ).trigger('change');
        player_circle.trigger(
            'configure',{
                "min": 0,
                "max": parseFloat(info.duration).toFixed(2)
            }
        );
      }

    }  

    window.player_mobile = new PlayerMobile();
    player_mobile.init();


  }  // FIN .isMobile()


  // var $player = $(".knob");
  // var $timer  = $(".timer");
  // var $currentArtist  = $('.current-song strong');
  // var $currentSong    = $('.current-song span');
  // var currentLike     = 0;
  // var currentDislike  = {};
  //     currentDislike.count = 0;
  //     currentDislike.users = [];

  // if($player.length != 0){
  //   // Initialisation
  //   $player.knob({
  //     "release" : function (value) {
  //       var minutes = Math.floor(value / 60);
  //       var secondes = value - minutes * 60;
  //       var zero = (secondes < 10)? "0" : "";
  //       $timer.html(minutes+"’"+zero+secondes);
  //       //console.log("minutes "+minutes+" Secondes :"+zero+secondes);
  //     }
  //   });
  // }

  // // Définir la durée du morceau
  // function setDuration(val){
  //     $player.trigger(
  //         'configure',
  //         {
  //           "min":0,
  //           "max":val
  //         }
  //     );
  // }



function updateInMobileDom(message){
  // console.log("updateInMobileDom, message :  ");
  // console.dir(message);

  if(message.info == "playerPosition"){
    // console.log("updateInMobileDom - playerPosition");
    // console.dir(message.datas);

    // Variable globale "currentPlaylist" présente en temps réél sur Mobile
    currentPlaylist = message.datas.currentPlaylist;

    player_mobile.updatePosition({position: message.datas.position, duration: message.datas.duration });

    // $(player_mobile.dom.player).val(parseInt(message.datas.position)).trigger("change");
    // $player.val(parseInt(message.datas.position)).trigger("change");

    $(player_mobile.dom.artist).text(message.datas.currentPlaylist.songTrackArtist);
    $(player_mobile.dom.song).text(message.datas.currentPlaylist.songTrackName);

  }

  if(message.info == "resetLikeDislike"){
    console.log("updateInMobileDom - resetLikeDislike");
    console.log(message);

    $('div.song ul li[data-id="'+message.datas.songTrackId+'"][data-songservice="'+message.datas.songService+'"] div.action i').remove();

    // Supprime la classe "Active" des boutons pour permettre de voter à nouveau
    var $btnLike    = $('#song-like');
    var $btnDislike = $('#song-dislike');

    $btnLike.add($btnDislike).removeClass('active');

  }

  if(message.info == "showPlayer"){
    console.log('Affichage player mobile ! ');
    // Affichage du player sur mobile
    $('.current-playlist').removeClass('invisible');

    window.player_mobile = new PlayerMobile();
    player_mobile.init();
    player_mobile.update(10);

  }


};

function updateInDesktopDom(message){

  if(message.info == "songLiked"){
    // Incremente le nombre de like du morceau en lecture sur Desktop
    player_desktop.like.nb++;

    var likeContainer = $('.player_track_like span');
    likeContainer.html(player_desktop.like.nb);
  }

  if(message.info == "songDisliked"){

    var nbConnected = parseInt(message.datas.subscribers.length);
    nbConnected--; // Retire 1 (pour ne pas prendre en compte le Desktop)

    // Incremente le nombre de dislike du morceau en lecture sur Desktop
    player_desktop.dislike.nb++;
    // currentDislike.count++; TODELETE 

    var dislikeContainer = $('.player_track_dislike span');
    dislikeContainer.html(player_desktop.dislike.nb);
    // On ajoute quelques infos concernant l'utilisateur qui a disliké dans le tableau global currentDislike.user
    currentDislike.users.push({firstname: message.datas.user.firstname, image: message.datas.user.image });

    console.log("Il y en a en tout "+nbConnected+" connectés et "+player_desktop.dislike.nb+" veulent passer le morceau");

    // Si plus de la moitié des gens connectés n'aiment pas le morceau, on passe au suivant
    if(nbConnected >= 2 && player_desktop.dislike.nb/nbConnected >= 0.5){

        var likeContainer    = $('.player_track_like span');
        var dislikeContainer = $('.player_track_dislike span');

        // Socket au contrôleur songController.js
        socket.put('/desktop/playlist/'+user.room , { id: currentPlaylist.id }, function (response) {

            console.log('App.js > socket pour passer au morceau suivant');
            console.log(response);

            if(response.songStatus != "undefined"){
              currentPlaylist = response;

              // Remet le compteur de like & dislike à zéro
              player_desktop.like.nb = 0;
              player_desktop.dislike.nb = 0;
              likeContainer.text(player_desktop.like.nb);
              dislikeContainer.text(player_desktop.dislike.nb);

              // Lancement musique suivante
              console.log(currentPlaylist);
              // player(currentPlaylist); TODELETE
              player_desktop.playSoundCloud(currentPlaylist);

              }
              else{
                
                // Pas de son à lire dans la playlist
                console.log(" AUCUN SONG A LIRE (après vote dislike) ");

              }

        });

    }

  }

};


function updateInAllDom(message){

  if(message.info == "imageUpdated"){

    var image_precedente = message.datas.previous.image;
    var image_nouvelle   = message.datas.actual.image;
    var user_firstname   = message.datas.user.firstname;
    var user_id          = message.datas.user.id;

    console.log("On est dans l'update de l'image ! ");

    var image_recherche  = $('img[src^="'+image_precedente+'"][data-user-id="'+user_id+'"]');

    if( image_recherche.length > 0 ){

      image_recherche.each(function(i, el){
        image_recherche.attr("src", image_nouvelle+'?'+Math.random());
        console.log("Mise à jour de "+(i+1)+" image(s) dans le dom ");
      });

    }    

  }

}


