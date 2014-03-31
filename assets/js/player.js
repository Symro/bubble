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