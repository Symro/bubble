/**
 * UserController
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


	// Affichage page de login
	login:function(req,res){
	  	res.view('user/login');
	},

	// Déconnexion de l'utilisateur
	logout:function(req,res,next){
	  	// Log des actions
		sails.controllers.log.info(req, res, next , {action:"LOGOUT", type:"USER"});

		req.session.destroy();
		res.redirect('/');
	},

	// Chargement de la page inscription
	register:function(req,res){
		res.view('user/register');
	},

  	// Inscription de l'utilisateur
	registration:function(req,res,next){

		User.findOneByMail( req.param('mail'), function (err, user) {
			if (err){

				req.session.flash={
					err:[{name:'error',message:'An error occurred, please try retry'}]
				};

				// Redirection au formulaire
				return res.redirect('/user/register');
			}

	        else{
	        		// l'email est déjà pris :
	                if (user) {
	                    //res.send({ 'statusCode': 409, 'statusText': 'Email Already Exists' });
	                    var emailAlreadyExists=[{name:'emailAlreadyExists',message:'The email address '+req.param('mail')+' already exists'}];
	                    req.session.flash={
							err:emailAlreadyExists
						};
						return res.redirect('/user/register');
	                }
	                // création du compte :
	                else{
	                	params = {
	                		firstname: req.param('firstname'),
	                		mail : req.param('mail'),
	                		password: req.param('password'),
	                		confirmation : req.param('confirmation')
	                	}

	                	User.create( params ,function userCreated(err,user){
	                		if (err){
								var error=[{name:'error',message:'Please fill in all the fields'}];
								req.session.flash={
									err:error
								};
								// Redirection au formulaire
								return res.redirect('/user/register');
							}
							req.session.authenticated=true;
							req.session.User=user;

							// Redirection vers la page user créée
							//res.redirect('/user/show/' + user.id);
							res.redirect('/mobile/playlist/');

						});
                }
            }
        });


	},


	// Authentification de l'utilisateur
	authentication:function(req,res,next){

	    if(!req.param('mail')|| !req.param('password')){
	      var fieldsRequired=[{name:'fieldsRequired',message:'Please enter an email and a password.'}];

	      req.session.flash={
	        err:fieldsRequired
	      }

	      return res.redirect('/');
	    }

	    User.findOneByMail(req.param('mail'),function(err,user){
			if (err) return next(err);

			// If no user is found
			if (!user){
				var noAccountError=[{name:'noAccount',message:'The email address '+req.param('mail')+' is not found'}];
				req.session.flash={
				  err:noAccountError
				}
				return res.redirect('/');
			}
			// If user banned
			if (user.status == 0){
				var accountDeactivated=[{name:'unactiveAccount',message:'This account has been deactivated'}];
				req.session.flash={
				  err:accountDeactivated
				}
				return res.redirect('/');
			}

			// Compare passwords
			bcrypt.compare(req.param('password'), user.password, function(err,valid){
				if (err) return next(err);

				// If doesn't match
				if(!valid){
					var mismatchError=[{name:'mismatchError',message:'Invalid email or password'}];
					req.session.flash={
						err:mismatchError
					}
					res.redirect('/');
					return;
				}

				// Log user in
				req.session.authenticated=true;
				req.session.User=user;

				// Log des actions
				sails.controllers.log.info(req, res, next , {action:"LOGIN", type:"USER", info:"SUCCESS"});

				// Envoie d'une socket aux autres
				User.publishUpdate(user.id, {
					loggedIn: true,
					id:user.id,
					name:user.firstname
				});

				// redirect
				res.redirect('/mobile/playlist/');

			});

		});
	}


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  // _config: {}


};
