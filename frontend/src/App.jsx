import { useState, useEffect } from 'react'
import './App.css'

// ==========================================
// 🧠 DSA 2: CUSTOM QUICK SORT ALGORITHM (เขียนเองไม่ใช้ Array.prototype.sort())
// Time Complexity: O(n log n)
// ==========================================
function customQuickSort(arr, sortBy) {
  if (arr.length <= 1) return arr

  const pivot = arr[arr.length - 1]
  const left = []
  const right = []

  for (let i = 0; i < arr.length - 1; i++) {
    const item = arr[i]
    let isSmaller = false

    if (sortBy === 'rating-desc') {
      isSmaller = (item.vote_average || 0) > (pivot.vote_average || 0)
    } else if (sortBy === 'rating-asc') {
      isSmaller = (item.vote_average || 0) < (pivot.vote_average || 0)
    } else if (sortBy === 'title-asc') {
      isSmaller = item.title.localeCompare(pivot.title, 'th') < 0
    }

    if (isSmaller) {
      left.push(item)
    } else {
      right.push(item)
    }
  }

  return [...customQuickSort(left, sortBy), pivot, ...customQuickSort(right, sortBy)]
}

function App() {
  const [movies, setMovies] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // State ฟอร์มเลือก
  const [selectedGenre, setSelectedGenre] = useState('')
  const [minRatingFilter, setMinRatingFilter] = useState('')
  const [yearFromFilter, setYearFromFilter] = useState('')

  // State กดยืนยันค้นหา
  const [activeFilters, setActiveFilters] = useState({
    genre: '',
    minRating: '',
    yearFrom: ''
  })

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Theme & Favorites & Hero State
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'dark')
  const [heroIndex, setHeroIndex] = useState(0)
  const [activeTrailerKey, setActiveTrailerKey] = useState(null)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('movie_favorites')
    return saved ? JSON.parse(saved) : []
  })
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [sortBy, setSortBy] = useState('rating-desc')

  // Modals State
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [movieCredits, setMovieCredits] = useState({ cast: [], directors: [] })
  const [movieProviders, setMovieProviders] = useState({ flatrate: [], rent: [], buy: [] })
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [personMovies, setPersonMovies] = useState([])
  const [loadingModal, setLoadingModal] = useState(false)

  // Randomizer State
  const [showRandomModal, setShowRandomModal] = useState(false)
  const [randomResult, setRandomResult] = useState(null)
  const [loadingRandom, setLoadingRandom] = useState(false)

  useEffect(() => {
    localStorage.setItem('movie_favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem('app_theme', theme)
    document.body.className = theme
  }, [theme])

  // ดึงข้อมูลหนังหน้าแรก
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true)
        setError('')
        const params = new URLSearchParams()
        params.append('page', '1')
        if (activeFilters.genre) params.append('genre', activeFilters.genre)
        if (activeFilters.minRating) params.append('minRating', activeFilters.minRating)
        if (activeFilters.yearFrom) params.append('yearFrom', activeFilters.yearFrom)

        const [movieResponse, genreResponse] = await Promise.all([
          fetch(`/movies?${params.toString()}`),
          fetch('/genres')
        ])

        if (!movieResponse.ok || !genreResponse.ok) throw new Error('ไม่สามารถโหลดข้อมูลได้')

        const movieData = await movieResponse.json()
        const genreData = await genreResponse.json()

        setMovies(movieData.results || [])
        setGenres(genreData || [])
        setPage(1)
        setTotalPages(movieData.total_pages || 1)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadInitialData()
  }, [activeFilters])

  // สไลด์ Hero Banner
  useEffect(() => {
    if (movies.length === 0) return
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(movies.length, 5))
    }, 4000)
    return () => clearInterval(interval)
  }, [movies])

  function handleResetAll() {
    setSearchTerm('')
    setSelectedGenre('')
    setMinRatingFilter('')
    setYearFromFilter('')
    setShowFavoritesOnly(false)
    setSortBy('rating-desc')
    setActiveFilters({
      genre: '',
      minRating: '',
      yearFrom: ''
    })
  }

  function handleSearchSubmit() {
    setShowFavoritesOnly(false)
    setActiveFilters({
      genre: selectedGenre,
      minRating: minRatingFilter,
      yearFrom: yearFromFilter
    })
  }

  async function handleSearchCardRandomize() {
    setLoadingRandom(true)
    setRandomResult(null)
    setShowRandomModal(true)
    try {
      const params = new URLSearchParams()
      if (selectedGenre) params.append('genre', selectedGenre)
      if (minRatingFilter) params.append('minRating', minRatingFilter)
      if (yearFromFilter) params.append('yearFrom', yearFromFilter)

      const response = await fetch(`/movies/random?${params.toString()}`)
      const data = await response.json()

      if (data.found && data.movie) {
        setRandomResult(data.movie)
      } else {
        alert(data.message || 'ไม่พบภาพยนตร์ตามเงื่อนไขที่กำหนด')
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสุ่มหนัง')
    } finally {
      setLoadingRandom(false)
    }
  }

  async function loadMoreMovies() {
    if (loadingMore || page >= totalPages) return
    try {
      setLoadingMore(true)
      const nextPage = page + 1
      const params = new URLSearchParams()
      params.append('page', String(nextPage))
      if (activeFilters.genre) params.append('genre', activeFilters.genre)
      if (activeFilters.minRating) params.append('minRating', activeFilters.minRating)
      if (activeFilters.yearFrom) params.append('yearFrom', activeFilters.yearFrom)

      const response = await fetch(`/movies?${params.toString()}`)
      if (!response.ok) throw new Error('ไม่สามารถโหลดหนังเพิ่มเติมได้')

      const data = await response.json()

      setMovies((prevMovies) => [...prevMovies, ...(data.results || [])])
      setPage(nextPage)
      setTotalPages(data.total_pages || totalPages)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingMore(false)
    }
  }

  async function handleOpenDetail(movie) {
    setSelectedMovie(movie)
    setLoadingModal(true)
    setMovieProviders({ flatrate: [], rent: [], buy: [] })
    try {
      const [creditsRes, providersRes] = await Promise.all([
        fetch(`/movie/${movie.id}/credits`),
        fetch(`/movie/${movie.id}/providers`)
      ])
      const creditsData = await creditsRes.json()
      const providersData = await providersRes.json()

      setMovieCredits(creditsData)
      setMovieProviders(providersData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingModal(false)
    }
  }

  async function handleOpenPerson(person) {
    setSelectedPerson(person)
    setLoadingModal(true)
    try {
      const response = await fetch(`/person/${person.id}/movies`)
      const data = await response.json()
      setPersonMovies(data.movies || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingModal(false)
    }
  }

  async function handleOpenTrailer(movieId, e) {
    if (e) e.stopPropagation()
    try {
      const response = await fetch(`/trailer/${movieId}`)
      const data = await response.json()
      if (data.found && data.key) setActiveTrailerKey(data.key)
      else alert('ไม่พบตัวอย่างภาพยนตร์เรื่องนี้')
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการโหลด Trailer')
    }
  }

  function toggleFavorite(movie, e) {
    if (e) e.stopPropagation()
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav.id === movie.id)
      return exists ? prev.filter((fav) => fav.id !== movie.id) : [...prev, movie]
    })
  }

  const heroMovie = movies.length > 0 ? movies[heroIndex] : null
  const sourceMovies = showFavoritesOnly ? favorites : movies

  const filteredMovies = sourceMovies.filter((movie) => {
    return movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // 📌 เรียกใช้อัลกอริทึม Quick Sort ที่เขียนขึ้นเอง 100%
  const sortedMovies = customQuickSort(filteredMovies, sortBy)

  return (
    <main>
      {/* 🎬 HERO BANNER WITH SLIDER */}
      <div className="hero-banner-container">
        {heroMovie ? (
          <div
            className="hero-backdrop"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(11,12,16,0.95)), url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path || heroMovie.poster_path})`
            }}
          >
            <div className="hero-overlay-content">
              <span className="featured-tag">FEATURED COLLECTION</span>
              <h1 className="hero-title">🎬 Movie Finder</h1>
              <p className="hero-subtitle">Find your favorite movies!</p>
            </div>
          </div>
        ) : (
          <div className="hero-backdrop default-hero">
            <div className="hero-overlay-content">
              <span className="featured-tag">FEATURED COLLECTION</span>
              <h1 className="hero-title">🎬 Movie Finder</h1>
              <p className="hero-subtitle">Find your favorite movies!</p>
            </div>
          </div>
        )}

        <button
          className="btn-floating-theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="สลับธีม"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {/* 🎛️ FLOATING SEARCH CARD */}
      <div className="floating-search-card">
        <h2>🔍 ค้นหาภาพยนตร์ (Search Movies)</h2>

        <div className="search-form-grid">
          <div className="form-field full-width">
            <label>ค้นหาชื่อภาพยนตร์</label>
            <input
              type="text"
              className="search-input-card"
              placeholder="พิมพ์ชื่อภาพยนตร์ที่ต้องการค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>ประเภทหนัง</label>
            <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
              <option value="">ทุกประเภท</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>คะแนนขั้นต่ำ</label>
            <select value={minRatingFilter} onChange={(e) => setMinRatingFilter(e.target.value)}>
              <option value="">ไม่กำหนด</option>
              <option value="5">⭐ 5 คะแนนขึ้นไป</option>
              <option value="6">⭐ 6 คะแนนขึ้นไป</option>
              <option value="7">⭐ 7 คะแนนขึ้นไป</option>
              <option value="8">⭐ 8 คะแนนขึ้นไป (แนะนำ)</option>
            </select>
          </div>

          <div className="form-field">
            <label>ปีเริ่มต้น</label>
            <select value={yearFromFilter} onChange={(e) => setYearFromFilter(e.target.value)}>
              <option value="">ไม่กำหนด</option>
              <option value="2020">ปี 2020 เป็นต้นไป</option>
              <option value="2010">ปี 2010 เป็นต้นไป</option>
              <option value="2000">ปี 2000 เป็นต้นไป</option>
              <option value="1990">ปี 1990 เป็นต้นไป</option>
            </select>
          </div>

          <div className="form-field">
            <label>เรียงลำดับตาม</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="rating-desc">คะแนนสูง → น้อย</option>
              <option value="rating-asc">คะแนนน้อย → สูง</option>
              <option value="title-asc">ชื่อภาพยนตร์ (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="card-actions">
          <button className="btn-card-action btn-search" onClick={handleSearchSubmit}>
            🔎 ค้นหาหนัง
          </button>
          <button className="btn-card-action" onClick={handleResetAll}>
            🏠 หน้าหลัก / รีเซ็ต
          </button>
          <button
            className={`btn-card-action ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            ❤️ หนังที่ชอบ ({favorites.length})
          </button>
        </div>
      </div>

      <p className="hint-text">เลือกเงื่อนไขแล้วกด "ค้นหาหนัง" หรือกดปุ่ม 🎲 ลอยมุมขวาล่างเพื่อสุ่มหนัง</p>

      {/* 🍿 MOVIE SECTION */}
      <div className="main-content-section">
        {loading && (
          <div className="skeleton-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        )}

        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            <div className="section-header-row">
              <h2>{showFavoritesOnly ? '❤️ รายการโปรดของคุณ' : `🔥 กำลังฮิตในขณะนี้ (${sortedMovies.length} เรื่อง)`}</h2>
            </div>

            <div className="movie-list">
              {sortedMovies.map((movie) => {
                const isFav = favorites.some((f) => f.id === movie.id)
                return (
                  <article key={movie.id} className="movie-card-row" onClick={() => handleOpenDetail(movie)}>
                    <div className="poster-wrapper">
                      <button className={`btn-fav ${isFav ? 'active' : ''}`} onClick={(e) => toggleFavorite(movie, e)}>
                        {isFav ? '❤️' : '🤍'}
                      </button>
                      <img
                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Poster'}
                        alt={movie.title}
                      />
                      <div className="play-overlay">
                        <button className="btn-play-quick" onClick={(e) => handleOpenTrailer(movie.id, e)}>▶</button>
                      </div>
                    </div>
                    <div className="movie-card-info">
                      <h3>{movie.title}</h3>
                      <div className="card-meta">
                        <span className="rating-badge">⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                        <span className="year-text">{movie.release_date ? movie.release_date.split('-')[0] : ''}</span>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {!showFavoritesOnly && page < totalPages && (
              <div className="load-more">
                <button onClick={loadMoreMovies} disabled={loadingMore}>
                  {loadingMore ? 'กำลังโหลดหนังเพิ่มเติม...' : 'ดูหนังเพิ่มเติม'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 🎬 MODALS */}
      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedMovie(null)}>✕</button>
            <div
              className="modal-backdrop-blur"
              style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/w780${selectedMovie.backdrop_path || selectedMovie.poster_path})`
              }}
            ></div>

            <div className="modal-body-content">
              <div className="detail-header">
                <img
                  src={selectedMovie.poster_path ? `https://image.tmdb.org/t/p/w300${selectedMovie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Poster'}
                  alt={selectedMovie.title}
                />
                <div className="detail-info">
                  <h2>{selectedMovie.title}</h2>
                  <p className="release-date">📅 วันที่เข้าฉาย: {selectedMovie.release_date || 'ไม่ระบุ'}</p>
                  <p className="rating">⭐ คะแนน: {selectedMovie.vote_average} / 10</p>
                  <h3>เรื่องย่อ</h3>
                  <p className="overview">{selectedMovie.overview || 'ไม่มีข้อมูลเรื่องย่อภาษาไทย'}</p>

                  <div className="providers-section" style={{ marginTop: '15px' }}>
                    <h4 style={{ color: '#f5c451', margin: '0 0 8px 0', fontSize: '14px' }}>📺 รับชมได้ทาง (Streaming TH)</h4>
                    {movieProviders.flatrate && movieProviders.flatrate.length > 0 ? (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {movieProviders.flatrate.map((provider) => (
                          <img
                            key={provider.provider_id}
                            src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                            alt={provider.provider_name}
                            title={provider.provider_name}
                            style={{ width: '38px', height: '38px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                          />
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '12px', color: '#9aa0b4', margin: 0 }}>ไม่มีในสตรีมมิ่งรายเดือนหลักในไทย (หรือเช่า/ซื้อบริการอื่น)</p>
                    )}
                  </div>
                </div>
              </div>

              <hr style={{ borderColor: 'rgba(255,255,255,0.15)', margin: '20px 0' }} />

              <h3>🎬 ผู้กำกับ & นักแสดง</h3>
              {loadingModal ? (
                <p>กำลังโหลดรายชื่อนักแสดง...</p>
              ) : (
                <div className="credits-section">
                  {movieCredits.directors.length > 0 && (
                    <div className="credit-group">
                      <h4>ผู้กำกับ</h4>
                      <div className="people-grid">
                        {movieCredits.directors.map((p) => {
                          const avatarUrl = p.profile_path
                            ? `https://image.tmdb.org/t/p/w185${p.profile_path}`
                            : 'https://via.placeholder.com/185x185?text=No+Photo'
                          return (
                            <div key={p.id} className="person-card director-card" onClick={() => handleOpenPerson(p)}>
                              <img src={avatarUrl} alt={p.name} className="person-img" />
                              <div className="person-name">{p.name}</div>
                              <div className="person-role">Director</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {movieCredits.cast.length > 0 && (
                    <div className="credit-group" style={{ marginTop: '15px' }}>
                      <h4>นักแสดงหลัก</h4>
                      <div className="people-grid">
                        {movieCredits.cast.map((p) => {
                          const avatarUrl = p.profile_path
                            ? `https://image.tmdb.org/t/p/w185${p.profile_path}`
                            : 'https://via.placeholder.com/185x185?text=No+Photo'
                          return (
                            <div key={p.id} className="person-card" onClick={() => handleOpenPerson(p)}>
                              <img src={avatarUrl} alt={p.name} className="person-img" />
                              <div className="person-name">{p.name}</div>
                              <div className="person-role">{p.character || 'นักแสดง'}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedPerson && (
        <div className="modal-overlay" onClick={() => setSelectedPerson(null)} style={{ zIndex: 1100 }}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPerson(null)}>✕</button>
            <div className="modal-body-content">
              <h2>🌟 ผลงานของ {selectedPerson.name}</h2>
              {loadingModal ? (
                <p>กำลังโหลดผลงาน...</p>
              ) : (
                <div className="movie-list" style={{ marginTop: '15px' }}>
                  {personMovies.map((m) => (
                    <article key={m.id} onClick={() => { setSelectedPerson(null); handleOpenDetail(m); }}>
                      <img src={m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : ''} alt={m.title} />
                      <h3 style={{ fontSize: '14px' }}>{m.title}</h3>
                      <p style={{ fontSize: '12px' }}>⭐ {m.vote_average}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showRandomModal && (
        <div className="modal-overlay" onClick={() => { setShowRandomModal(false); setRandomResult(null); }}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setShowRandomModal(false); setRandomResult(null); }}>✕</button>
            {randomResult && (
              <div
                className="modal-backdrop-blur"
                style={{
                  backgroundImage: `url(https://image.tmdb.org/t/p/w780${randomResult.backdrop_path || randomResult.poster_path})`
                }}
              ></div>
            )}
            <div className="modal-body-content">
              <h2>🎲 ผลการสุ่มภาพยนตร์</h2>
              {loadingRandom ? (
                <p style={{ textAlign: 'center', color: '#f5c451', margin: '30px 0' }}>🎰 กำลังหมุนสุ่มหนังที่ใช่ให้คุณ...</p>
              ) : randomResult ? (
                <div className="random-result-box">
                  <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                    <img
                      src={randomResult.poster_path ? `https://image.tmdb.org/t/p/w200${randomResult.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Poster'}
                      alt={randomResult.title}
                      style={{ width: '120px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', color: '#f5c451' }}>{randomResult.title}</h3>
                      <p style={{ margin: '4px 0' }}>⭐ คะแนน: {randomResult.vote_average} / 10</p>
                      <p style={{ margin: '4px 0', fontSize: '13px', color: '#a0a5b5' }}>📅 ปี: {randomResult.release_date || 'ไม่ระบุ'}</p>
                      <p style={{ fontSize: '13px', marginTop: '8px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {randomResult.overview || 'ไม่มีเรื่องย่อภาษาไทย'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button className="btn-trailer" style={{ flex: 1 }} onClick={() => handleOpenTrailer(randomResult.id)}>
                      ▶️ ดูตัวอย่าง
                    </button>
                    <button className="btn-trailer" style={{ flex: 1, background: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => { setShowRandomModal(false); handleOpenDetail(randomResult); }}>
                      📄 ดูรายละเอียด
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {activeTrailerKey && (
        <div className="modal-overlay" onClick={() => setActiveTrailerKey(null)} style={{ zIndex: 1200 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '30px 20px' }}>
            <button className="modal-close" onClick={() => setActiveTrailerKey(null)}>X</button>
            <h3 style={{ marginBottom: '20px', color: '#fff' }}>🎬 Movie Trailer</h3>
            <a 
              href={`https://www.youtube.com/watch?v=${activeTrailerKey}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                backgroundColor: '#ff0000',
                color: '#ffffff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '16px',
                boxShadow: '0 4px 15px rgba(255,0,0,0.4)'
              }}
            >
              ▶ รับชม Trailer บน YouTube (แท็บใหม่)
            </a>
          </div>
        </div>
      )}
      
      <button
        className="btn-floating-random"
        onClick={handleSearchCardRandomize}
        title="สุ่มหนังที่ใช่!"
      >
        🎲 <span className="fab-text">สุ่มหนัง</span>
      </button>
    </main>
  )
}

export default App