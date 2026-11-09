const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// ==========================================
// 🧠 DSA 1: CUSTOM HASH TABLE (เขียนเองไม่ใช้ Map สำเร็จรูป)
// ==========================================
class HashNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.next = null;
    }
}

class CustomHashTable {
    constructor(size = 37) {
        this.buckets = new Array(size);
        this.size = size;
    }

    _hash(key) {
        let hash = 0;
        const keyString = String(key);
        for (let i = 0; i < keyString.length; i++) {
            hash = (hash + keyString.charCodeAt(i) * i) % this.size;
        }
        return hash;
    }

    set(key, value) {
        const index = this._hash(key);
        if (!this.buckets[index]) {
            this.buckets[index] = new HashNode(key, value);
            return;
        }
        let current = this.buckets[index];
        while (current) {
            if (current.key === key) {
                current.value = value;
                return;
            }
            if (!current.next) break;
            current = current.next;
        }
        current.next = new HashNode(key, value);
    }

    get(key) {
        const index = this._hash(key);
        let current = this.buckets[index];
        while (current) {
            if (current.key === key) return current.value;
            current = current.next;
        }
        return null;
    }

    getAll() {
        const result = [];
        for (let i = 0; i < this.size; i++) {
            let current = this.buckets[i];
            while (current) {
                result.push({ id: current.key, name: current.value });
                current = current.next;
            }
        }
        return result;
    }
}

// สร้าง Instance ของ Custom Hash Table
const genreHashTable = new CustomHashTable(50);

async function initGenres() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=th-TH`);
        const data = await response.json();
        if (data.genres) {
            data.genres.forEach(g => genreHashTable.set(g.id, g.name));
            console.log('Loaded genres into Custom Hash Table successfully!');
        }
    } catch (err) {
        console.error('Failed to load genres:', err);
    }
}
initGenres();

// 📌 ดึงภาพยนตร์
app.get('/movies', async (req, res) => {
    try {
        const { page = 1, genre, minRating, yearFrom } = req.query;
        const params = new URLSearchParams();

        params.append('api_key', TMDB_API_KEY);
        params.append('language', 'th-TH');
        params.append('include_adult', 'false');
        params.append('page', page);

        if (genre && genre !== '') params.append('with_genres', genre);
        if (minRating && minRating !== '') {
            params.append('vote_average.gte', minRating);
            params.append('vote_count.gte', '10');
        }
        if (yearFrom && yearFrom !== '') {
            params.append('primary_release_date.gte', `${yearFrom}-01-01`);
        }

        const url = `https://api.themoviedb.org/3/discover/movie?${params.toString()}`;
        const response = await fetch(url);
        const data = await response.json();

        res.json({
            page: data.page,
            total_pages: data.total_pages,
            total_results: data.total_results,
            results: data.results || []
        });
    } catch (error) {
        console.error('Fetch Movies Error:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลภาพยนตร์' });
    }
});

// ดึงหมวดหมู่หนังจาก Custom Hash Table
app.get('/genres', (req, res) => {
    res.json(genreHashTable.getAll());
});

// สุ่มหนัง 1 เรื่อง
app.get('/movies/random', async (req, res) => {
    try {
        const { genre, minRating, yearFrom } = req.query;
        const params = new URLSearchParams();

        params.append('api_key', TMDB_API_KEY);
        params.append('language', 'th-TH');
        params.append('include_adult', 'false');
        params.append('page', '1');

        if (genre && genre !== '') params.append('with_genres', genre);
        if (minRating) {
            params.append('vote_average.gte', minRating);
            params.append('vote_count.gte', '10');
        }
        if (yearFrom) params.append('primary_release_date.gte', `${yearFrom}-01-01`);

        const url = `https://api.themoviedb.org/3/discover/movie?${params.toString()}`;
        const response = await fetch(url);
        const data = await response.json();

        let resultsList = data.results || [];
        if (resultsList.length === 0) {
            const fallbackUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=th-TH&page=1`;
            const fallbackRes = await fetch(fallbackUrl);
            const fallbackData = await fallbackRes.json();
            resultsList = fallbackData.results || [];
        }

        if (resultsList.length === 0) {
            return res.json({ found: false, message: 'ไม่พบภาพยนตร์' });
        }

        const randomIndex = Math.floor(Math.random() * resultsList.length);
        const selectedMovie = resultsList[randomIndex];

        const genreNames = selectedMovie.genre_ids
            ? selectedMovie.genre_ids.map(id => genreHashTable.get(id))
            : [];

        res.json({
            found: true,
            movie: {
                ...selectedMovie,
                genres: genreNames
            }
        });
    } catch (error) {
        console.error('Random Movie Error:', error);
        res.status(500).json({ found: false, message: 'เกิดข้อผิดพลาดในการสุ่มหนัง' });
    }
});

// ดึงข้อมูลผู้กำกับ/นักแสดง
app.get('/movie/:id/credits', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${TMDB_API_KEY}&language=th-TH`);
        const data = await response.json();

        const directors = (data.crew || []).filter(c => c.job === 'Director');
        const cast = (data.cast || []).slice(0, 10);

        res.json({ directors, cast });
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล Credits' });
    }
});

// 📺 ดึงข้อมูลแอปสตรีมมิ่ง (TH)
app.get('/movie/:id/providers', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${TMDB_API_KEY}`);
        const data = await response.json();

        const thProviders = data.results && data.results.TH ? data.results.TH : null;
        res.json({
            flatrate: thProviders?.flatrate || [],
            rent: thProviders?.rent || [],
            buy: thProviders?.buy || [],
            link: thProviders?.link || null
        });
    } catch (error) {
        console.error('Watch Providers Error:', error);
        res.status(500).json({ flatrate: [], rent: [], buy: [] });
    }
});

// ดึงผลงานของคน
app.get('/person/:id/movies', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await fetch(`https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=${TMDB_API_KEY}&language=th-TH`);
        const data = await response.json();

        const movies = [...(data.cast || []), ...(data.crew || [])];
        const uniqueMovies = Array.from(new Map(movies.map(m => [m.id, m])).values());

        res.json({ movies: uniqueMovies.slice(0, 10) });
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผลงาน' });
    }
});

// ดึง Trailer
app.get('/trailer/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`);
        const data = await response.json();

        const trailer = (data.results || []).find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
        if (trailer) {
            res.json({ found: true, key: trailer.key });
        } else {
            res.json({ found: false });
        }
    } catch (error) {
        res.status(500).json({ found: false });
    }
});

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));