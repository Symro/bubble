/**
 * PlaylistDesktop.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    schema:true,
    adapter:'mongo',

    attributes:{
        name:{
            type:'string',
            required:true
        },
        url:{
            type:'string'
        },
        host:{
            type:'string'
        },
        image:{
            type:'string',
            defaultsTo:'/images/default_historic.png'
        }
    }

};
