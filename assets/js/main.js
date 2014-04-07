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
			console.log("Ajouté !");
			$playlist = $('.wrapper').data('playlist-url') || 0;
			$this = $(this);

			$.ajax({
				url:'./mobile/playlist/'+$playlist+'/discover',
				type:"POST",
				data:{
					"data-id" : $('#song-like').attr('data-id')
				}
			})
			.success(function(data){
				$('.current-interaction').off('click', '#song-like').children('#song-like').addClass('active');
			});
		},
		addToDislike:function(){

			$playlist = $('.wrapper').data('playlist-url') || 0;
			$this = $(this);

			$.ajax({
				url:'./mobile/playlist/'+$playlist+'/dislike',
				type:"POST",
				data:{
					"data-id" 		: $('#song-dislike').attr('data-id'),
					"playlist-url"	: $playlist
				}
			})
			.success(function(data){

				//dislike_song = data.nb_dislike;
				dislike_song++;

				if(data.skip_song == 1){

					skip_song = true;
					// on passe à la musique suivante
					console.log("On passe à la suivante plz");

				}

				$('.current-interaction').off('click', '#song-dislike').children('#song-dislike').addClass('active');
			});

		}

	};

	// Ajout aux découvertes
	$('.current-interaction').on('click', '#song-like', action.addToDiscovery );
	// Ajout aux dislike
	$('.current-interaction').on('click', '#song-dislike', action.addToDislike );


	$('body').on('click', '#editDiscovery', function(e){
		e.preventDefault();
		$('ul.discoveries li a').toggleClass('active');
	});

	$('body').on('click', 'ul.discoveries li > a', function(e){
		e.preventDefault();
		$playlist = $('.wrapper').data('playlist-url') || 0;
		$this = $(this);

		$.ajax({
			url:'./mobile/playlist/'+$playlist+'/discover?'+$.param({ "data-id" : $(this).next().data('id') }),
			type:"DELETE",
			data:{
				"data-id" : $(this).next().data('id')
			}
		})
		.success(function(data){
			$this.parent().slideUp(300, function(){
				$(this).remove();
			});
			//$('.discoveries').html(data);
		});

	});


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
		if(settings.url.substring(0, 7) == "upload/"){
			$('body').addClass("ajax");
		}
	})
	.ajaxComplete(function( event, jqxhr, settings ){
		if(settings.url.substring(0, 7) == "upload/"){
			$('body').removeClass("ajax");
		}
	});

	/* Gestion de l'upload de photo - PROFIL UTILISATEUR */

	$('#formProfilPicture').on('submit', function(e){
		e.preventDefault();
		var datas = new FormData();
		datas.append( "fileInput", $("#profilPicture")[0].files[0]);

		$.ajax({
			url:'upload/profil',
			type:'POST',
			data:datas,
			processData:false,
			contentType:false
		})
		.success(function(datas){
			$('#uploadPicture').html(datas);
			carouselRefresh();
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
			url:'upload/historic/'+playlist,
			type:'POST',
			data:datas,
			processData:false,
			contentType:false
		})
		.success(function(datas){
			historicPicture.attr('src', datas);
		})

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
		    	console.log(img);
		    	cont = 0;
		    }
		    anim.filter(':nth-child('+img+')').css({'margin-top': position, 'opacity' : 1});
		    cont++;
		},100);
	}

	// Ajout d'un son à une playlist
	$('.search').on('click', '.results li', function(e){
		e.preventDefault();

		// Pop-up confirmation
		$popup = confirm("Ajouter à la playlist ?");

		// Conversion du temps en minutes
		// $temps = String($(this).data("songduration") / 60000);
		// $temps = (Math.round( $temps * 100 )/100 );
		// $temps = $temps.toFixed(2).toString();
		// $temps = $temps.replace(".","'");

		// console.log($temps);

		if($popup){

		// Récupération des datas
			$datas={
				songTrackId:$(this).data("songid"),
				songTrackName:$(this).data("song"),
				songService:$(this).data("songservice"),
				songTrackArtist:$(this).data("songartist"),
				songTrackDuration:$(this).data("songduration"),
				songPermalinkUrl:$(this).data("permalink")
			}

			console.dir($datas);

			// Envoi des datas au controller
			socket.post( "/mobile/playlist/"+user.room+"/add",{song:$datas} ,function( datas ) {
				// console.log(datas);
			});
		}

	});

	// Supression d'un son ajouté par sois-même
	$('body').on('click','.current-playlist .song .remove',function(event){
		event.stopPropagation();
		$songId=$(this).parent().data("id");
		// $playlist=$(".wrapper").data('playlist-url');

		socket.post( "/mobile/playlist/"+user.room+"/remove",{song:$songId} ,function( datas ) {
			// console.log(datas);
		});

	});

});