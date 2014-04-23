// REGLAGES PLAYER

soundManager.setup({
	// path to directory containing SM2 SWF
	url: '/swf/',
	debugFlash: false,
	
  	onready: function(){
		console.log('soundManager est pret ! ');
		//threeSixtyPlayer.handleClick({ target:threeSixtyPlayer.links[0] });
	},
	ontimeout: function() {
		// console.log('SM2 init failed!');
	},
	defaultOptions: {
		// set global default volume for all sound objects
		volume: 100
	}

});



threeSixtyPlayer.config.scaleFont = (navigator.userAgent.match(/msie/i)?false:true);
threeSixtyPlayer.config.showHMSTime = true;

// enable some spectrum stuffs

threeSixtyPlayer.config.useWaveformData = true;
threeSixtyPlayer.config.useEQData = true;

// enable this in SM2 as well, as needed

if (threeSixtyPlayer.config.useWaveformData) {
  soundManager.flash9Options.useWaveformData = true;
}
if (threeSixtyPlayer.config.useEQData) {
  soundManager.flash9Options.useEQData = true;
}
if (threeSixtyPlayer.config.usePeakData) {
  soundManager.flash9Options.usePeakData = true;
}

if (threeSixtyPlayer.config.useWaveformData || threeSixtyPlayer.flash9Options.useEQData || threeSixtyPlayer.flash9Options.usePeakData) {
  // even if HTML5 supports MP3, prefer flash so the visualization features can be used.
  soundManager.preferFlash = true;
}

// favicon is expensive CPU-wise, but can be used.
if (window.location.href.match(/hifi/i)) {
  threeSixtyPlayer.config.useFavIcon = true;
}

if (window.location.href.match(/html5/i)) {
  // for testing IE 9, etc.
  soundManager.useHTML5Audio = true;
}

// config player

threeSixtyPlayer.config = {

	playNext: false,
	autoPlay: false,
	allowMultiple: false,
	loadRingColor: '#ccc',
	playRingColor: '#FFF',
	backgroundRingColor: '#eee',
	circleDiameter: 256,
	circleRadius: 128,
	animDuration: 500,
	animTransition: Animator.tx.bouncy,
	showHMSTime: true,

	useWaveformData: false,
	waveformDataColor: '#FFF',
	waveformDataDownsample: 3,
	waveformDataOutside: false,
	waveformDataConstrain: false,
	waveformDataLineRatio: 0.64,

	useEQData: true,
	eqDataColor: '#FFF',
	eqDataDownsample: 1,
	eqDataOutside: true,
	eqDataLineRatio: 0.6,

	usePeakData: true,
	peakDataColor: '#FFF',
	peakDataOutside: true,
	peakDataLineRatio: 0.5,

	//useAmplifier: true,
	scaleArcWidth: 0.15,  // thickness factor of playback progress ring

}

//soundManager.createSound('.sm2_link', selectedSong);

// Création des callback

threeSixtyPlayer.events.pause = function(){ 
	$('.sm2-360btn').addClass('pause');
	stop_send_player_position();
}
threeSixtyPlayer.events.resume = function(){
	$('.sm2-360btn').removeClass('pause');
	get_player_position();
}

threeSixtyPlayer.events.finish = function(){ 
	var likeContainer 	 = $('.player_track_like span');
	var dislikeContainer = $('.player_track_dislike span');

	console.log("Envoie socket.put avec id = "+currentPlaylist.id);
	socket.put('/desktop/playlist/'+user.room , { id: currentPlaylist.id }, function (response) {
		console.log("Reponse : ");
		console.dir(response);
		if(response.songStatus != "undefined"){
			currentPlaylist = response;

			// Remet le compteur de like & dislike à zéro
			currentLike = 0;
			currentDislike = 0;
			likeContainer.text(0);
			dislikeContainer.text(0);

			// Lancement musique suivante
	    	play_player(currentPlaylist);

	    }
	    else{
	    	// Pas de son à lire dans la playlist
	    	console.log(" AUCUN SONG A LIRE ");
	    	stop_send_player_position();
	    }

	});

	//get_info_new_track(); // L'autre appel de get_info_new_track() est dans 360player.js

}

/* LIVE BUBBLE - PLAYER POSITION */

var get_player_position_timer;

// Lance le Timer d'envoie de la position du lecteur
function get_player_position(){
	stop_send_player_position(); // on clear le timer avant de le relancer
	get_player_position_timer = setInterval(function(){ send_player_position() }, 1000);
}

// Envoie par socket l'instant ds le morceau en lecture, et la durée totale du morceau
function send_player_position(){
	socket.post('/desktop/playlist/'+user.room+'/playerPosition' , {
			position : (threeSixtyPlayer.sounds.length != 0) ? Math.floor(threeSixtyPlayer.sounds[threeSixtyPlayer.sounds.length-1].position/1000) : 0,
			duration : (threeSixtyPlayer.sounds.length != 0) ? Math.floor(threeSixtyPlayer.sounds[threeSixtyPlayer.sounds.length-1].durationEstimate/1000) : 0,
			currentPlaylist : currentPlaylist
		}, function(response){
			console.log(response);
	});
}

// Arrêter l'envoie de la position du player desktop au mobile chaque seconde
function stop_send_player_position(){
	clearInterval(get_player_position_timer);
}



/**
 * Play new song
 *
 * @param {Object} new_track :: database instance of song
 */

function play_player(new_track){
	get_player_position(); // Lancement du timer

	console.log("Lecture d'un nouveau morceau : "+new_track.songTrackName);

	// Change l'url dynamiquement et joue le morceau
	switch (new_track.songService) {
		case 'soundcloud' : 
			$(".ui360 a").attr("href","http://api.soundcloud.com/tracks/"+new_track.songTrackId+"/stream?client_id=933d179a29049bde6dd6f1c2db106eeb");
		break;
		case 'spotify' : 
			$(".ui360 a").attr("href",new_track.songPermalinkUrl);
		break;
		case 'deezer' : 
			$(".ui360 a").attr("href",new_track.songPermalinkUrl);
		break;
	}


    threeSixtyPlayer.handleClick({target:threeSixtyPlayer.links[0],preventDefault:function(){}});

	$('.player_track_name').html(new_track.songTrackName);
	$('.player_track_artist').html(new_track.songTrackArtist);

}





/*

var player={

	params:{
		url:'',
		audio:'#audio',
		progress:'#progress',
		playButton:'#play_button',
		order:0
	},

	init:function(options){
		this.property=$.extend(this.params,options);
		this.media=$(this.property.video)[0];
	},

	getStream:function(playlist,i){
		$(".ui360 a").attr("href","http://api.soundcloud.com/tracks/"+playlist[i]+"/stream?client_id=933d179a29049bde6dd6f1c2db106eeb");
		player.params.streamed.call(this,playlist[0]);
	},

	getPlaylist:function(){
		$(".liPlaylist li div:first-child").each(function(i){
			song=$(this).data("songid");
			playlist.push(song);
		});
		console.log(playlist);

		if(playlist.length != 0){
			player.getStream(playlist,player.params.order);
		}
	}
	
}

*/


