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

module.exports = {

	// Chargement de la page inscription
	inscription:function(req,res){

		res.view();

	},

  	// POST du formulaire d'inscription
	createUser:function(req,res,next){

		User.findOneByMail( req.param('mail'), function (err, user) {
			if (err){

				req.session.flash={
					err:[{name:'error',message:'An error occurred, please try retry'}]
				};

				// Redirection au formulaire
				return res.redirect('/user/inscription');
			}

	        else{
	        		// l'email est déjà pris :
	                if (user) {
	                    //res.send({ 'statusCode': 409, 'statusText': 'Email Already Exists' });
	                    var emailAlreadyExists=[{name:'emailAlreadyExists',message:'The email address '+req.param('mail')+' already exists'}];
	                    req.session.flash={
							err:emailAlreadyExists
						};
						return res.redirect('/user/inscription');
	                }
	                // création du compte :
	                else{
	                	User.create(req.params.all(),function userCreated(err,user){
	                		if (err){
								var error=[{name:'error',message:'Please fill in all the fields'}];
								req.session.flash={
									err:error
								};
								// Redirection au formulaire
								return res.redirect('/user/inscription');
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

	show: function(req, res, next) {
	    User.findOne(req.param('id'), function foundUser(err, user) {
		if (err) return next(err);
		if (!user) return next();
		res.view({
			user: user
		});
	    });
	},

	index:function(req,res,next){

              User.find(function foundUsers(err,users){
                if (err) return next(err);
                  res.view({
                    users:users
                  });
              });
    }


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  // _config: {}


};
