$(document).ready(function(){

	/* --------------------------------------------------------- */
	//  PARTIE Formulaire inscription Bubble
	/* --------------------------------------------------------- */

	$('.form-signin').validate({
		rules:{
			firstname:{
				required:true
			},
			mail:{
				required:true,
				email:true
			},
			password:{
				minlength:6,
				required:true
			},
			confirmation:{
				minlength:6,
				equalTo:"#password"
			}
		},
		success:function(element){
			element.addClass('valid');
		}
	});


	/* TEST */

	if(isDesktop){


		// L'utilisateur vient d'arriver, il demande la liste des participants
		socket.get('/desktop/playlist/'+user.room+'/joinedUsers', function(data){
//			//console.log(data);

		});

		// Initialisation jCarousel
		$('.listeParticipant').jcarousel();
		$('.listeParticipant-forward').jcarouselControl({
                target: '+=1'
        });
        $('.listeParticipant-backward').jcarouselControl({
                target: '-=1'
        });


	}



	// L'utilisateur vient d'arriver, il informe les autres participants et rejoint sa room
	// socket.get('/desktop/playlist/'+user.room+'/joined', function(response) {

	// 	if (response.count != 0 ){
	// 	  	$('section.current-playlist').removeClass('invisible');
	// 	}

	// });


	/* --------------------------------------------------------- */
	//  PARTIE DECOUVERTES
	/* --------------------------------------------------------- */

	action = {

		addToDiscovery:function(){
			var $btn = $('#song-like');

			if($btn.hasClass('active') == false){

				socket.post( "/mobile/discovery",{ song: currentPlaylist.id, room: user.room, songInitialUser: currentPlaylist.user } ,function( datas ) {
					console.log("Ajouté aux découvertes !");

					if(!datas.error){
						$btn.addClass('active');
					}

				});
			}

		},

		addToDislike:function(){
			var $btn = $('#song-dislike');

			if($btn.hasClass('active') == false){

				socket.post( "/mobile/playlist/"+user.room+"/dislike",{ song: currentPlaylist.id, room: user.room } ,function( datas ) {
					console.log("Morceau Disliké !");
					console.dir(datas);

					if(!datas.error){
						$btn.addClass('active');
					}

				});
			}

		}

	};

	// Ajout aux découvertes
	$('.current-interaction').on('click', '#song-like', action.addToDiscovery );
	// Ajout aux dislike
	$('.current-interaction').on('click', '#song-dislike', action.addToDislike );


	$('body').on('click', '#editDiscovery', function(e){
		e.preventDefault();
		var $li = $('.discoveries ul li');
		$('ul.discoveries li a').toggleClass('active');
		$('.discoveryAction').slideUp();
		$li.removeClass('active');
	});

	$('body').on('click', '.dropDown', function(){
		var $currentLi = $(this).closest( "li" );
		var $li = $('.discoveries ul li');

		if(!$currentLi.hasClass('active') === true){
			$li.removeClass('active').find('.discoveryAction').slideUp();
			$currentLi.addClass('active')
			$(this).parents('.headDiscovery').next().slideToggle();
			$('ul.discoveries li a').removeClass('active');
		}else{
			$li.removeClass('active')
			$(this).parents('.headDiscovery').next().slideToggle();
		}

	});


//Cibler ds le dom


	/* --------------------------------------------------------- */
	//  PARTIE MENU MON COMPTE
	/* --------------------------------------------------------- */


	$('#displayMenu').on('click', function(e){
		e.preventDefault();
		$menu = $('.menu');
		$wrapper = $('.wrapper');

		if(!$menu.hasClass('open')){
			$menu.addClass('open');
			$wrapper.addClass('blur');
		}

		$('.menu-close').on('click', function(e){
			e.preventDefault();
			$menu.removeClass('open');
			$wrapper.removeClass('blur');
		});

	});

	$('.tutoriel').on('click', function(e){
		e.preventDefault();
		$('body').animate({
			scrollTop:$(document).height()
		});

		$('.tutorielOpen').addClass('visible');

		$('.tutoriel-close').on('click', function(e){
			e.preventDefault();
			$('.tutorielOpen').removeClass('visible');
		});
	})


	/* ------------------------------------------------- */
	// GESTION UPLOAD
	/* ------------------------------------------------- */


	/* Affichage Loader en cas d'upload */

	$(document)
	.ajaxSend(function( event, jqxhr, settings ) {
		if(settings.url.substring(0, 7) == "/upload"){
			$('body').addClass("ajax");
		}
	})
	.ajaxComplete(function( event, jqxhr, settings ){
		if(settings.url.substring(0, 7) == "/upload"){
			$('body').removeClass("ajax");
		}
	});

	/* Gestion de l'upload de photo - PROFIL UTILISATEUR */

	$('#formProfilPicture').on('submit', function(e){
		e.preventDefault();
		var datas = new FormData();
		datas.append( "fileInput", $("#profilPicture")[0].files[0]);

		$.ajax({
			url:'/upload/user',
			type:'POST',
			data:datas,
			processData:false,
			contentType:false
		})
		.fail(function(jqXHR, textStatus){
			$('#uploadPicture .error').html(jqXHR.responseJSON.message);
		})
		.success(function(data){
			$('#uploadPicture .error').empty();
			$('#uploadPicture img').attr('src', data.path);

		})

	});

	$('body').on('click', '#uploadPicture img', function(e){
		$('#profilPicture').trigger('click');
	});

	$('body').on('change', '#profilPicture', function(){
        if($(this).length == 1){
            $('#formProfilPicture').trigger('submit');
        }
    });

    /* Gestion de l'upload de photo - HISTORIQUE SOIRÉES */

	$('#formHistoricPicture').on('submit', function(e){
		e.preventDefault();
		var allowedFiles = ["image/jpeg","image/png","image/gif"]
		var playlist 	 = historicPicture.parents('.playlistHist').data('historic-url');
		var file  	 	 = $("#historicPicture")[0].files[0];
		var datas 	 	 = new FormData();

		datas.append( "fileInput", file);

		// Vérification du type de fichier avant upload
		if(allowedFiles.indexOf(file.type) > -1){

			$.ajax({
				url:'/upload/historic/'+playlist,
				type:'POST',
				data:datas,
				processData:false,
				contentType:false
			})
			.success(function(data){
				historicPicture.attr('src', data.path);

				var previous_image = $('img[src^="'+data.old_path+'"]');
				if( previous_image.length > 0 ){
			      console.log("Des images à updater ont été trouvé !");
			      previous_image.each(function(i, el){
			        previous_image.attr("src", data.path+'?'+Math.random());
			      });
			    }

			})
			.fail(function(jqXHR, textStatus){
				console.log(jqXHR, textStatus);
				$('#uploadPicture .error').html(jqXHR.responseJSON.message);
			});

		}
		else{
			console.log("Veuillez uploader une image");
		};




	});

	$('body').on('click', '.playlistHist > img', function(e){
		historicPicture = $(this);
		$('#historicPicture').trigger('click');
	});

	$('body').on('change', '#historicPicture', function(){
        if($(this).length == 1){
            $('#formHistoricPicture').trigger('submit');
        }
    });




   	/* --------------------------------------------------------- */
	//  PARTIE HISTORIQUE
	/* --------------------------------------------------------- */


	$(".custom-scroll").mCustomScrollbar();

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

	$('body').on('click', '.dropDownH', function(){

		var $this = $(this);
		$div=$this.parents('.headHistoric').next();
		console.log($div);

		$this.parents('.headHistoric').next().slideToggle();

		$('.headHistoric').next().not($div).slideUp();

	});


   	/* --------------------------------------------------------- */
	//  PARTIE BUBBLE LIVE
	/* --------------------------------------------------------- */

	$('.form-join-playlist input[type="text"]').click(function(){
	    $(this).focus();
	});

	// $player = $(".knob");
	// $timer  = $(".timer");
	// $music_duration = 180;

	// if($player.length != 0){
	// 	// Initialisation
	// 	$player.knob({
	// 		"release" : function (value) {
	// 			var minutes = Math.floor(value / 60);
	// 			var secondes = value - minutes * 60;
	// 			var zero = (secondes < 10)? "0" : "";
	// 			$timer.html(minutes+"’"+zero+secondes);
	// 			//console.log("minutes "+minutes+" Secondes :"+zero+secondes);
	// 		}
	// 	});
	// }

	// // Définir la durée du morceau
	// setDuration($music_duration);
	// function setDuration(val){
	//     $player.trigger(
	//         'configure',
	//         {
	// 	        "min":0,
	// 	        "max":val
	//         }
	//     );
	// }

	// Ajout d'un son à une playlist
	$('.search').off().on('click', '.results li', function(e){
		e.stopPropagation();
		var eventItem 	= e;
		var $this 		= $(this);
		var modal 		= $('.confirmSongModal');
		var results 	= $(".search .results li");

		if(modal.hasClass("visible")){
			hideModal();
		}
		else{
			showModal($this, eventItem);
		}

	});

	function showModal(that, eventItem){
		var modal 		= $('.confirmSongModal');

		modal.addClass('visible');
		that.addClass('selected').attr("data-top", eventItem.currentTarget.offsetTop);
	}

	function hideModal(){
		var modal 		= $('.confirmSongModal');
		var results 	= $(".search .results li");

		modal.removeClass('visible');
		results.removeClass('selected').attr("data-top", "");
	}


	$('.confirmSongModal').on('click','div a[data-confirm="false"]',function(e){
		e.preventDefault();
		hideModal();
	});

	$('.confirmSongModal').on('click','div a[data-confirm="true"]',function(e){
		e.preventDefault();
		var results 	= $(".search .results li");
		var that 		= results.filter(".selected");

		designInteraction(that);
		hideModal();
	});

	// Design d'interaction
	function designInteraction( $this ){

		$('#sent').empty();
 		var $img 	= $this.children('img');
 		var $left 	= $img.offset().left;
 		var $top 	= parseInt($this.data("top")) + 10;

		// Récupération des datas
		$datas = {
			songTrackId 		: 	$this.data("songid"),
			songTrackName		: 	$this.data("song"),
			songService 		: 	$this.data("songservice"),
			songTrackArtist 	: 	$this.data("songartist"),
			songTrackDuration 	: 	$this.data("songduration"),
			songPermalinkUrl 	: 	$this.data("permalink"),
			songSongUrl 		: 	$this.data("songurl")
		}

		// Animation de la pochette d'album
		$img
			.addClass('invisible')
			.clone()
			.appendTo('#sent')
			.toggleClass('invisible rond')
			.css({
				'position':'absolute',
				'left': $left,
				'top':  $top,
				'display':'block'
			})
			.animate({
				'left':'50%',
				'margin-left':"-"+$img.width()/2
			}, 1000, function(){
				$this.slideUp();
				$(this).animate({
					'top':$top-$(window).height()
				}, 200, function(){
					// $(this).remove();
					$(this).hide();

					// Envoie des datas au controller
					socket.post( "/mobile/playlist/"+user.room+"/add",{song:$datas,img:$img.attr('src')} ,function( datas ) {
		 				console.log(datas);
					});

				});
			});
	}

	// Supression d'un son ajouté par soi-même
	$('body').on('click','.current-playlist .song .delete',function(event){
		event.stopPropagation();
		$songId=$(this).parent().data("id");
		$songService=$(this).parent().data("songservice");
		// $playlist=$(".wrapper").data('playlist-url');

		socket.post( "/mobile/playlist/"+user.room+"/remove",{song:$songId, service:$songService} ,function( datas ) {
			// console.log(datas);
		});

	});


	// Suppression des découvertes
	$('body').on('click','.deleteDiscovery, .deleteSecondDiscovery', function(e){
		e.preventDefault();
		var $this = $(this);
		var li = $this.parents("li[data-discover-id]");
		var id = li.data("discover-id");

		socket.post( "/mobile/discovery/"+id, function(response) {

			if(response){
				if(response.status == "ok"){
					li.slideUp(300, function(){
						li.remove();
					});
				}
				else{
					alert("Erreur : la découverte n'a pas été supprimée");
				}
			}

		});

	});



	// Ajout aux découvertes depuis historique
	$('.historic').on('click','.historicToDiscoveries',function(e){

		var song = $(this).parent().data('track-id');
		console.log(song);

		socket.post( "/mobile/discovery",{song:song, room:user.room} ,function(datas){

			// console.log(datas);

		});

	});

	// Ajout à la playlist en cours depuis l'historique
	$('.historic').on('click','.historicToPlaylist',function(e){

		//var song = $(this).parent().data('track-id');

		//socket.post( "/mobile/playlist/"+user.room+"/addFromBubble",{song:song} ,function(datas){

			// console.log(datas);

		//});

	});

	// Ajout à la playlist en cours depuis les découvertes
	$('.discoveries').on('click','.discoveriesToPlaylist',function(e){

		// Récupère l'ID unique du morceau
		var song = $(this).parents("li[data-song-id]").data('song-id');

		if(typeof(user) != "undefined" && user.room != "false"){
			socket.post( "/mobile/playlist/"+user.room+"/addFromDiscoveries",{song:song} ,function(datas){
				// console.log(datas);
			});
		}

	});


	/* --------------------------------------------------------- */
	//  PARTIE DESKTOP
	/* --------------------------------------------------------- */


	$('body').on('click','.player_track_dislike' ,function(event){

		$('.player_carousel_like_dislike_container').removeClass('invisible');

		var ul = $('.player_carousel_like_dislike_container ul');
		ul.empty();

		$.each( currentDislike.users , function( key, value ) {
			ul.append('<li><img src="'+value.image+'" alt="'+value.firstname+'"/></li>');
		});


		var carousel 		  = $('.player_carousel_like_dislike').jcarousel();
		var carousel_forward  = $('.player_carousel_like_dislike_forward');
		var carousel_backward = $('.player_carousel_like_dislike_backward');

		// Initialisation jCarousel
		$('.player_carousel_like_dislike_forward').jcarouselControl({ target: '+=1',carousel: carousel });
        $('.player_carousel_like_dislike_backward').jcarouselControl({ target: '-=1',carousel: carousel });


		(currentDislike.users.length > 3) ? carousel_forward.add(carousel_backward).removeClass('invisible') : carousel_forward.add(carousel_backward).addClass('invisible')


	});






});
