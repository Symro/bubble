var search = {

	defaults:{
		engine:'soundcloud'
	},

	init:function(options){

		this.params=$.extend(this.defaults,options);

	},

	getSearchEngine:function(engine){

		// On récupère le moteur de recherche
		this.params.engine=engine;

	},

	/**
	 * Exec the query to the service
	 *
	 * @param {String} query :: input value
	 */

	getQuery:function(query){

		// on effectue une requête de recherche si cette requête est > à 4 caractères
		if (query.length >= 3) {
			// Execution de la requête selon le moteur de recherche
			switch (this.params.engine) {
				case 'soundcloud' : 
					search.params.searchedSouncloud.call(this, query);
				break;
				case 'deezer' : 
					search.params.searchedDeezer.call(this, query);
				break;
				case 'spotify' : 
					search.params.searchedSpotify.call(this, query);
				break;
				default: 
					search.params.searchedSouncloud.call(this, query);
				break;
			}

		}

	}
}