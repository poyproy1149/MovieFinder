let currentMovies = [];
let currentPage = 1;
let totalPages = 1;

// โหลด Genre
async function loadGenres() {

    try {

        const response = await fetch('/genres');

        const genres = await response.json();

        const genreSelect = document.getElementById('genre');

        genres.forEach(genre => {

            const option = document.createElement('option');

            option.value = genre.id;
            option.textContent = genre.name;

            genreSelect.appendChild(option);
        });

    } catch (error) {

        console.error('ไม่สามารถโหลด Genre ได้:', error);

    }
}


// ค้นหาหนัง
async function searchMovies(page = 1) {

    currentPage = page;

    const genre =
        document.getElementById('genre').value;

    const minRating =
        document.getElementById('minRating').value;

    const yearFrom =
        document.getElementById('yearFrom').value;


    const params = new URLSearchParams();

    if (genre) {
        params.append('genre', genre);
    }

    if (minRating) {
        params.append('minRating', minRating);
    }

    if (yearFrom) {
        params.append('yearFrom', yearFrom);
    }

    // สำคัญมาก
    params.append('page', page);


    showLoading();


    try {

        const response =
            await fetch(`/movies?${params.toString()}`);

        const data =
    await response.json();

        if (!response.ok) {
            throw new Error('ไม่สามารถค้นหาหนังได้');
        }

        currentMovies = data.results || [];

        totalPages = data.total_pages || 1;

        renderMovies(currentMovies);

        document.getElementById('searchInfo').textContent =
            `พบหนัง ${data.total_results || currentMovies.length} เรื่อง • หน้า ${currentPage} จาก ${totalPages} • เรียงคะแนนจากมากไปน้อย`;

        renderPagination();

    } catch (error) {

        showError(error.message);

    }
}

function renderMovies(movies) {

    const movieList = document.getElementById('movieList');

    if (movies.length === 0) {
        movieList.innerHTML = `
            <div class="error">
                ไม่พบหนังตามเงื่อนไขที่เลือก
            </div>
        `;
        return;
    }

    movieList.innerHTML = movies.map(movie => {

        const poster = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Poster';

        const year = movie.release_date
            ? movie.release_date.substring(0, 4)
            : 'ไม่ทราบปี';

        const genres = movie.genres
            ? movie.genres.join(', ')
            : 'ไม่ทราบประเภท';

        return `
            <div class="movie-card">

                <img
                    src="${poster}"
                    alt="${escapeHTML(movie.title)}"
                >

                <div class="movie-info">

                    <div class="movie-title">
                        ${escapeHTML(movie.title)}
                    </div>

                    <div class="movie-rating">
                        ⭐ ${movie.vote_average.toFixed(1)}
                    </div>

                    <div class="movie-year">
                        📅 ${year}
                    </div>

                    <div class="movie-genres">
                        🎭 ${escapeHTML(genres)}
                    </div>

                    <button
                        class="detail-button"
                        onclick="openMovieModal(${movie.id})"
                    >
                        ดูรายละเอียด
                    </button>

                </div>

            </div>
        `;

    }).join('');
}

// แสดง Movie Cards
function renderPagination() {

    const movieList =
        document.getElementById('movieList');


    if (totalPages <= 1) {
        return;
    }

    const pagination =
        document.createElement('div');

    pagination.className = 'pagination';
    pagination.innerHTML = `

        <button
            class="page-button"
            id="prevPage"
            ${currentPage === 1 ? 'disabled' : ''}
        >
            ← ก่อนหน้า
        </button>

        <span class="page-number">
            หน้า ${currentPage} จาก ${totalPages}
        </span>

        <button
            class="page-button"
            id="nextPage"
            ${currentPage === totalPages ? 'disabled' : ''}
        >
            ถัดไป →
        </button>

    `;

    movieList.appendChild(pagination);

    document
    .getElementById('prevPage')
    .addEventListener('click', () => {

        if (currentPage > 1) {
            searchMovies(currentPage - 1);

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

    });

    document
    .getElementById('nextPage')
    .addEventListener('click', () => {

        if (currentPage < totalPages) {
            searchMovies(currentPage + 1);

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

    });
}

// สุ่มหนัง
async function randomMovie() {

    const genre =
        document.getElementById('genre').value;

    const minRating =
        document.getElementById('minRating').value;

    const yearFrom =
        document.getElementById('yearFrom').value;

    const params = new URLSearchParams();

    if (genre) {
        params.append('genre', genre);
    }

    if (minRating) {
        params.append('minRating', minRating);
    }

    if (yearFrom) {
        params.append('yearFrom', yearFrom);
    }

    try {

        const response =
            await fetch(`/movies?${params.toString()}`);
        const data = await response.json();


        if (!data.results || data.results.length === 0) {

            showError('ไม่พบหนังสำหรับสุ่ม');

            return;
        }

        const randomIndex =
            Math.floor(Math.random() * data.results.length);

        const movie =
            data.results[randomIndex];

        showRandomMovie(movie);

    } catch (error) {

        console.error('Random Error:', error);

        showError('ไม่สามารถสุ่มหนังได้');

    }
}

// แสดงหนังที่สุ่มได้
function showRandomMovie(movie, isFromFavorites = false) {

    const modal =
        document.getElementById('movieModal');

    const modalContent =
        document.getElementById('modalContent');

    const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster';

    const backdrop = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : poster;

    modalContent.style.setProperty(
        '--movie-bg',
        `url("${backdrop}")`
    );

    modalContent.innerHTML = `
        <button id="closeModal">
            ×
        </button>

        <img src="${poster}" alt="${escapeHTML(movie.title)}">

        <h2 class="modal-title">
            ${escapeHTML(movie.title)}
        </h2>

        <p>
            ⭐ คะแนน: ${movie.vote_average.toFixed(1)}
        </p>

        <p>
            📅 ปี: ${movie.release_date || 'ไม่ทราบ'}
        </p>

        <p>
            🎭 ${escapeHTML(movie.genres.join(', '))}
        </p>

        <p>
            ${escapeHTML(movie.overview || 'ไม่มีเรื่องย่อ')}
        </p>

        <button id="favoriteButton" class="favorite-button">
            ❤️ เพิ่มในหนังที่ชอบ
        </button>

        ${isFromFavorites ? `
        <button id="removeFavoriteButton" class="remove-favorite-button">
        🗑️ เอาออกจากหนังที่ชอบ
        </button>
        ` : ''}

        <button id="trailerButton" class="trailer-button">
        ▶️ ดู Trailer
        </button>
    `;

    modal.style.display = 'block';

    document
    .getElementById('favoriteButton')
    .addEventListener('click', () => {
        saveFavorite(movie);
        alert('เพิ่มหนังในรายการที่ชอบเรียบร้อย ❤️');
    });

    if (isFromFavorites) {
    document
        .getElementById('removeFavoriteButton')
        .addEventListener('click', () => {
            removeFavorite(movie.id);
            alert('ลบหนังออกจากรายการที่ชอบเรียบร้อย 🗑️');
            closeModal();
            showFavorites();
        });
    }

    const closeButton = document.getElementById('closeModal');

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    document
    .getElementById('trailerButton')
    .addEventListener('click', () => {
        watchTrailer(movie);
    });
}
function showFavorites() {
    const favorites = getFavorites();

    currentMovies = favorites;
    currentPage = 1;
    totalPages = 1;

    document.getElementById('searchInfo').textContent =
        favorites.length > 0
            ? `หนังที่ชอบ ${favorites.length} เรื่อง`
            : 'ยังไม่มีหนังที่ชอบ';

    renderMovies(favorites);
}

async function watchTrailer(movie) {
    try {
        const response = await fetch(`/trailer/${movie.id}`);
        const data = await response.json();

        if (!data.found) {
            alert('ไม่พบ Trailer ของหนังเรื่องนี้ 🎬');
            return;
        }

        const modalContent =
            document.getElementById('modalContent');

        modalContent.innerHTML = `
            <button id="closeModal">
                ×
            </button>

            <h2 class="modal-title">
                🎬 ${escapeHTML(movie.title)} - Trailer
            </h2>

            <div class="trailer-container">
                <iframe
                    src="https://www.youtube.com/embed/${data.key}"
                    title="${escapeHTML(movie.title)} Trailer"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
            </div>
        `;

        document
            .getElementById('closeModal')
            .addEventListener('click', closeModal);

    } catch (error) {
        console.error('Trailer Error:', error);

        alert('ไม่สามารถโหลด Trailer ได้');
    }
}

// ดูรายละเอียดหนัง
function openMovieModal(movieId) {

    const movie =
        currentMovies.find(movie => movie.id === movieId);

    if (!movie) {
        return;
    }

    const isFromFavorites = getFavorites()
        .some(item => item.id === movieId);

    showRandomMovie(movie, isFromFavorites);
}

// ปิด Modal
function closeModal() {

    document.getElementById('movieModal').style.display = 'none';

}

// Loading
function showLoading() {

    document.getElementById('movieList').innerHTML = `
        <div class="loading">
            🔄 กำลังค้นหาหนัง...
        </div>
    `;
}

// Error
function showError(message) {

    document.getElementById('movieList').innerHTML = `
        <div class="error">
            ❌ ${escapeHTML(message)}
        </div>
    `;

}

// ป้องกัน HTML แปลก ๆ
function escapeHTML(text) {

    if (!text) {
        return '';
    }

    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Light / Dark Mode
function setupTheme() {

    const themeToggle =
        document.getElementById('themeToggle');

    if (!themeToggle) {
        return;
    }

    const savedTheme =
        localStorage.getItem('movieFinderTheme');


    if (savedTheme === 'light') {

        document.body.classList.add('light-mode');

        themeToggle.textContent = '🌙';

        themeToggle.title = 'เปลี่ยนเป็นโหมดมืด';

    } else {

        themeToggle.textContent = '☀️';

        themeToggle.title = 'เปลี่ยนเป็นโหมดสว่าง';

    }

    themeToggle.addEventListener('click', () => {

        document.body.classList.toggle('light-mode');

        const isLightMode =
            document.body.classList.contains('light-mode');


        if (isLightMode) {

            localStorage.setItem(
                'movieFinderTheme',
                'light'
            );

            themeToggle.textContent = '🌙';

            themeToggle.title = 'เปลี่ยนเป็นโหมดมืด';

        } else {

            localStorage.setItem(
                'movieFinderTheme',
                'dark'
            );

            themeToggle.textContent = '☀️';

            themeToggle.title = 'เปลี่ยนเป็นโหมดสว่าง';

        }

    });
}

async function setHeroBackdrop() {

    const header = document.querySelector('header');

    if (!header) {
        return;
    }

    try {

        const response = await fetch('/movies?page=1');
        const data = await response.json();

        const heroMovies = (data.results || []).filter(
            movie => movie.backdrop_path
        );

        if (heroMovies.length === 0) {
            return;
        }

        let heroIndex = 0;

        const updateHeroImage = () => {

            const movie = heroMovies[heroIndex];

            if (!movie) {
                return;
            }

            const backdropUrl =
                `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;

            header.style.setProperty(
                '--hero-backdrop',
                `url("${backdropUrl}")`
            );

            heroIndex = (heroIndex + 1) % heroMovies.length;
        };

        updateHeroImage();

        setInterval(updateHeroImage, 5000);

    } catch (error) {

        console.error('ไม่สามารถโหลดภาพ Hero ได้:', error);

    }
}

function getFavorites() {
    return JSON.parse(
        localStorage.getItem('movieFinderFavorites')
    ) || [];
}

function saveFavorite(movie) {

    const favorites = getFavorites();

    const alreadyFavorite =
        favorites.some(item => item.id === movie.id);

    if (!alreadyFavorite) {
        favorites.push(movie);

        localStorage.setItem(
            'movieFinderFavorites',
            JSON.stringify(favorites)
        );
    }
}

function removeFavorite(movieId) {
    const favorites = getFavorites();

    const updatedFavorites = favorites.filter(
        movie => movie.id !== movieId
    );

    localStorage.setItem(
        'movieFinderFavorites',
        JSON.stringify(updatedFavorites)
    );
}

// เริ่มต้นหน้าเว็บ
document.addEventListener('DOMContentLoaded', () => {

    loadGenres();

    setupTheme();

    setHeroBackdrop();

    document
    .getElementById('searchButton')
    .addEventListener('click', () => {
        searchMovies(1);
    });

    document
        .getElementById('randomButton')
        .addEventListener('click', randomMovie);

    document
    .getElementById('favoritesButton')
    .addEventListener('click', showFavorites);

    document
        .getElementById('movieModal')
        .addEventListener('click', event => {

            if (event.target.id === 'movieModal') {
                closeModal();
            }

        });

});