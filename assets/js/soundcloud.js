
// API Souncloud
SC.initialize({
	client_id: "933d179a29049bde6dd6f1c2db106eeb",
});

// Code
search.init({

	/**
	 * Exec Spotify search
	 * 
	 * @param {String} query
	 */

	searchedSpotify:function(query){

		$.ajax({
			url:'https://api.spotify.com/v1/search?q='+query+'&type=track',
			type: 'GET',
			success:function(data){

				$('.results').empty();

				$(data.tracks.items).each(function(index, track) {

						$img="/images/icon_music.png";
						$('.results').append($('<li data-song="'+track.name+'" data-songid="'+track.id+'" data-songservice="spotify" data-songartist="'+track.artists[0].name+'" data-songduration="'+track.duration_ms+'" data-permalink="'+track.link+'" data-songurl="'+track.preview_url+'"></li>').html('<img src='+$img+'><div><span class="title">'+track.name + '</span><span class="artist">'+ track.artists[0].name +'</span></div>'));

				});

			}
		});

	},

	/**
	 * Exec Deezer search
	 * 
	 * @param {String} query
	 */

	searchedDeezer:function(query){

		$.ajax({
			url:'http://api.deezer.com/search?q='+query+'&output=jsonp',
			type: 'GET',
			dataType: 'jsonp',
			success:function(data){

				console.log(data);

				$('.results').empty();

				$(data.data).each(function(index, track) {

					if (track.readable === true) {

						$img=track.album.cover;
						$('.results').append($('<li data-song="'+track.title+'" data-songid="'+track.id+'" data-songservice="deezer" data-songartist="'+track.artist.name+'" data-songduration="'+track.duration+'" data-permalink="'+track.link+'" data-songurl="'+track.preview+'"></li>').html('<img src='+$img+'><div><span class="title">'+track.title + '</span><span class="artist">'+ track.artist.name +'</span></div>'));

					}

				});

			}
		});

	},

	searchedSouncloud:function(query){

		$('.results').empty();
		SC.get('/tracks', {q:query,limit:20}, function(tracks) {
			$(tracks).each(function(index, track) {
				if(track.streamable === true){
					console.log(track);
					$img=track.artwork_url;
						// Vérification si la musique possède une cover
					if ($img==null) {
						$img="/images/icon_music.png"
					}
					$('.results').append($('<li data-song="'+track.title+'" data-songid="'+track.id+'" data-songservice="soundcloud" data-songartist="'+track.user.username+'" data-songduration="'+track.duration+'" data-permalink="'+track.permalink_url+'" data-songurl=""></li>').html('<img src='+$img+'><div><span class="title">'+track.title + '</span><span class="artist">'+ track.user.username +'</span></div>'));
				}
			});
		});

	}

});


search.init();



$( document ).ready(function() {

	// Ecouteur pour selectionner le moteur de recherche
	$('.serviceSelect').on('click','i', function(e) {
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
		search.getSearchEngine($(this).data('service'));

		var recherche = $('input[name="search"]').val();
		console.log(recherche);

		// On récupère la saisie
		var query = recherche;

		search.getQuery(recherche);

	});

	$('.search form[action="search"]').on('submit', function(e){
		e.preventDefault();
		$('input[name="search"]').trigger('change');
	});

	// écouteur pour lancer une recherche
	$('input[name="search"]').on('keyup change',function(e){
		e.preventDefault();
		var recherche = $(this).val();
		console.log(recherche);

		// On récupère la saisie
		var query = recherche;

		search.getQuery(recherche);

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

