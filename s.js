import { key } from './key.js';

let movieNameRef = document.getElementById("movie-name");
let searchBtn = document.getElementById("search-btn");
let result = document.getElementById("result");

// Create a dropdown for suggestions
let suggestionBox = document.createElement("ul");
suggestionBox.classList.add("suggestions");
document.querySelector(".search-container").appendChild(suggestionBox);

// Placeholder image for missing posters
const placeholderImage = "no-image.png";

// Fetch movie suggestions as user types
let getMovieSuggestions = async () => {
    let movieName = movieNameRef.value.trim();
    
    if (movieName.length > 2) {
        let url = `https://www.omdbapi.com/?s=${encodeURIComponent(movieName)}&apikey=${key}`;
        
        try {
            let response = await fetch(url);
            let data = await response.json();
            
            if (data.Response === "True") {
                showSuggestions(data.Search);
            } else {
                suggestionBox.innerHTML = "";
            }
        } catch (error) {
            console.error("Error fetching movie suggestions:", error);
        }
    } else {
        suggestionBox.innerHTML = "";
    }
};

// Show movie suggestions in a dropdown with images
let showSuggestions = (movies) => {
    suggestionBox.innerHTML = "";

    movies.forEach(movie => {
        let listItem = document.createElement("li");

        // Ensure image loads or use a placeholder
        let moviePoster = movie.Poster !== "N/A" ? movie.Poster : placeholderImage;

        listItem.innerHTML = `
            <img src="${moviePoster}" class="suggestion-poster" alt="${movie.Title}">
            <span>${movie.Title} (${movie.Year})</span>
        `;

        listItem.addEventListener("click", () => {
            movieNameRef.value = movie.Title;
            suggestionBox.innerHTML = ""; // Hide suggestions after selection
            getMovies(); // Fetch movies after selection
        });

        suggestionBox.appendChild(listItem);
    });
};

// Fetch and display multiple movies with their details
let getMovies = async () => {
    let movieName = movieNameRef.value.trim();
    let url = `https://www.omdbapi.com/?s=${encodeURIComponent(movieName)}&apikey=${key}`;

    if (!movieName) {
        result.innerHTML = `<h3 class="msg">Please enter a movie name</h3>`;
        return;
    }

    suggestionBox.innerHTML = ""; // Ensure suggestions are hidden

    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.Response === "True") {
            result.innerHTML = ""; // Clear previous results

            data.Search.forEach(movie => {
                let movieCard = document.createElement("div");
                movieCard.classList.add("movie-card");

                // Ensure poster is available
                let moviePoster = movie.Poster !== "N/A" ? movie.Poster : placeholderImage;

                movieCard.innerHTML = `
                    <img src="${moviePoster}" class="poster" alt="${movie.Title}">
                    <div class="movie-info">
                        <h3>${movie.Title}</h3>
                        <p><strong>Year:</strong> ${movie.Year}</p>
                        <button class="details-btn" data-id="${movie.imdbID}">View Details</button>
                    </div>
                `;

                result.appendChild(movieCard);
            });

            // Add event listeners to "View Details" buttons
            document.querySelectorAll(".details-btn").forEach(btn => {
                btn.addEventListener("click", (e) => getMovieDetails(e.target.dataset.id));
            });

        } else {
            result.innerHTML = `<h3 class="msg">No movies found</h3>`;
        }
    } catch (error) {
        console.error("Error fetching movies:", error);
        result.innerHTML = `<h3 class="msg">An error occurred while fetching movies</h3>`;
    }
};

// Fetch and display full movie details
let getMovieDetails = async (movieID) => {
    let url = `https://www.omdbapi.com/?i=${movieID}&apikey=${key}`;

    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.Response === "True") {
            result.innerHTML = `
                <button id="back-btn">🔙 Back to Results</button>
                <div class="info">
                    <img src="${data.Poster !== "N/A" ? data.Poster : placeholderImage}" class="poster" alt="${data.Title} Poster">
                    <div>
                        <h2>${data.Title}</h2>
                        <div class="rating">
                            <img src="star.svg" alt="Rating Star">
                            <h4>${data.imdbRating}</h4>
                        </div>
                        <div class="details">
                            <span>${data.Rated}</span>
                            <span>${data.Runtime}</span>
                            <span>${data.Year}</span>
                        </div>
                        <div class="genre">
                            <div>${data.Genre.split(",").join("</div><div>")}</div>
                        </div>
                    </div>
                </div>

                <h3>Plot:</h3>
                <p>${data.Plot}</p>
                <h3>Director:</h3>
                <p>${data.Director}</p>
                <h3>Actors:</h3>
                <p>${data.Actors}</p>
            `;

            document.querySelector(".search-container").style.display = "block";

            document.getElementById("back-btn").addEventListener("click", getMovies);
        } else {
            result.innerHTML = `<h3 class="msg">Movie details not found</h3>`;
        }
    } catch (error) {
        console.error("Error fetching movie details:", error);
        result.innerHTML = `<h3 class="msg">An error occurred while fetching movie details</h3>`;
    }
};

// Event Listeners
searchBtn.addEventListener("click", getMovies);
movieNameRef.addEventListener("input", getMovieSuggestions);
