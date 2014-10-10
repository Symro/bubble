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
    controller: 'user',
    action:'login'
  },

  // ROUTES USER

  '/logout': {
    controller: 'user',
    action:'logout'
  },

  'get /user/register': {
    controller: 'user',
    action:'register'
  },

  'post /user/register': {
    controller: 'user',
    action:'registration'
  },

  'post /user/login': {
    controller: 'user',
    action:'authentication'
  },

  // ROUTES ADMIN

  // >> BASES DU DASHBOARD

  'get /admin/':{
    controller: 'admin',
    action: 'index'
  }, 

  'get /admin/user':{
    controller: 'admin',
    action: 'user'
  }, 

  'get /admin/activity':{
    controller: 'admin',
    action: 'activity'
  }, 

  'get /admin/message':{
    controller: 'admin',
    action: 'message'
  }, 

  // >> ADMIN USERS

  '/admin/user/show/:id':{
    controller: 'admin',
    action: 'userShow'
  }, 

  '/admin/user/edit/:id':{
    controller: 'admin',
    action: 'userEdit'
  }, 

  '/admin/user/delete/:id':{
    controller: 'admin',
    action: 'userDelete'
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

  'get /mobile/discovery':{
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

  'get /mobile/historic':{
    controller:'Historic',
    action: 'getHistoric'
  },

  'post /mobile/playlist/:url/add':{
    controller:'Song',
    action:'add'
  },
  'post /mobile/playlist/:url/addFromDiscoveries':{
    controller:'Song',
    action:'addFromDiscoveries'
  },
  'post /mobile/playlist/:url/remove':{
    controller:'Song',
    action:'remove'
  },

  'get /mobile/playlist/:url/dislike':{
    controller:'Song',
    action:'checkDislikeSong'
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

  'get /upload/user/*': {
    controller: 'FileController',
    action: 'get'
  },

  'get /upload/playlist/*': {
    controller: 'FileController',
    action: 'get'
  },

  'post /upload/historic/:id':{
    controller: 'upload',
    action: 'playlist'
  }



};
