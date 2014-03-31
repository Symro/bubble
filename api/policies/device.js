/**
 * device
 *
 * @module      :: Policy
 * @description :: Simple policy to check device (mobile / desktop)
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

module.exports = function(req,res,next){

	var device = req.device.type;
	console.log("POLICIES___ DEVICE : "+device);

	if(device == 'phone') {
		res.redirect('/mobile/playlist');
		return next();
	}
	else{
		res.redirect('/desktop/playlist');
		return next();
	}


};