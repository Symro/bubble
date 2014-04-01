/**
 * device
 *
 * @module      :: Policy
 * @description :: Simple policy to check device (mobile / desktop)
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

module.exports = function(req,res,next){

	var device = (req.device) ? req.device.type : "";
	var url = req.path;

	// AIDE POUR LE DEBUG : 
	// console.log('___________________________________________________');
	// console.log("POLICIES___ DEVICE : "+device);

	// console.log('Is Socket ? : '+req.isSocket);
	// console.log('Chemin : '+req.path);
	// console.log('URL : '+req.url);
	// console.log('méthode : '+req.method);
	// console.log('___________________________________________________');


	if(req.method == "GET" && device == "phone" && url.indexOf("desktop") != -1){
		//console.log('_______ il y a un pb.. redirection !');
		url = url.replace("desktop","mobile"); 
		//console.log('_______ nouvelle url : '+url);
		return res.redirect(url);
	}

	if(req.method == "GET" && device == "desktop" && url.indexOf("mobile") != -1){
		//console.log('_______ il y a un pb.. redirection !');
		url = url.replace("mobile","desktop"); 
		//console.log('_______ nouvelle url : '+url);
		return res.redirect(url);
	}

	return next();


};