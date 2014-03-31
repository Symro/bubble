/**
 * Join.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    schema:true,
    adapter:'mongo',

    attributes:{

        userId:{
            type:'string',
            required:true
        },
        playlistUrl:{
            type:'string',
            required:true
        }

    }

};
