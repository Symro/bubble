/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

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
	  	}
	},

	beforeCreate:function(values,next){
		if (!values.password || values.password != values.confirmation) {
			return next({err:["passwords doesn't match"]});
		}
		require('bcrypt-nodejs').hash(values.password, null, null, function(err, hash) {
			if (err) return next(err);
			values.password=hash;
			next();
		});
	},

	beforeUpdate:function(values,next){
		if (values.password) {
			require('bcrypt-nodejs').hash(values.password, null, null, function(err, hash) {
				if (err) return next(err);
				values.password=hash;
				next();
			});
		}
	}

};
