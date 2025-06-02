
const addToWatchList = document.getElementById('add-movies');
const searchForMovies = document.getElementById('search-for-movies');
const storedMovies = JSON.parse(localStorage.getItem("addedMovies")) || []
const moviesWatchlistHolder = document.getElementById('movies-watchlist-outter') 
const placeHolder = document.getElementById('add-watchlist-movies')


function renderWatchlist(){
    storedMovies.forEach((movie) => {
        const description = movie.Plot
        moviesWatchlistHolder.innerHTML +=  
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
                        <div class="add-watchlist transition-all duration-300 hover:scale-110 cursor-pointer rounded-lg p-2">
                            <img class="add-icon" src="images/subtract-icon.png" alt="">
                            <p class="small-font">Remove</p>
                        </div>
                    </div>
                        <div class="description-container">
                            <p class="movie-description collapsed">${description}</p>
                            ${description.length > 160 ? `<button class="read-more-btn">Read more</button>` : ''}
                        </div>
                    </div>
             </div>
        `;
    })

    if (storedMovies.length > 0){  
        placeHolder.style.display = 'none'
        moviesWatchlistHolder.style.display = 'flex'
   }

   document.querySelectorAll('.read-more-btn').forEach(button => {
    button.addEventListener('click', function() {
        const description = this.previousElementSibling;
        const isCollapsed = description.classList.contains('collapsed');
        
        description.classList.toggle('collapsed');
        description.classList.toggle('expanded');
        
        this.textContent = isCollapsed ? 'Read less' : 'Read more';
    });
});
}

addToWatchList.addEventListener('click', () => {
    window.location.href = 'index.html';
});

searchForMovies.addEventListener('click', () => {
    window.location.href = 'index.html';
})

moviesWatchlistHolder.addEventListener('click', (e) => {
    const addWatchlistButton = e.target.closest('.add-watchlist');
    if (addWatchlistButton) {
        const movieIndex = Array.from(moviesWatchlistHolder.children).indexOf
        (addWatchlistButton.closest('.movies'));
        storedMovies.splice(movieIndex, 1);
        addWatchlistButton.closest('.movies').remove();

        localStorage.setItem("addedMovies", JSON.stringify(storedMovies));
        
        if (storedMovies.length === 0) {
            placeHolder.style.display = 'flex';
            moviesWatchlistHolder.style.display = 'none';
        }
    }
})

renderWatchlist()
