/**
 * app.js
 *
 * This file contains some conventional defaults for working with Socket.io + Sails.
 * It is designed to get you up and running fast, but is by no means anything special.
 *
 * Feel free to change none, some, or ALL of this file to fit your needs!
 */


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
      // __ VERB doit être soit : get (obtenir), add (ajout), update (modifier), delete (supprimer)
      // __ DEVICE doit être : desktop, mobile, all
      // __ INFO : information de ce qu'il se passe (écrit en CamelCase please!)
      // __ DATA : un JSON de préférence pour manipuler ensuite en jQuery et inserer dans le DOM

      // EXEMPLE
      // message =  {
      //      verb    : "add",
      //      device  : "desktop",
      //      info    : "userJoined",
      //      data    : { firstname: req.session.User.firstname, image: req.session.User.image }
      // }


      log('New comet message received :: ', message);

      messageReceivedFromServer(message)



    });

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

var currentPlaylist = [];


function messageReceivedFromServer(message){


    if (message.verb === 'add') {
      console.log('envoi message');
      addInDom(message);
    }
    if (message.verb === 'delete') {
      console.log('envoi suppression message');
      removeInDom(message);
    }



}

// FONCTON DE ROUTAGE DES AJOUTS DANS LE DOM
function addInDom(message){
    switch (message.device) {
      case 'desktop': addInDesktopDom(message);
                      break;
      case 'mobile' : addInMobileDom(message);
                      break;
      case 'all'    : addInAllDom(message);
                      break;
    }
}
function removeInDom(message){
    switch (message.device) {
      case 'desktop': removeInDesktopDom(message);
                      break;
      case 'mobile' : removeInMobileDom(message);
                      break;
      case 'all'    : removeInAllDom(message);
                      break;
    }
}

function addInDesktopDom(message){
  console.log("addInDesktopDom : ");
  console.dir(message);

  if(message.info == "userJoined"){

    $('.listeParticipant ul')
      .append('<li><img alt="'+message.data.firstname+'" src="'+message.data.image+'" /></li>')
      .parents('.listeParticipant')
      .jcarousel('reload');

  }
  else if(message.info == "startPlaying"){

    currentPlaylist.push(message.datas);

    var player = $('.desktop-container .player');

    player.removeClass('invisible');

    console.log("Lancer la musique !");
    console.dir(message.datas);


  }


}

function addInMobileDom(message){
  console.log("addInMobileDom : ");
  console.dir(message);

  if (message.info=="songAdded") {

    // Calcul duree en secondes
    $duree=String((message.datas.song.songTrackDuration / 60000).toFixed(2)).replace(".","'");

    // Si c'est l'user qui a ajouté il peut supprimer
    if (message.datas.song.user==user.id) {
      $i="<i class='icon-croixclosesuppr'></i>";
    }else{
      $i='';
    }

    // affichage DOM
    $('.song ul').append('<li data-id="'+message.datas.song.songTrackId+'"><div class="action remove">'+$i+'</div><div><strong>'+message.datas.song.songTrackName+'</strong><span>'+message.datas.song.songTrackArtist+'</span></div><div><span>'+$duree+'</span><img src="'+message.datas.song.user+'"></div></li>');
  }

}

function addInAllDom(message){
  console.log("addInAllDom : ");
  console.dir(message);

}


function removeInDesktopDom(message){
  console.log("removeInDesktopDom : ");
  console.dir(message);

}

function removeInMobileDom(message){
  console.log("removeInMobileDom : ");
  console.dir(message.datas.songTrackId);

  if (message.info=='songRemoved') {

    // cible la musique à supprimer
    var deleteSong = $('.current-playlist .song ul > li').filter('[data-id='+message.datas.songTrackId+']');

    console.log(deleteSong);

    // récupère la position par rapport aux autres li
    // console.log("Index :songTrackId"+deleteSong.index());
    // var indexSong = deleteSong.index();

    // disparition de la div (suppression visuelle)
    deleteSong.slideUp();
  }

}

function removeInAllDom(message){
  console.log("removeInAllDom : ");
  console.dir(message);

}