// Basé sur : https://gist.github.com/tkh44/8225384

//    TO DO :
//    '''''''
//
//    - informer les utilisateurs de la màj de la photo
//    - màj en temps réél des images dans les playlists desktop/mobile


var sid = require('shortid');
var fs = require('fs');
var mkdirp = require('mkdirp');
var gm = require('gm').subClass({ imageMagick: true });


var UPLOAD_USER_PATH = 'public/user';
var UPLOAD_PLAYLIST_PATH = 'public/playlist';

// Setup id generator
sid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
sid.seed(42);

function safeFilename(name) {
  name = name.replace(/ /g, '-');
  name = name.replace(/[^A-Za-z0-9-_\.]/g, '');
  name = name.replace(/\.+/g, '.');
  name = name.replace(/-+/g, '-');
  name = name.replace(/_+/g, '_');
  return name;
}

function fileMinusExt(fileName) {
  return fileName.split('.').slice(0, -1).join('.');
}

function fileExtension(fileName) {
  return fileName.split('.').slice(-1);
}

function isInArray(value, array) {
  return (array.indexOf(value) > -1) ? true : false;
}

// Where you would do your processing, etc
// Stubbed out for now
function processImage(id, name, path, cb) {
  console.log('Processing image');

  cb(null, {
    'result': 'success',
    'id': id,
    'name': name,
    'path': path
  });
}


module.exports = {
  user: function (req, res, next) {
    var allowedFiles = ["image/jpeg","image/png","image/gif"];
    var allowFile = isInArray(req.files.fileInput.type, allowedFiles);

    if(!allowFile){
      return res.forbidden('Please upload an image');
    }

    var file = req.files.fileInput,
      id = sid.generate(),
      fileName = id + "." + fileExtension(safeFilename(file.name)),
      dirPath = UPLOAD_USER_PATH + '/' + req.session.User.id,
      filePath = dirPath + '/' + fileName;

    try {
      mkdirp.sync(dirPath, 0755);
    } catch (e) {
      console.log(e);
    }

    fs.readFile(file.path, function (err, data) {
      if (err) {
        return res.json({'error': 'could not read file'});
      } else {
        fs.writeFile(filePath, data, function (err) {
          if (err) {
            return res.json({'error': 'could not write file to storage'});
          } else {
            processImage(id, fileName, filePath, function (err, data) {
              if (err) {
                return res.json(err);
              } else {

                // resize l'image
                gm(filePath)
                .autoOrient()
                .resize(300, 300, "^>")
                .gravity('Center')
                .extent(300, 300)
                .write(filePath, function (err) {
                  if (!err){
                    // màj url de l'image en BDD
                    User.findOne(req.session.User.id).exec(function(err, user) {
                      if(err){
                        return res.json(err);
                      }

                      user.image = "/"+filePath;

                      // Update l'URL de l'image de la session en cours de l'utilisateur
                      req.session.User.id = user.image;

                      user.save(function(err) {
                        // value has been saved
                      });

                    });

                    return res.json(data);
                  }
                  // une erreur est survenue..
                  else{
                    console.log("error : ");
                    console.dir(err);
                    return res.forbidden('Internal Error');
                  }

                });


              }
            });
          }
        })
      }
    });
  },


playlist: function (req, res, next) {
    console.log("Req.files : ");
    console.dir(req.file());

  
    /* A REVOIR GRACE A : http://stackoverflow.com/questions/23977005/uploading-files-using-skipper-with-sails-js-v0-10-how-to-retrieve-new-file-nam */
    /* ET : http://software-kraut.de/?p=743 */


    req.file('historicPicture').upload( SomeReceiver(), function (err, files) {
      if (err) return res.serverError(err);
        return res.json({
          message: files.length + ' file(s) uploaded successfully!',
          files: files
        });
      });
    });

    // var allowedFiles = ["image/jpeg","image/png","image/gif"];
    // var allowFile = isInArray(req.files.fileInput.type, allowedFiles);

    // if(!allowFile){
    //   return res.forbidden('Please upload an image');
    // }
    // if(!req.params['id']){
    //   return res.forbidden('Upload error');
    // }

    // var file = req.files.fileInput,
    //   id = sid.generate(),
    //   fileName = id + "." + fileExtension(safeFilename(file.name)),
    //   dirPath = UPLOAD_PLAYLIST_PATH + '/' + req.params['id'],
    //   filePath = dirPath + '/' + fileName;

    // try {
    //   mkdirp.sync(dirPath, 0755);
    // } catch (e) {
    //   console.log(e);
    // }

    // fs.readFile(file.path, function (err, data) {
    //   if (err) {
    //     return res.json({'error': 'could not read file'});
    //   } else {
    //     fs.writeFile(filePath, data, function (err) {
    //       if (err) {
    //         return res.json({'error': 'could not write file to storage'});
    //       } else {
    //         processImage(id, fileName, filePath, function (err, data) {
    //           if (err) {
    //             return res.json(err);
    //           } else {

    //             // resize l'image
    //             gm(filePath)
    //             .autoOrient()
    //             .resize(300, 300, "^>")
    //             .gravity('Center')
    //             .extent(300, 300)
    //             .write(filePath, function (err) {
    //               if (!err){

    //                 // màj url de l'image en BDD

    //                 PlaylistDesktop.findOneByUrl(req.params['id']).exec(function(err, playlist) {
    //                   if(err){
    //                     return res.json(err);
    //                   }

    //                   playlist.image = "/"+filePath;
    //                   playlist.save();

    //                 });


    //                 return res.json(data);
    //               }
    //               // une erreur est survenue..
    //               else{
    //                 return res.forbidden('Internal Error');
    //               }

    //             });


    //           }
    //         });
    //       }
    //     })
    //   }
    // });


  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to GifController)
   */
  _config: {}
};
