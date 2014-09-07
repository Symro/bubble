/**
 * Allow admin only
 */
module.exports = function(req, res, ok) {

  // User is allowed, proceed to controller
  if (req.session.User && req.session.User.grade === "admin") {
    return ok();
  }

  // User is not allowed
  else {
      var requireLoginError = [{name: 'requireLogin', message: "You're not allowed to access this page."}]
      req.session.flash = {
      err: requireLoginError
    }
    res.redirect('/');
    return;
  }
};