// script.js

document.addEventListener('DOMContentLoaded', () => {
    const filmsList = document.getElementById('films');
    const movieTitle = document.getElementById('movie-title');
    const moviePoster = document.getElementById('movie-poster');
    const movieRuntime = document.getElementById('movie-runtime').querySelector('span');
    const movieShowtime = document.getElementById('movie-showtime').querySelector('span');
    const movieDescription = document.getElementById('movie-description').querySelector('span');
    const movieTickets = document.getElementById('movie-tickets').querySelector('span');
    const buyTicketButton = document.getElementById('buy-ticket-btn');

    let movies = [];

    // Fetch and display the first movie's details
    function fetchFirstMovie() {
        fetch('http://localhost:3000/films/1')
            .then(response => response.json())
            .then(data => {
                displayMovieDetails(data);
            })
            .catch(error => console.error('Error fetching first movie:', error));
    }

    // Fetch and display all movies in the list
    function fetchAllMovies() {
        fetch('http://localhost:3000/films')
            .then(response => response.json())
            .then(data => {
                movies = data;
                renderMovieList(data);
            })
            .catch(error => console.error('Error fetching movies:', error));
    }

    // Render movie list in the sidebar
    function renderMovieList(movies) {
        filmsList.innerHTML = ''; // Clear existing list
        movies.forEach(movie => {
            const li = document.createElement('li');
            li.textContent = movie.title;
            li.className = 'film item';
            if (movie.capacity - movie.tickets_sold === 0) {
                li.classList.add('sold-out');
            }

            // Create delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'x';
            deleteButton.className = 'delete-btn';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent triggering movie details click
                deleteMovie(movie.id, li);
            });

            li.appendChild(deleteButton);
            li.addEventListener('click', () => {
                displayMovieDetails(movie);
            });

            filmsList.appendChild(li);
        });
    }

    // Display movie details
    function displayMovieDetails(movie) {
        movieTitle.textContent = movie.title;
        moviePoster.src = movie.poster;
        movieRuntime.textContent = movie.runtime + " minutes";
        movieShowtime.textContent = movie.showtime;
        movieDescription.textContent = movie.description;
        movieTickets.textContent = movie.capacity - movie.tickets_sold;

        // Enable or disable the buy ticket button
        if (movie.capacity - movie.tickets_sold > 0) {
            buyTicketButton.disabled = false;
            buyTicketButton.classList.remove('sold-out');
            buyTicketButton.textContent = 'Buy Ticket';
        } else {
            buyTicketButton.disabled = true;
            buyTicketButton.classList.add('sold-out');
            buyTicketButton.textContent = 'Sold Out';
        }

        // Update the button's click event to buy a ticket for the current movie
        buyTicketButton.onclick = () => buyTicket(movie);
    }

    // Buy ticket function with PATCH request
    function buyTicket(movie) {
        const availableTickets = movie.capacity - movie.tickets_sold;
        if (availableTickets > 0) {
            movie.tickets_sold += 1;
            movieTickets.textContent = availableTickets - 1;

            // Persist updated tickets_sold
            fetch(`http://localhost:3000/films/${movie.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tickets_sold: movie.tickets_sold })
            })
            .then(response => response.json())
            .then(updatedMovie => {
                // Update local movie data with the response
                movie = updatedMovie;

                // Check if sold out
                if (movie.capacity - movie.tickets_sold === 0) {
                    buyTicketButton.disabled = true;
                    buyTicketButton.classList.add('sold-out');
                    buyTicketButton.textContent = 'Sold Out';

                    // Update the sold out class for the movie in the list
                    const movieListItem = [...filmsList.children].find(li => li.textContent === movie.title);
                    movieListItem.classList.add('sold-out');
                }
            })
            .catch(error => console.error('Error updating tickets sold:', error));
        }
    }

    // Delete movie function
    function deleteMovie(movieId, movieListItem) {
        fetch(`http://localhost:3000/films/${movieId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                movieListItem.remove(); // Remove movie from the list
            } else {
                console.error('Error deleting movie:', response.statusText);
            }
        })
        .catch(error => console.error('Error deleting movie:', error));
    }

    // Initial data fetch
    fetchFirstMovie();
    fetchAllMovies();
});
