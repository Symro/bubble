/**
 * Allow admin only
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to controller
  if (req.session.User && req.session.User.grade === "admin") {
      // Log des actions
      sails.controllers.log.info(req, res, next , {action:"LOGIN", type:"ADMIN", info:"SUCCESS" });
      return next();
  }

  // User is not allowed
  else {

      var requireLoginError = [{name: 'requireLogin', message: "You're not allowed to access this page."}]
      req.session.flash = {
        err: requireLoginError
      }
      // Log des actions
      sails.controllers.log.info(req, res, next , {action:"LOGIN", type:"ADMIN", info:"FAILED"});

      return res.redirect('/');
      
  }
};