/**
 * SessionController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var bcrypt=require('bcrypt-nodejs');

module.exports = {
    
  'new':function(req,res){
  	res.view('session/new');
  },

  create:function(req,res,next){
    if(!req.param('mail')|| !req.param('password')){
      var fieldsRequired=[{name:'fieldsRequired',message:'Please enter an email and a password.'}];

      req.session.flash={
        err:fieldsRequired
      }

      res.redirect('/session/new');
      return;
    }

    User.findOneByMail(req.param('mail'),function(err,user){
      if (err) return next(err);

      // If no user is found
      if (!user){
        var noAccountError=[{name:'noAccount',message:'The email address '+req.param('mail')+' is not found'}];
        req.session.flash={
          err:noAccountError
        }
        res.redirect('session/new');
        return;
      }

      // Compare passwords
      bcrypt.compare(req.param('password'),user.password,function(err,valid){
        if (err) return next(err);

        // If doesn't match
        if(!valid){
          var mismatchError=[{name:'mismatchError',message:'Invalid username and password'}];
          req.session.flash={
            err:mismatchError
          }
          res.redirect('session/new');
          return;
        }

        // Log user in
        req.session.authenticated=true;
        req.session.User=user;

        // Envoie d'une socket aux autres
        User.publishUpdate(user.id, {
          loggedIn: true,
          id:user.id,
          name:user.firstname
        });

        // redirect
        //res.redirect('/user/show/'+user.id);
        res.redirect('/mobile/playlist/');

      });
    });
  },

  destroy:function(req,res,next){

    req.session.destroy();
    res.redirect('/session/new');

  }
  
};