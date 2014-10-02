/**
 * Join.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    schema:true,

    attributes:{

        // user:{
        //     model:'user'
        // },
        // playlistUrl:{
        //     type:'string',
        //     required:true
        // },
        // playlist:{
        //     model:'playlistDesktop'
        // }

        user:{
            collection: 'user',
            via: 'id'
        },
        playlist:{
            model:'playlistDesktop'
        }

    }
    
};
