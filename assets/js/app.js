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


function messageReceivedFromServer(message){


    if (message.verb === 'add') {
      addInDom(message);
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

    function addInDesktopDom(message){
      console.log("addInDesktopDom : ");
      console.dir(message);

      if(message.info == "userJoined"){

        $('.listeParticipant ul')
          .append('<li><img alt="'+message.data.firstname+'" src="'+message.data.image+'" /></li>')
          .parents('.listeParticipant')
          .jcarousel('reload');

      }


    }

    function addInMobileDom(message){
      console.log("addInMobileDom : ");
      console.dir(message);
      
    }

    function addInAllDom(message){
      console.log("addInAllDom : ");
      console.dir(message);
      
    }