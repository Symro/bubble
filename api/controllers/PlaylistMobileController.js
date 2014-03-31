/**
 * PlaylistMobileController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

	index:function(req,res,next){

		var device = req.device.type;

		if(device == 'desktop') {
			console.log("REDIRECTON mobile > desktop ___ car device = "+device);
			return res.redirect('/desktop/playlist');
		}

		// res.view({
		// 	layout: "layout_mobile"
		// }); // équivaut à res.view('playlistMobile/index');

        res.view(); // équivaut à res.view('playlistMobile/index');
	},

	join:function(req,res,next){
	    console.log('join playlist url : '+req.param('playlist_url'));

	    // Si le champ n'est pas rempli
		if(req.param('playlist_url')==""){
			console.log('url is empty');

			var fieldRequired=[{name:'fieldRequired',message:'Please enter a url to join a playlist.'}];

			req.session.flash={
				err:fieldRequired
			};

			return res.redirect('/mobile/playlist');
	    }
	    
        // Redirection vers l'affichage de la playlist
        res.redirect('/mobile/playlist/'+req.param('playlist_url'));
    },

    show:function(req,res,next){

        // Affichage de la playlist
		PlaylistDesktop.findOneByUrl(req.param('url'),function foundPlaylistDesktop(err,playlist){
			if (err) return next(err);
			if (!playlist) return next();
			res.view({
				playlist: playlist
			});
		});

	}

};
