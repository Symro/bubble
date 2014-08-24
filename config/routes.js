/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {


  '/': {
    controller: 'session',
    action:'new'
  },

  '/logout': {
    controller: 'session',
    action:'destroy'
  },

  // ROUTES MOBILE

  'get /mobile':{
    controller: 'playlistMobile',
    action: 'index'
  },

  'get /mobile/playlist':{
    controller: 'playlistMobile',
    action: 'show'
  },

  'post /mobile/playlist':{
    controller: 'playlistMobile',
    action: 'join'
  },

  '/mobile/playlist/:url':{
    controller:'playlistMobile',
    action: 'show'
  },

  'get /mobile/discover':{
    controller:'Discover',
    action: 'showDiscovery'
  },

  'post /mobile/discovery':{
    controller:'Discover',
    action:'addDiscovery'
  },

  'post /mobile/discovery/:id':{
    controller:'Discover',
    action:'deleteDiscovery'
  },

  'get /mobile/playlist/:url/historic':{
    controller:'Historic',
    action: 'getHistoric'
  },

  'post /mobile/playlist/:url/add':{
    controller:'Song',
    action:'add'
  },
  'post /mobile/playlist/:url/addFromBubble':{
    controller:'Song',
    action:'addFromBubble'
  },
  'post /mobile/playlist/:url/remove':{
    controller:'Song',
    action:'remove'
  },

  'post /mobile/playlist/:url/dislike':{
    controller:'Song',
    action:'dislikeSong'
  },

  // ROUTES DESKTOP

  'get /desktop/playlist':{
    controller: 'playlistDesktop',
    action: 'createRoom'
  },

  'post /desktop/playlist':{
    controller: 'playlistDesktop',
    action: 'create'
  },

  'get /desktop/playlist/:url':{
    controller:'playlistDesktop',
    action: 'index'
  },

  'post /desktop/playlist/:url':{
    controller:'playlistDesktop',
    action: 'index'
  },

  'get /desktop/playlist/:url/joinedUsers':{
    controller:'join',
    action: 'joinedUsers'
  },

  'get /desktop/playlist/:url/joined':{
    controller:'join',
    action: 'joined'
  },

  'put /desktop/playlist/:url':{
    controller:'SongController',
    action: 'nextSong'
  },

  'post /desktop/playlist/:url/playerPosition':{
    controller:'SongController',
    action: 'playerPosition'
  },

  // ROUTES DIVERSES

  'get /public/user/*': {
    controller: 'FileController',
    action: 'get'
  },

  'get /public/playlist/*': {
    controller: 'FileController',
    action: 'get'
  },

  'post /upload/historic/:id':{
    controller: 'upload',
    action: 'playlist'
  }



};
