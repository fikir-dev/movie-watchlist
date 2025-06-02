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
        console.log(moviesImdbID)
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
    const movie = extraMovies[movieIndex];
    const isInWatchlist = moviesAddedToWatchlist.some(item => item.imdbID === movie.imdbID);
    
    if (isInWatchlist) {
        removeFromWatchlist(movie);
    } else {
        addToWatchlist(movie);
    }
});

function removeFromWatchlist(movie) {
    const currentWatchlist = JSON.parse(localStorage.getItem("addedMovies")) || [];
    const updatedWatchlist = currentWatchlist.filter(item => item.imdbID !== movie.imdbID);
    
    localStorage.setItem("addedMovies", JSON.stringify(updatedWatchlist));
    moviesAddedToWatchlist = updatedWatchlist;
    
    // Find and update the button state
    const movieCard = document.querySelector(`[data-movie-id="${movie.imdbID}"]`);
    if (movieCard) {
        const watchlistBtn = movieCard.querySelector('.add-watchlist');
        updateWatchlistButton(watchlistBtn, false);
    }
}

function addToWatchlist(movie) {
    const currentWatchlist = JSON.parse(localStorage.getItem("addedMovies")) || [];
    
    const isDuplicate = currentWatchlist.some(item => item.imdbID === movie.imdbID);
    
    if (!isDuplicate) {
        currentWatchlist.unshift(movie);
        localStorage.setItem("addedMovies", JSON.stringify(currentWatchlist));
        moviesAddedToWatchlist = currentWatchlist;
        
        // Find and update the button state
        const movieCard = document.querySelector(`[data-movie-id="${movie.imdbID}"]`);
        if (movieCard) {
            const watchlistBtn = movieCard.querySelector('.add-watchlist');
            updateWatchlistButton(watchlistBtn, true);
        }
    }
}

function updateWatchlistButton(buttonElement, isAdded) {
    const icon = buttonElement.querySelector('.add-icon');
    const text = buttonElement.querySelector('.small-font');
    
    if (isAdded) {
        icon.src = 'images/subtract-icon.png';
        text.textContent = 'Added';
    } else {
        icon.src = 'images/add-icon.png';
        text.textContent = 'Watchlist';
    }
}

function readMore(){
    document.querySelectorAll('.read-more-btn').forEach(button => {
        // Remove any existing event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Check if the text actually needs truncation
        const description = newButton.previousElementSibling;
        const needsTruncation = description.scrollHeight > description.clientHeight;
        
        // Only show the button if truncation is needed
        newButton.style.display = needsTruncation ? 'block' : 'none';
        
        newButton.addEventListener('click', function() {
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
        const isInWatchlist = moviesAddedToWatchlist.some(item => item.imdbID === movie.imdbID);
        
        moviesHolder.innerHTML += 
        ` <div class="movies" data-movie-id="${movie.imdbID}">
                <img class="movie-img" src="${movie.Poster}" alt="${movie.Title}">
                <div class="movie-details">
                    <div class="ratings">
                        <p class="movie-title">${movie.Title}</p> 
                        <p class="small-font"><span id="star">⭐</span>${movie.Ratings[0]?.Value || 'N/A'}</p>
                    </div>
                    <div class="extra-movie-details">
                        <p class="small-font">${movie.Runtime}</p>
                        <p class="small-font" id="movie-genre">${movie.Genre}</p>
                        <div class="add-watchlist transition-all duration-300 hover:scale-110 cursor-pointer rounded-lg p-2">
                            <img class="add-icon" src="${isInWatchlist ? 'images/subtract-icon.png' : 'images/add-icon.png'}" alt="">
                            <p class="small-font">${isInWatchlist ? 'Added' : 'Watchlist'}</p>
                        </div>
                    </div>
                    <div class="description-container">
                        <p class="movie-description collapsed">${description}</p>
                        <button class="read-more-btn" style="display: ${description && description.length > 50 ? 'block' : 'none'}">Read more</button>
                    </div>
            </div>
        `;
    });
    readMore();
}

