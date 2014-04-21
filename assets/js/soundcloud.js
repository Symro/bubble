
// API Souncloud
SC.initialize({
	client_id: "933d179a29049bde6dd6f1c2db106eeb",
});


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

