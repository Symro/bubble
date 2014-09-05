/**
 * AdminController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {


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

	
};

