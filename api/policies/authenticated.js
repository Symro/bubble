/**
 * Allow any authenticated user.
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to controller
  if (req.session.authenticated) {
    return next();
  }

  // User is not allowed
  else {
      var requireLoginError = [{name: 'requireLogin', message: 'You must be signed in.'}]
      req.session.flash = {
      err: requireLoginError
    }

    // Log des actions
    sails.controllers.log.info(req, res, next , {action:"LOGIN", type:"USER", info:"FAILED"});

    return res.redirect('/');
  }
};