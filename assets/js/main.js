$(document).ready(function(){

	isMobile = ($("body").hasClass('mobile')) ? true : false;
	isDesktop = ($("body").hasClass('desktop')) ? true : false;

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


		$('#test1').on('click', function(){

			console.log('button clicked');
			console.log('SOCKET___ socket request(/desktop/playlist/'+user.room+'/joinedUsers); ');

			socket.get('/desktop/playlist/'+user.room+'/joinedUsers', function(res){
				console.log(res);
			});

		});

		// L'utilisateur vient d'arriver, il demande la liste des participants
		socket.get('/desktop/playlist/'+user.room+'/joinedUsers', function(data){
			console.log(data);
		});

		// L'utilisateur vient d'arriver, il demande informe les autres participants
		socket.get('/desktop/playlist/'+user.room+'/joined', function(response) {
		  // do something
		  console.log(response);
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
	socket.get('/desktop/playlist/'+user.room+'/joined', function(response) {
	  // do something
	  console.log(response);
	});


	/* --------------------------------------------------------- */
	//  PARTIE DECOUVERTES
	/* --------------------------------------------------------- */

	action = {

		addToDiscovery:function(){
			var $btn = $('#song-like');

			if($btn.hasClass('active') == false){

				socket.post( "/mobile/discovery",{ song: currentPlaylist.songTrackId, room: user.room } ,function( datas ) {
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
			$('#uploadPicture img').attr('src', '/'+data.path);

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
		var playlist = historicPicture.parents('.playlistHist').data('historic-url');
		var datas = new FormData();
		datas.append( "fileInput", $("#historicPicture")[0].files[0]);

		$.ajax({
			url:'/upload/historic/'+playlist,
			type:'POST',
			data:datas,
			processData:false,
			contentType:false
		})
		.success(function(data){
			historicPicture.attr('src', '/'+data.path);
		})
		// .fail(function(jqXHR, textStatus){
		// 	$('#uploadPicture .error').html(jqXHR.responseJSON.message);
		// })


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


	if(isMobile){
	    //turn to inline mode
	    //$.fn.editable.defaults.mode = 'inline';
	}

    // $('#edit-email,#user-email').click(function() {

    // 	$('#user-email').editable({
    // 		name : 'email',
    //         url: '',
    //         title: 'Email ',
    //         type: 'email',
    //         success: function(data) {
    //         }
    // 	});

    // });


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

	$player = $(".knob");
	$timer  = $(".timer");
	$music_duration = 180;

	if($player.length != 0){
		// Initialisation
		$player.knob({
			"release" : function (value) {
				var minutes = Math.floor(value / 60);
				var secondes = value - minutes * 60;
				var zero = (secondes < 10)? "0" : "";
				$timer.html(minutes+"'"+zero+secondes);
				//console.log("minutes "+minutes+" Secondes :"+zero+secondes);
			}
		});
	}

	// Définir la durée du morceau
	setDuration($music_duration);
	function setDuration(val){
	    $player.trigger(
	        'configure',
	        {
		        "min":0,
		        "max":val
	        }
	    );
	}

	// Animation des ondes sur mobile
	if(isMobile){
		var imgHeight = 250;
		var numImgs = 41;
		var cont = 0;
		var img = 1;
		var anim = $('.animation').find('img');

		var animation = setInterval(function(){
		    var position =  -1 * (cont*imgHeight);

		    if(cont == numImgs){

		    	//if(img == 1){img++;}
		    	//else if(img == 2){img++;}
		    	//else{img = 1;}
		    	//console.log(img);
		    	cont = 0;
		    }
		    anim.filter(':nth-child('+img+')').css({'margin-top': position, 'opacity' : 1});
		    cont++;
		},100);
	}

	// Ajout d'un son à une playlist
	$('.search').on('click', '.results li', function(e){
		e.preventDefault();

		$('.confirmSongModal').addClass('visible');


		if( $('a[data-confirm]') == true ){


		}

		// Pop-up confirmation
		$popup = confirm("Ajouter à la playlist ?");

		// Conversion du temps en minutes
		// $temps = String($(this).data("songduration") / 60000);
		// $temps = (Math.round( $temps * 100 )/100 );
		// $temps = $temps.toFixed(2).toString();
		// $temps = $temps.replace(".","'");

		// console.log($temps);

		if($popup){

		// Design d'interaction
 		var $this = $(this);
 		var $img = $this.children('img');
 		var $left = $img.offset().left;
 		var $top = e.currentTarget.offsetTop+10;

		// Récupération des datas
			$datas={
				songTrackId:$(this).data("songid"),
				songTrackName:$(this).data("song"),
				songService:$(this).data("songservice"),
				songTrackArtist:$(this).data("songartist"),
				songTrackDuration:$(this).data("songduration"),
				songPermalinkUrl:$(this).data("permalink"),
				songSongUrl:$(this).data("songurl")
			}

			console.dir($datas);

			// Envoi des datas au controller
			// socket.post( "/mobile/playlist/"+user.room+"/add",{song:$datas,img:$img.attr('src')} ,function( datas ) {
 		// 		console.log(datas);
			// });

			$img
 				.addClass('invisible')
 				.clone()
 				.appendTo('#sent')
 				.toggleClass('invisible rond')
 				.css({
 					'position':'absolute',
 					'left':$left,
 					'top':$top,
 					'display':'block'
 				})
 				.animate({
 					'left':'45vw'
 				}, 1000, function(){
 					$this.slideUp();
 					$(this).animate({
 						'top':e.currentTarget.offsetTop-$(window).height()
 					}, 200, function(){
 						// socket.emit('new_track', {
 						// 	"track_name" : track,
 						// 	"track_image" : $img.attr('src'),
 						// 	"room" : user.room
 						// });
 						// $(this).remove();
 						// Envoi des datas au controller
						socket.post( "/mobile/playlist/"+user.room+"/add",{song:$datas,img:$img.attr('src')} ,function( datas ) {
			 				console.log(datas);
						});
 					});
 				});
		}

	});

	// Supression d'un son ajouté par sois-même
	$('body').on('click','.current-playlist .song .delete',function(event){
		event.stopPropagation();
		$songId=$(this).parent().data("id");
		$songService=$(this).parent().data("songservice");
		// $playlist=$(".wrapper").data('playlist-url');

		socket.post( "/mobile/playlist/"+user.room+"/remove",{song:$songId, service:$songService} ,function( datas ) {
			// console.log(datas);
		});

	});


	$('body').on('click','.deleteDiscovery' ,function(event){ //Alex
		event.preventDefault();
		var $this = $(this);
		var id = $(this).next().data("id");
		console.log("id : "+id);

		socket.post( "/mobile/discovery/"+id ,function( datas ) {
			console.log(datas);
			console.log("on va delete");

			$this.parent().slideUp(300, function(){
				console.log('ca delete !');
				$this.remove();
			});

		});

	});

	// Suppression secondaire des découvertes
	$('body').on('click','.deleteSecondDiscovery',function(e){
		e.preventDefault();

		$this=$(this);
		$id=$(this).parent().data('id');

		socket.post( "/mobile/discovery/"+$id ,function( datas ) {
			// console.log(datas);
			console.log("on va delete");
			console.log($this.parents('.discoveryAction').prev());
			$this.parents('li').slideUp(300, function(){
				console.log('ca delete !');
				// $this.remove();
			});
			$this.parents('.discoveryAction').prev().slideUp(300, function(){
				console.log('ca delete !');
				// $this.remove();
			});

		});

	});


	// Ajout aux découvertes depuis historique
	$('.historic').on('click','.historicToDiscoveries',function(e){

		$song=$(this).parent().data('track-id');
		console.log($song);

		socket.post( "/mobile/discovery",{song:$song} ,function(datas){

			// console.log(datas);

		});

	});

	// Ajout à la playlist en cours depuis l'historique
	$('.historic').on('click','.historicToPlaylist',function(e){

		$song=$(this).parent().data('track-id');

		console.log($song);

		socket.post( "/mobile/playlist/"+user.room+"/addFromBubble",{song:$song} ,function(datas){

			// console.log(datas);

		});

	});

	// Ajout à la playlist en cours depuis desicoveries
	$('.discoveries').on('click','.discoveriesToPlaylist',function(e){

		$song=String($(this).parent().data('track-id'));


		socket.post( "/mobile/playlist/"+user.room+"/addFromBubble",{song:$song} ,function(datas){

			// console.log(datas);

		});

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
