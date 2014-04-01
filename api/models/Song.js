/**
 * Song.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    schema:true,
    adapter:'mongo',

    attributes:{

        songService:{
            type:"string",
            defaultsTo: "soundcloud",
            in: ['soundcloud', 'deezer', 'spotify']
        },
        songTrackId:{
            type:"integer",
            required:true,
            maxLength:11
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
            type:"string",
            url:true          
        },
        songCounter:{
            type:"integer"     
        },
        user:{
            model:"user"
        }

    }

};
