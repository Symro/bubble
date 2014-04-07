/**
 * SongController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

    add:function(req, res, next){
        // Log son à ajouter
        // console.dir(req.params.all());
        // console.dir(req.param('song'));

        // req.sessoin.id
        // req.param.url
        song=req.param('song');
        song["user"]=req.session.User.id;
        song["url"]=req.route.params.url;

        console.dir(song);

        Song.create(song).exec(function songAdded(err,added){
          console.dir(err);
          console.dir('Created song with name ');
          console.dir(added)
        });

        // Song.create({songTrackName:params.songTrackName}).exec(function songAdded(err, song){
        //     if (err){
        //         var error=[{name:'error',message:'try again'}];
        //         req.session.flash={
        //             err:error
        //         };
        //         return res.redirect('/mobile/playlist');
        //     }
        //     console.log('son ajouté');
        //     res.redirect('/mobile/playlist');
        // });

        // User.create({name:'Walter Jr'}).exec(function createCB(err,created){
        //   console.log('Created user with name '+created.name);
        //   });
    },

    remove:function(req,res,next){
        songId=req.param('song');

        // console.dir(songId);

        Song.remove({url:route.params.url},1);

        Song.findOneBySoundTrackId(songId,function getSong(err,song){
            console.dir(song);
        });
    }

};