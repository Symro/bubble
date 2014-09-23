// Avec l'aide de :
//
// http://stackoverflow.com/questions/23977005/uploading-files-using-skipper-with-sails-js-v0-10-how-to-retrieve-new-file-nam
// http://software-kraut.de/?p=743
// http://stackoverflow.com/questions/24069203/skipper-in-sailsjs-beta-image-resize-before-upload


// TO DO :
// '''''''
//
// - informer les utilisateurs de la màj de la photo
// - màj en temps réél des images dans les playlists desktop/mobile

var fs      = require('fs');
var mkdirp  = require('mkdirp');
var gm      = require('gm').subClass({ imageMagick: true });
var path    = require('path');

var UPLOAD_USER_PATH     = 'upload/user';
var UPLOAD_PLAYLIST_PATH = 'upload/playlist';


function isInArray(value, array) {
  return (array.indexOf(value) > -1) ? true : false;
}



module.exports = {

  user: function (req, res, next) {

    // Création du répertoire
    try {
      mkdirp.sync(UPLOAD_USER_PATH+"/"+req.session.User.firstname+"-"+req.session.User.id+"/", 0755);
    } catch (e) {
      console.log("Impossible de créer le dossier..");
      console.log(e);
    }

    // Réglages pour l'upload : 
    // 
    // > dirname   = dossier d'enregistrement du fichier
    // > saveAs    = nom du fichier
    // > completed = fonction de callback qui lance les redimensionnement des images et l'enregistrement en BDD
    //

    var results = [],
    streamOptions = {
      dirname: UPLOAD_USER_PATH+"/"+req.session.User.firstname+"-"+req.session.User.id+"/",
      saveAs: function(file) {
        var filename = file.filename,
            newName = Date.now()+ "-" +  req.session.User.id + path.extname(filename);
        return newName;
      },
      completed: function(fileData, next) {
        // Callback fichier uploadé avec succès

        var chemin_img_800 = UPLOAD_USER_PATH+"/"+req.session.User.firstname+"-"+req.session.User.id+"/"+path.basename(fileData.path, path.extname(fileData.path))+"-800"+path.extname(fileData.path);
        var chemin_img_300 = UPLOAD_USER_PATH+"/"+req.session.User.firstname+"-"+req.session.User.id+"/"+path.basename(fileData.path, path.extname(fileData.path))+"-300"+path.extname(fileData.path);

        // resize l'image en 800px
        gm(fileData.path)
        .autoOrient()
        .resize(800, 800, "^>")
        .gravity('Center')
        .extent(800, 800)
        .write(chemin_img_800, function (err) {

        });

        // resize l'image en 300px
        gm(fileData.path)
        .autoOrient()
        .resize(300, 300, "^>")
        .gravity('Center')
        .extent(300, 300)
        .write(chemin_img_300, function (err) {
          if (!err){

            // màj url de l'image en BDD
            User.findOne(req.session.User.id).exec(function(err, user) {
              if(err){
                return res.json(err);
              }

              // Stock le chemin de l'ancienne image
              var previous_img = user.image;

              user.image    = "/"+chemin_img_300;

              // Update l'URL de l'image de la session en cours de l'utilisateur
              //req.session.User.id = user.image;

              user.save(function(err, s) {
                if(err) return next(err);

                // Log des actions
                sails.controllers.log.info(req, res, next , {action:"UPLOAD", type:"IMAGE_USER", info:"SUCCESS"});

                // On envoie des infos à tous les sockets connectés concernant l'update !
                User.publishUpdate(user.id, { 
                  type:"image",
                  previous:{
                    image:previous_img
                  },
                  actual:{
                    image:"/"+chemin_img_300
                  },
                  user:{
                    id : user.id,
                    firstname: user.firstname
                  }
                });

                // Retour de l'url de l'image pour màj JS dans le DOM
                return res.json({
                  path : "/"+chemin_img_300,
                  old_path : previous_img
                });

              });



            });


          }
          // une erreur est survenue..
          else{

            // Log des actions
            sails.controllers.log.info(req, res, next , {action:"UPLOAD", type:"IMAGE_USER", info:"FAILED"});

            console.log("error : ");
            console.dir(err);
            return res.forbidden('Internal Error');
          }

        });

      }
    };



    req.file('fileInput').upload(Uploader.documentReceiverStream(streamOptions),
      function (err, files) {

        if(err){
          if(err.errMessage){
            return res.json({
              message: 'Please upload an image',
            });
          }
          else{
            return res.serverError(err);
          }
        }

        res.json({
          message: files.length + ' file(s) uploaded successfully!',
          files: results
        });

      }
    );


  }, // FIN fonction user

  playlist: function (req, res, next) {

    // Création du répertoire
    try {
      mkdirp.sync(UPLOAD_PLAYLIST_PATH+"/"+req.params['id']+"/", 0755);
    } catch (e) {
      console.log("Impossible de créer le dossier..");
      console.log(e);
    }


    // Réglages pour l'upload : 
    // 
    // > dirname   = dossier d'enregistrement du fichier
    // > saveAs    = nom du fichier
    // > completed = fonction de callback qui lance les redimensionnement des images et l'enregistrement en BDD
    //

    var results = [],
    streamOptions = {
      dirname: "upload/playlist/"+req.params['id']+"/",
      saveAs: function(file) {
        var filename = file.filename,
            newName = Date.now()+ "-" +  req.session.User.id + path.extname(filename);
        return newName;
      },
      completed: function(fileData, next) {
        // Callback fichier uploadé avec succès
        console.log("FileData : ");
        console.dir(fileData);

        var chemin_img_800 = UPLOAD_PLAYLIST_PATH+"/"+req.params['id']+"/"+path.basename(fileData.path, path.extname(fileData.path))+"-800"+path.extname(fileData.path);
        var chemin_img_300 = UPLOAD_PLAYLIST_PATH+"/"+req.params['id']+"/"+path.basename(fileData.path, path.extname(fileData.path))+"-300"+path.extname(fileData.path);

        // resize l'image en 800px
        gm(fileData.path)
        .autoOrient()
        .resize(800, 800, "^>")
        .gravity('Center')
        .extent(800, 800)
        .write(chemin_img_800, function (err) {

        });

        // resize l'image en 300px
        gm(fileData.path)
        .autoOrient()
        .resize(300, 300, "^>")
        .gravity('Center')
        .extent(300, 300)
        .write(chemin_img_300, function (err) {
          if (!err){

            // màj url de l'image en BDD
            PlaylistDesktop.findOneByUrl(req.params['id']).exec(function(err, playlist) {
              if(err){
                return res.json(err);
              }

              // Log des actions
              sails.controllers.log.info(req, res, next , {action:"UPLOAD", type:"IMAGE_PLAYLIST", info:"SUCCESS"});

              // On enregistre en base l'image de taille 300px
              playlist.image = "/"+chemin_img_300;
              playlist.save();

            });

            // Retour de l'url de l'image pour màj JS dans le DOM
            return res.json({
              path : "/"+chemin_img_300
            });

          }
          // une erreur est survenue..
          else{
            
            // Log des actions
            sails.controllers.log.info(req, res, next , {action:"UPLOAD", type:"IMAGE_PLAYLIST", info:"FAILED"});

            console.log("error : ");
            console.dir(err);
            return res.forbidden('Internal Error');
          }

        });

      }
    };



    req.file('fileInput').upload(Uploader.documentReceiverStream(streamOptions),
      function (err, files) {

        if(err){
          if(err.errMessage){
            return res.json({
              message: 'Please upload an image',
            });
          }
          else{
            return res.serverError(err);
          }
        }

        res.json({
          message: files.length + ' file(s) uploaded successfully!',
          files: results
        });

      }
    );


  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to GifController)
   */
  _config: {}

};
