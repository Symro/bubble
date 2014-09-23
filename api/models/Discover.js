/**
 * Discover.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    attributes:{

        // user:{
        //     model:"user"
        // },

        // ID de l'utilisateur qui a ajouté aux découvertes
      	user: {
		    collection: 'user',
		    via: 'id',
		    dominant:true
		},

        // song:{
        //     model:"song"
        // }

        // ID du morceau ajouté aux découvertes
        song:{
            collection: 'song',
		    via: 'id',
		    dominant:true
        }

    }

};
 