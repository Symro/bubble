/**
 * device
 *
 * @module      :: Policy
 * @description :: Simple policy to check device (mobile / desktop)
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

module.exports = function(req,res,next){

	var device 	= (req.device) ? req.device.type : "";
	var url 	= req.path;

	// AIDE POUR LE DEBUG : 
	// console.log('___________________________________________________');
	// console.log("__ DEVICE : "+device);
	// console.log('__ Chemin : '+req.path);
	// console.log('__ Méthode : '+req.method);
	// console.log('___________________________________________________');


	if(req.method == "GET" && device == "phone" && url.indexOf("desktop") != -1){
		url = url.replace("desktop","mobile"); 
		return res.redirect(url);
	}

	if(req.method == "GET" && device == "desktop" && url.indexOf("mobile") != -1){
		url = url.replace("mobile","desktop"); 
		return res.redirect(url);
	}

	return next();


};