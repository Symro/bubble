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

    },

    remove:function(req,res,next){

        // Récupération id song
        songId=Number(req.param('song'));

        // Suprresion du son ciblé
        Song.destroy({songTrackId:songId,url:req.route.params.url}).exec(function getSong(err,song){
            console.log("song supprimé !");
            console.dir(song);
        });
    }

};