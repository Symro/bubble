var search = {

	defaults:{
		engine:'Soundcloud'
	},

	init:function(options){

		this.params=$.extend(this.defaults,options);

	},

	getSearchEngine:function(engine){

		// On récupère le moteur de recherche
		this.params.engine=engine;

	},

	getQuery:function(query){

		// console.log(query);

		// on effectue une requête de recherche si cette requête est > à 4 caractères
		if (query.length >= 3) {

			// Execution de la requête selon le moteur de recherche
			if (this.params.engine=='Soundcloud') {
				// Recherche Souncloud
				search.params.searchedSouncloud.call(this, query);
			}else {
				// Recherche Youtube
				search.params.searchedYoutube.call(this);
			}

		}

	}
}