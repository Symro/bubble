/**
* Log.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

  	user:{
		type:"string",
		required:true
  	},
  	action:{
  		// LOGIN, LOGOUT, CREATE, JOIN, REMOVE, ADD, UPLOAD, CONNECT, [..?]
  		type:"string",
  		required:true,
  		in: ['LOGIN', 'LOGOUT', 'CREATE', 'JOIN', 'REMOVE', 'ADD', 'UPLOAD', 'CONNECT']
  	},
  	type:{
  		type:"string",
  		in: ['USER', 'ADMIN', 'PLAYLIST', 'SONG', 'DISCOVER', 'IMAGE_USER', 'IMAGE_PLAYLIST', 'DEEZER', 'SPOTIFY', 'FACEBOOK']
  	},
  	info:{
  		// INFO COMPLÉMENTAIRES
  		// SUCCESS, INVALID_xxxx, FAILED
  		type:"string"
  	},
  	ip:{
  		type:"ip",
  		required:true
  	},
  	browser:{
  		type:"string"
  	},
  	version:{
  		type:"string"
  	},
  	device:{
  		type:"string"
  	},
  	os:{
  		type:"string"
  	}


  }

};

