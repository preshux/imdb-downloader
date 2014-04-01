function getPrefs(site) {
	// Get user settings
	var filePref, qualities = [];
	chrome.storage.sync.get({
		filePref: 'TorrentMagnetUrl',
		quality_1080: true, 
		quality_720: true,
		quality_3d: true,
		proxy: true
	}, function(items) {
		filePref = items.filePref;
		if (items.quality_1080) qualities.push('1080p');
		if (items.quality_720) qualities.push('720p');
		if (items.quality_3d) qualities.push('3D');

		if (qualities.length === 0) { // No qualities selected
			showMessage('No download qualities selected, please review your Movie Downloader options');
		}
		else {
			var keyword = getMovieIdOrTitle();
			var url = items.proxy ? 'http://yify.unlocktorrent.com' : 'http://yts.re';

			if (keyword === undefined) {
				showMessage('No movie found');
			}
			else {
				getMovies(site, keyword, url, filePref, qualities);
			}
		}
	});
}

function showMessage(message) {
	buttons.innerHTML += '<p>'+message+'</p>';
}

function getMovies(site, keyword, url, filePref, qualities) {
	// Get download links
	var xmlhttp;
	xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200)
		{
			document.getElementById('fetching-download').innerHTML = '';
			var movies = JSON.parse(xmlhttp.responseText);
			movies = movies.MovieList;

			if (movies === undefined) {
				showMessage('No downloads available');
			}
			else {
				var count = 0;
				for (var i=0;i<movies.length;i++)
				{
					var movie = movies[i].TorrentMagnetUrl;
					if (filePref != "TorrentMagnetUrl") {
						movie = movies[i].TorrentUrl;
						movie = movie.replace('http://yts.re', 'http://yify.unlocktorrent.com');
					}
					if (qualities.indexOf(movies[i].Quality) != -1) {
						count++;
						buttons.innerHTML += '<a class="'+site+'-download" href="'+movie+'">'+movies[i].Quality+'</a>';
					}
				}
				if (count === 0) {
					showMessage('No downloads available, adjust your Movie downloader options for better results');
				}
			}
		}
	};
	xmlhttp.open('GET', url+'/api/list.json?keywords='+keyword, true);
	xmlhttp.send();
}
