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
}
threeSixtyPlayer.events.resume = function(){
	$('.sm2-360btn').removeClass('pause');
}

/*
threeSixtyPlayer.events.finish = function(){ 
	currentSongIndex++;
	get_info_new_track(); // L'autre appel de get_info_new_track() est dans 360player.js
	play_player(track_info.id);
}
*/

function play_player(new_track){
	console.log("new_track : "+new_track);
	// Change l'url dynamiquement et joue le morceau
	$(".ui360 a").attr("href","http://api.soundcloud.com/tracks/"+new_track+"/stream?client_id=933d179a29049bde6dd6f1c2db106eeb");
    threeSixtyPlayer.handleClick({target:threeSixtyPlayer.links[0],preventDefault:function(){}});
}

function get_info_new_track(){
	// Récupère l'id de la musique soundcloud + id bdd
	var new_track 	= currentPlaylist[currentSongIndex];
	var track_db_id = $('.liPlaylist li:eq('+currentSongIndex+')').data('db-id');

	// Récupère les infos la concernant
	$.getJSON("http://api.soundcloud.com/tracks/"+new_track+".json?client_id=933d179a29049bde6dd6f1c2db106eeb", function(data){

		$('.player_track_name').html(data.title);
		$('.player_track_artist').html(data.user.username);

		// Variable global JS transmise au mobile pour les interactions ("ajout découverte" et "musique suivante")

		track_info = {
			id 	  : new_track,
			id_db : track_db_id,
			title : data.title,
			artist: data.user.username			
		}

	});

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


