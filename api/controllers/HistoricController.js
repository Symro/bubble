/**
 * HistoricController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var moment = require('moment');

module.exports = {

	getHistoric: function( req, res, next ){
		var userId = req.session.User.id;

		Join.find().populate("user", {id: userId}).exec(function(err, userJoinedPlaylist){

			// Permet de retourner les URL des playlists que l'utilisateur a rejoint
			var userJoinedPlaylistId = _(userJoinedPlaylist)
											.filter(function(userJoinedPlaylist) { if(userJoinedPlaylist.user.length > 0 ) return userJoinedPlaylist; })
											.pluck('playlist')
											.value();

			// On recherche tous les playlists que l'utilisateur a rejoint, avec toutes les infos qui vont
			// bien grâce au populateAll()
			Join.find({ playlist: userJoinedPlaylistId }).populateAll().sort({ createdAt: 'desc'}).exec(function(err, infoPlaylist){

				return res.view('playlistMobile/partials/historic',{
					moment   : moment,
					historic : infoPlaylist,
					layout	 : null
				});

			});


		});

	}



};