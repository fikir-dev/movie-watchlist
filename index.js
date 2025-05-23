let moviesArray = []
let moviesImdbID = []
let extraMovies = []
let moviesAddedToWatchlist = JSON.parse(localStorage.getItem("addedMovies")) || []

const searchBtn = document.getElementById('searchBtn')
const moviesHolder = document.getElementById('movies-outer')
const moviesPlaceholder = document.getElementById('movies-placeholder')
const noMoviesFound = document.getElementById('no-movies-found')
const watchlist = document.getElementById('watchlist')

searchBtn.addEventListener('click', async () => {
    moviesArray = []
    const movieSearched = document.getElementById('movieSearched').value
    const url = `https://www.omdbapi.com/?s=${movieSearched}&apikey=d28c5507`


    moviesHolder.innerHTML = '<div class="loading">Loading...</div>'

    try {
        const response = await fetch(url)
        const data = await response.json()
        

        moviesImdbID = []
        moviesArray = data
        
        getMoviesImdbId()
        checkForMovies()
        await getExtraMovieDetails()
        renderMovies();
        readMore()
    } 
    catch (error) {
        moviesHolder.innerHTML = '<div class="error">Error searching movies. Please try again.</div>'
    }
})

watchlist.addEventListener('click', () => {
    window.location.href = 'watchlist.html';
});

function checkForMovies() {
    if (!moviesArray.Response) {
        throw new Error('No response from API');
    }
    if (moviesArray.Response === "True" && moviesArray.Search) {
        moviesPlaceholder.style.display = "none";
        moviesHolder.style.display = "flex";

    } else {
        moviesPlaceholder.style.display = "flex";
        moviesHolder.style.display = "none";
        noMoviesFound.innerHTML = `<h3>Unable to find what you’re looking for. Please try another search.</h3>`
    }
}

function getMoviesImdbId() {
    if (moviesArray.Response === "True" && moviesArray.Search) {
        moviesArray.Search.slice(0,6).forEach((movie) => {
            moviesImdbID.push(movie.imdbID);
        });
    }
}

async function getExtraMovieDetails() {
    const promises = moviesImdbID.map((movieId) => {
        let url = `https://www.omdbapi.com/?i=${movieId}&apikey=d28c5507`;
        return fetch(url)
        .then(res => res.json());
    });
    extraMovies = await Promise.all(promises);
}

moviesHolder.addEventListener('click', (event) => {
    const movieElement = event.target.closest('.add-watchlist')?.closest('.movies');
    if (!movieElement) return;
    
    const movieIndex = [...moviesHolder.children].indexOf(movieElement);
    addToWatchlist(extraMovies[movieIndex]);
});

function addToWatchlist(movie) {
    const currentWatchlist = JSON.parse(localStorage.getItem("addedMovies")) || [];
    
    const isDuplicate = currentWatchlist.some(item => item.imdbID === movie.imdbID);
    
    if (!isDuplicate) {
        currentWatchlist.unshift(movie);
        localStorage.setItem("addedMovies", JSON.stringify(currentWatchlist));
        moviesAddedToWatchlist = currentWatchlist;
    }
}

function readMore(){
    document.querySelectorAll('.read-more-btn').forEach(button => {
        button.addEventListener('click', function() {
            const description = this.previousElementSibling;
            const isCollapsed = description.classList.contains('collapsed');
            
            description.classList.toggle('collapsed');            
            this.textContent = isCollapsed ? 'Read less' : 'Read more';
        });
    });
}

function renderMovies() {
    moviesHolder.innerHTML = ""
    extraMovies.forEach((movie) => {
        const description = movie.Plot;
        moviesHolder.innerHTML += 
        ` <div class="movies">
                <img class="movie-img" src="${movie.Poster}" alt="${movie.Title}">
                <div class="movie-details">
                    <div class="ratings">
                        <p class="movie-title">${movie.Title}</p> 
                        <p class="small-font"><span id="star">⭐</span>${movie.Ratings[0]?.Value || 'N/A'}</p>
                    </div>
                    <div class="extra-movie-details">
                        <p class="small-font">${movie.Runtime}</p>
                        <p class="small-font" id="movie-genre">${movie.Genre}</p>
                        <div class="add-watchlist">
                            <img class="add-icon" src="images/add-icon.png" alt="">
                            <p class="small-font">Watchlist</p>
                        </div>
                    </div>
                    <div class="description-container">
                        <p class="movie-description collapsed">${description}</p>
                        ${description.length > 160 ? `<button class="read-more-btn">Read more</button>` : ''}
                    </div>
            </div>
        `;
    });

}

