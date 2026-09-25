require('dotenv').config();

const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Bubble Sort
// เรียงคะแนนหนังจากมาก → น้อย
function bubbleSortMovies(movies) {

    const arr = [...movies];

    for (let i = 0; i < arr.length - 1; i++) {

        for (let j = 0; j < arr.length - 1 - i; j++) {

            if (arr[j].vote_average < arr[j + 1].vote_average) {

                const temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }

    return arr;
}

// Discover Movies
app.get('/movies', async (req, res) => {

    try {

        const {
            genre,
            minRating,
            yearFrom,
            page = 1
        } = req.query;

        const params = new URLSearchParams();

        params.append('api_key', TMDB_API_KEY);
        params.append('language', 'th-TH');
        params.append('include_adult', 'false');
        params.append('page', page);

        // Genre
        if (genre) {
            params.append('with_genres', genre);
        }

        // คะแนนขั้นต่ำ
        if (minRating) {
            params.append('vote_average.gte', minRating);
        }

        // ปีเริ่มต้น
        if (yearFrom) {
            params.append(
                'primary_release_date.gte',
                `${yearFrom}-01-01`
            );
        }

        const url =
            `https://api.themoviedb.org/3/discover/movie?${params.toString()}`;

        const response = await fetch(url);

            const data = await response.json();

            const movies = data.results.map(movie => {

    const genreNames = movie.genre_ids.map(genreId => {
        return genreTable.get(genreId);
    });

    return {
        ...movie,
        genres: genreNames
    };
});

const sortedMovies = bubbleSortMovies(movies);

res.json({
    page: data.page,
    results: sortedMovies,
    total_pages: data.total_pages,
    total_results: data.total_results
});

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'ไม่สามารถดึงข้อมูลหนังจาก TMDB ได้'
        });
    }
});

app.get('/trailer/:movieId', async (req, res) => {
    try {
        const { movieId } = req.params;

        const url =
            `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${process.env.TMDB_API_KEY}&language=en-US`;

        const response = await fetch(url);
        const data = await response.json();

        const trailer = data.results.find(video =>
            video.site === 'YouTube' &&
            (video.type === 'Trailer' || video.type === 'Teaser')
        );

        if (!trailer) {
            return res.json({
                found: false
            });
        }

        res.json({
            found: true,
            key: trailer.key
        });

    } catch (error) {
        console.error('Trailer Error:', error);

        res.status(500).json({
            found: false,
            error: 'ไม่สามารถโหลด Trailer ได้'
        });
    }
});

// Hash Table สำหรับเก็บ Genre
class HashTable {
    constructor(size = 50) {
        this.size = size;
        this.table = Array.from({ length: size }, () => []);
    }

    // ฟังก์ชัน Hash
    hash(key) {
        return Number(key) % this.size;
    }

    // เพิ่มข้อมูล
    set(key, value) {
        const index = this.hash(key);

        const bucket = this.table[index];

        const existing = bucket.find(item => item.key === key);

        if (existing) {
            existing.value = value;
        } else {
            bucket.push({
                key: key,
                value: value
            });
        }
    }

    // ค้นหาข้อมูล
    get(key) {
        const index = this.hash(key);

        const bucket = this.table[index];

        const item = bucket.find(item => item.key === key);

        return item ? item.value : 'Unknown';
    }
}

const genreTable = new HashTable();

// โหลด Genre จาก TMDB
async function loadGenres() {
    try {
        const url =
            `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`;

        const response = await fetch(url);
        const data = await response.json();

        data.genres.forEach(genre => {
            genreTable.set(genre.id, genre.name);
        });

        console.log(`Loaded ${data.genres.length} genres`);
    } catch (error) {
        console.error('ไม่สามารถโหลด Genre จาก TMDB ได้:', error);
    }
}

// Test Hash Table
// ส่ง Genre ให้หน้าเว็บ
app.get('/genres', (req, res) => {

    const genres = [];

    for (let i = 0; i < genreTable.size; i++) {

        const bucket = genreTable.table[i];

        bucket.forEach(item => {
            genres.push({
                id: item.key,
                name: item.value
            });
        });
    }

    res.json(genres);
});
loadGenres().then(() => {

    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });

});