import React, { Component } from 'react';
import { GenreContext } from '../GenreMovie/GenreMovie';
import { format } from 'date-fns';
import './Movie.css';
import { Rate, Input, Pagination } from 'antd';
import Loading from '../Loading/Loading';
import Error from '../Error/Error';
import Tab from '../Tab/Tab';
import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';

export default class Movie extends Component {
  static contextType = GenreContext;
  state = {
    movieList: [],
    rating: {},
    loading: true,
    error: false,
    totalResults: 0,
    searchValue: '',
    currentPage: 1,
    guestSessionId: null,
    isVisibleSearch: true,
    ratedMovies: [],
    activeTab: 'search',
  };

  componentDidMount() {
    this.getMovie();
    this.input.focus();
    this.createGuestSession();

    const cachedRated = localStorage.getItem('tmdb_rated_movies');
if (cachedRated) {
  const { movies, fetchedAt } = JSON.parse(cachedRated);
  if ((Date.now() - fetchedAt) < (1000 * 60 * 15)) {
    this.setState({ ratedMovies: movies });
  }
}
  }
  componentWillUnmount() {
    this.findMovie.cancel();
  }

  // Создаю метод для создания гостевой сессии
  createGuestSession = () => {
    try {
      fetch('https://api.themoviedb.org/3/authentication/guest_session/new?api_key=5066be12edaa59b8368d0560151737fa')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.guest_session_id) {
            this.setState({ guestSessionId: json.guest_session_id }, () => {
              console.log('Гостевая сессия создана:', this.state.guestSessionId);
            });
          }
        });
    } catch (err) {
      console.error('Error in createGuestSession:', err);
      this.onError();
    }
  };

  handleTabChange = (key) => {
    this.setState({ activeTab: key });
    if (key === 'search') {
      this.getMovie();
    }
    if (key === 'rated') {
      this.getRatedMovies();
      this.setState({ searchValue: '' });
    }
  };

  ratedMovies = (movieId, rating) => {
    const { guestSessionId } = this.state;

    fetch(`https://api.themoviedb.org/3/movie/${movieId}/rating?api_key=5066be12edaa59b8368d0560151737fa&guest_session_id=${guestSessionId}`,
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json;charset=utf-8',
           Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MDY2YmUxMmVkYWE1OWI4MzY4ZDA1NjAxNTE3MzdmYSIsIm5iZiI6MTc0MzI3NDkxMS43NTksInN1YiI6IjY3ZTg0MzlmYmQxZjk2ZjllZjYzNzcwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.YCEZIcE4Aa3clEHcSHDiG9Ht4y_Ze4jc01J4S3i6rU8'
        },
        body: JSON.stringify({ value: rating }),
      }
    )
    .then((res) => res.json())
    .then((json) => {
      if (json.success) {
        this.updateRatedMovies(movieId, rating);
      } 
      this.setState((prevState) => ({
        rating: { ...prevState.rating, [movieId]: rating },
      }));
    })
    .catch((err) => {
      console.error('Error rating movie:', err);
      this.onError();
    })
  };

  getRatedMovies = () => {
    const { guestSessionId } = this.state;
    if (!guestSessionId) {
      console.warn('Попытка загрузки оценённых фильмов без сессии');
      return;
    }

    fetch(`https://api.themoviedb.org/3/guest_session/${guestSessionId}/rated/movies?api_key=5066be12edaa59b8368d0560151737fa`)
      .then((res) =>  res.json())
      .then((json) => {
        if (json && Array.isArray(json.results)) {
          this.setState({ ratedMovies: json.results, loading: false });
          localStorage.setItem(
            'tmdb_rated_movies',
            JSON.stringify({
              movies: json.results,
              fetchedAt: Date.now(),
            })
          );
        }
      })
      .catch((err) => {
        console.error('Error fetching rated movies:', err);
        this.onError();
      });
  };

  updateRatedMovies = (movieId, rating) => {
    this.setState((prevState) => {
      const filteredMovies = prevState.ratedMovies.filter((movie) => movie.id !== movieId);
      const ratedMovie = prevState.movieList.find((movie) => movie.id === movieId);
      if (ratedMovie) {
        return {
          ratedMovies: [...filteredMovies, { ...ratedMovie, rating }],
        };
      }
      return { ratedMovies: filteredMovies };
    });
  };


  renderGenres = (genreIds) => {
    const genres = this.context;

    return (
      <div className="genreList">
        {genres
          .filter((genre) => genreIds && genreIds.includes(genre.id))
          .map((genre) => (
            <div key={genre.id} className="genreBox">
              <span className="movieGenre">{genre.name}</span>
            </div>
          ))}
      </div>
    )
  };

  onError() {
    this.setState({
      error: true,
      loading: false,
    });
  }

  onChangePage = (page) => {
    this.setState({ currentPage: page });
    try {
      fetch(`https://api.themoviedb.org/3/discover/movie?api_key=5066be12edaa59b8368d0560151737fa&page=${page}`)
        .then((res) => res.json())
        .then((json) => this.setState({ totalResults: json.total_pages, movieList: json.results, loading: false }));
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (err) {
      this.onError();
    }
  };

  getMovie = () => {
    try {
      fetch('https://api.themoviedb.org/3/discover/movie?api_key=5066be12edaa59b8368d0560151737fa')
        .then((res) => res.json())
        .then((json) => this.setState({ totalResults: json.total_pages, movieList: json.results, loading: false }));
    } catch (err) {
      this.onError();
    }
  };

  cutText(text, len) {
    while (len <= text.length) if (text[++len] === ' ') break;
    return text.substring(0, len) + '...';
  }

  findMovie = debounce((searchValue) => {
    try {
      this.setState({ loading: true, error: false });
      fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=5066be12edaa59b8368d0560151737fa&query=${searchValue}&language=en-US`
      )
        .then((res) => res.json())
        .then((json) => {
          this.setState({
            movieList: json.results,
            totalResults: json.total_results,
            loading: false,
            searchValue: searchValue,
          });
        });
    } catch (err) {
      this.onError();
    }
  }, 500);

  handleInputChange = (e) => {
    const searchValue = e.target.value;
    this.setState({ searchValue });
    if (searchValue.trim() === '') {
      this.getMovie();
    } else {
      this.findMovie(searchValue);
    }
  };

  getRatingColor(rating) {
    if (rating >= 0 && rating < 3) {
      return '#E90000';
    }
    if (rating >= 3 && rating < 5) {
      return '#E97E00';
    }
    if (rating >= 5 && rating < 7) {
      return '#E9D100';
    }
    if (rating >= 7) {
      return '#66E900';
    }
    return '#CCCCCC';
  }

  render() {
    const { rating, currentPage, activeTab, ratedMovies, movieList, loading, error, totalResults, searchValue} =
      this.state;
    const isEmptyResult = searchValue.trim() !== '' && movieList.length === 0;
    return (
      <>
        {error ? (<Error />):(
          <>
        <Tab onTabChange={this.handleTabChange} />
        {activeTab === 'search' && (
          <Input
            placeholder="Type tsearch..."
            className="input"
            ref={(input) => (this.input = input)}
            value={searchValue}
            onChange={this.handleInputChange}
            onPressEnter={() => this.findMovie(searchValue)}
          />
        )}
        {loading ? (
          <Loading />
        ) : (
          <>
            {activeTab === 'search' && (
              <>
                {isEmptyResult && (
                  <div className="no-results">
                    <p className="emptyResult">{`No movies found for "${searchValue}".`}</p>
                  </div>
                )}
                {!isEmptyResult && (
                  <ul className="movieList">
                    {movieList.map((movie) => (
                      <li key={movie.id} className="movie">
                        <div className="imageBox">
                          <img
                            className="image"
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                          />
                        </div>
                        <div>
                          <h1 className="movieTitle">{movie.title}</h1>
                          <div
                            className="average"
                            style={{
                              borderColor: this.getRatingColor(movie.vote_average),
                            }}
                          >
                            {Math.round(movie.vote_average * 10) / 10}
                          </div>
                          <p className="movieDate">
                            {movie.release_date
                              ? format(new Date(movie.release_date), 'MMMM d, yyyy')
                              : 'No release date'}
                          </p>
                          <div className="movieGenres">{this.renderGenres(movie.genre_ids)}</div>
                          <p className="movieOverview">{this.cutText(movie.overview, 130)}</p>
                          <Rate defaultValue={rating[movie.id]} value={movie.rating} count={10} className="stars" onChange={(value) => this.ratedMovies(movie.id, value)}/>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
            {activeTab === 'rated' && (
              <>
                {ratedMovies && ratedMovies.length > 0 ? (
                  <ul className="movieList">
                  {ratedMovies.map((movie) => (
                   <li key={movie.id} className="movie">
                   <div className="imageBox">
                     <img
                       className="image"
                       src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                       alt={movie.title}
                     />
                   </div>
                   <div>
                     <h1 className="movieTitle">{movie.title}</h1>
                     <div
                       className="average"
                       style={{
                         borderColor: this.getRatingColor(movie.vote_average),
                       }}
                     >
                       {Math.round(movie.vote_average * 10) / 10}
                     </div>
                     <p className="movieDate">
                       {movie.release_date
                         ? format(new Date(movie.release_date), 'MMMM d, yyyy')
                         : 'No release date'}
                     </p>
                     <div className="movieGenres">{this.renderGenres(movie.genre_ids)}</div>
                     <p className="movieOverview">{this.cutText(movie.overview, 130)}</p>
                     <Rate value={movie.rating} count={10} className="stars" />
                   </div>
                 </li>
                  ))}
                  </ul>
                ) : (
                  <span className='ratedPlease'>Rated movies, please, and welcome back ;3</span>
                )}
              </>
            )}
            {activeTab === 'search' && (
              <Pagination
                defaultCurrent={currentPage}
                total={totalResults}
                align="center"
                onChange={this.onChangePage}
                className="pagination-movies"
              />
            )}
          </>
        )}
        </>
        )}
      </>
    );
  }
}

Movie.propTypes = {
  movieList: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.bool,
  totalResults: PropTypes.number,
  searchValue: PropTypes.string,
  guestSessionId: PropTypes.string,
  isVisibleSearch: PropTypes.bool,
  ratedMovies: PropTypes.array,
  activeTab: PropTypes.string,
};
