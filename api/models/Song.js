/**
 * Song.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    attributes:{

        songService:{
            type:"string",
            defaultsTo: "soundcloud",
            in: ['soundcloud', 'deezer', 'spotify']
        },
        songTrackId:{
            // primaryKey: true,
            // unique: false,
            type:"string",
            required:true,
            maxLength:24
        },
        songTrackArtist:{
            type:"string",
            required:true
        },
        songTrackName:{
            type:"string",
            required:true
        },
        songTrackDuration:{
            type:"integer",
            notNull:true
        },
        songPermalinkUrl:{
            type:"string"
        },
        songCounter:{
            type:"integer",
            defaultsTo: '0'
        },
        songStatus:{
            type:"string",
            defaultsTo: "waiting",
            in: ['waiting', 'playing', 'played']
        },
        songSongUrl: {
            type: 'string'
        },
        user:{
            model:"user"
        },
        url:{
            model:"playlistDesktop"
        }

    }

};
