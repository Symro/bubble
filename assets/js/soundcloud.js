
// API Souncloud
SC.initialize({
	client_id: "933d179a29049bde6dd6f1c2db106eeb",
});


// Code
search.init({

	searchedSpotify:function(query){

		$.ajax({
			url:'https://api.spotify.com/v1/search?q='+query+'&type=track',
			success:function(data){

				$('.results').empty();
				
				$(data.tracks).each(function(index, track) {

						$img="/images/icon_music.png";
						$('.results').append($('<li data-song="'+track.name+'" data-songid="'+track.id+'" data-songservice="spotify" data-songartist="'+track.artists[0].name+'" data-songduration="'+track.duration_ms+'" data-permalink="'+track.preview_url+'"></li>').html('<img src='+$img+'><div><span class="title">'+track.name + '</span><span class="artist">'+ track.artists[0].name +'</span></div>'));

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
					$('.results').append($('<li data-song="'+track.title+'" data-songid="'+track.id+'" data-songservice="soundcloud" data-songartist="'+track.user.username+'" data-songduration="'+track.duration+'" data-permalink="'+track.permalink_url+'"></li>').html('<img src='+$img+'><div><span class="title">'+track.title + '</span><span class="artist">'+ track.user.username +'</span></div>'));
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

