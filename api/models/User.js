/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var bcrypt = require('bcrypt-nodejs');

module.exports = {

	schema:true,

 	attributes: {

	  	/* e.g.
	  	nickname: 'string'
	  	*/

	   	firstname:{
	  		type:'string',
	  		required:true
	  	},
	  	mail:{
	  		type:'string',
	  		email:true,
	  		unique:true,
	  		required:true
	  	},
	  	password:{
	  		type:'string',
	  		required:true
	  	},
	  	image:{
	  		type:'string',
	  		defaultsTo:'/images/no_image.png'
	  	},
	  	status:{
	  		type:'integer',
	  		defaultsTo: 1
	  	},
	  	grade:{
	  		type:'string',
	  		defaultsTo: "user",
            in: ['guest', 'user', 'admin']
	  	}

	},

	beforeCreate:function(values,next){
		if (!values.password || values.password != values.confirmation) {
			return next({err:["passwords doesn't match"]});
		}
		bcrypt.hash(values.password, null, null, function(err, hash) {
			if (err) return next(err);
			values.password=hash;
			next();
		});
	},

	beforeUpdate:function(values,next){
		// vérifie la structure du password
		// pour éviter que bcrypt hash à nouveau un mdp déjà hashé
		if (values.password) {
			if(values.password.substring(0,3) == "$2a" && values.password.length > 30){
				next();
			}
			else{
				bcrypt.hash(values.password, null, null, function(err, hash) {
					if (err) return next(err);
					values.password = hash;
					next();
				});
			}
		}
		else{
			next();
		}
		
	}

};
