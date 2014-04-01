function carouselLast(){
	$('.listeParticipant').jcarousel('reload');
	$(' .listeParticipant').jcarousel('scroll', $('.wrapperParticipants .listeParticipant li:eq(-3)'));
}
function carouselRefresh(){
	// $('.listeParticipant').jcarousel('reload', {
 //    animation: 'slow'
 $(' .listeParticipant').jcarousel('reload', $('.wrapperParticipants .listeParticipant li'));

}

// API Souncloud
SC.initialize({
	client_id: "933d179a29049bde6dd6f1c2db106eeb",
});

var playlist=[];

var track_info = {
	id 		:$('.liPlaylist li:first').data("id"),
	id_db 	:$('.liPlaylist li:first').data("db-id"),
	title 	:$('.liPlaylist li:first strong').html(),
	artist 	:$('.liPlaylist li:first span').html(),
}
var skip_song = false;
var dislike_song = 0;

// Code
search.init({

	searchedYoutube:function(){

		$.ajax({
			url:'http://gdata.youtube.com/feeds/api/videos/-/%7Bhttp%3A%2F%2Fgdata.youtube.com%2Fschemas%2F2007%2Fcategories.cat%7DMusic?alt=json&q='+query+'&orderby=viewCount',
			dataType:'jsonp',
			success:function(data){
				$('.results').empty();

				for (i = 0; i < data.feed.entry.length; i++) {
					console.log(data.feed.entry[i]);
					$('.results').append($('<li data-songService="youtube"></li>').html('<p><img width="120px" height="80px" src='+data.feed.entry[i].media$group.media$thumbnail[1].url+'><span>'+data.feed.entry[i].media$group.media$title.$t+'</span></p><a href="">Ajouter</a>'));
				};
			}
		})

	},

	searchedSouncloud:function(){

		$('.results').empty();
		SC.get('/tracks', { q: query }, function(tracks) {
			$(tracks).each(function(index, track) {
				console.log(track);
				$img=track.artwork_url;
				// Vérification si la musique possède une cover
				if ($img==null) {
					$img="./images/icon_music.png"
				}
				$('.results').append($('<li data-song="'+track.title+'" data-songid="'+track.id+'" data-songservice="soundcloud" data-songartist="'+track.user.username+'" data-songduration="'+track.duration+'" data-permalink="'+track.permalink_url+'"></li>').html('<img src='+$img+'><div><span class="title">'+track.title + '</span><span class="artist">'+ track.user.username +'</span></div>'));
			});
		});

	}

});

player.init({
	streamed:function(url){
		threeSixtyPlayer.handleClick({target:threeSixtyPlayer.links[0],preventDefault:function(){}});
		player.params.order++;
	},

});

search.init();
player.init();


$( document ).ready(function() {

	// Ecouteur pour selectionner le moteur de recherche
	$('.serviceSelect').on('click','i', function(e) {
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
		search.getSearchEngine($(this).data('service'));
	});

	$('.search form[action="search"]').on('submit', function(e){
		e.preventDefault();
		$('input[name="search"]').trigger('change');
	});

	// écouteur pour lancer une recherche
	$('input[name="search"]').on('keyup change',function(e){
		e.preventDefault();
		var $form=$(this).parent('form');

		// On récupère la saisie
		query=$form.serialize();

		search.getQuery(query);
	});

	// Afficher les sons d'une playlist dans l'historique
	$(document).on('click','li.playlistHist h4, li.playlistHist span',function(e){
		e.preventDefault();
		//console.log($(this));
		$wrapperSongs = $(this).siblings('.wrapperSongs');
		if($wrapperSongs.is(':visible')){
			$wrapperSongs.slideUp();
		}
		else{
			$wrapperSongs.slideDown();
		}
	});

	// Affichage de la recherche
	$("#searchSong").on('click',function(e){
		e.preventDefault();

		$search=$('.search');
		$wrapper=$('.wrapper');

		if (!$search.hasClass('open')) {
			$search.addClass('open');
			$wrapper.addClass('blur');
		}

		$('.menu-close').on('click',function(e){
			e.preventDefault();
			$search.removeClass('open');
			$wrapper.removeClass('blur');
		});
	});

});

// REGLAGES PLAYER

soundManager.setup({
	// path to directory containing SM2 SWF
	url: './public/swf/',
	debugFlash: false,
	
  	onready: function(){
		player.getPlaylist();
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


// Création des callback

threeSixtyPlayer.events.pause = function(){ 
	$('.sm2-360btn').addClass('pause');
}
threeSixtyPlayer.events.resume = function(){
	$('.sm2-360btn').removeClass('pause');
}

threeSixtyPlayer.events.finish = function(){ 
	player.params.order++;
	get_info_new_track(); // L'autre appel de get_info_new_track() est dans 360player.js
	play_player(track_info.id);
}

function play_player(new_track){
	// Change l'url dynamiquement et joue le morceau
	$(".ui360 a").attr("href","http://api.soundcloud.com/tracks/"+new_track+"/stream?client_id=933d179a29049bde6dd6f1c2db106eeb");
    threeSixtyPlayer.handleClick({target:threeSixtyPlayer.links[0],preventDefault:function(){}});
}

function get_info_new_track(){
	// Récupère l'id de la musique soundcloud + id bdd
	var new_track 	= playlist[player.params.order];
	var track_db_id = $('.liPlaylist li:eq('+player.params.order+')').data('db-id');

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