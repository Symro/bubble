var mySwiper = new Swiper('.swiper-container', {
		pagination: '.pagination',
		loop:true,
		paginationClickable: true,
		onSlideChangeStart: function(swiper, direction){
			var nav = $('.nav-top .right');
			switch(swiper.activeLoopIndex){
				case 0:
					nav.children('a').removeClass('visible').filter(':first-child').addClass("visible");
					break;
				case 1:
					nav.children('a').removeClass('visible').filter(':nth-child(2)').addClass("visible");
					$.get( "/mobile/discover", {userId:user.id}, function( data ) {
						//console.dir(data);
						$('.discoveries').html(data);
					});
					
					break;
				case 2:
					nav.children('a').removeClass('visible');
					$.get( "/mobile/playlist/"+user.room+"/historic", {userId:user.id}, function( data ) {
						//console.log(data);
						$('.historic').html(data);
					});

					break;
			}

	}
}) 