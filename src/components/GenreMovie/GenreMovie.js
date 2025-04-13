import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './GenreMovie.css';

export const GenreContext = React.createContext();

export default class GenreMovie extends Component {
  state = {
    genres: [],
  };

  componentDidMount() {
    this.fetchGenres();
  }

  fetchGenres = () => {
    try{
    fetch('https://api.themoviedb.org/3/genre/movie/list?api_key=5066be12edaa59b8368d0560151737fa')
      .then((res) => res.json())
      .then((data) => {
        this.setState({ genres: data.genres });
      });
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  render() {
    return (
      <GenreContext.Provider value={this.state.genres}>
        {this.props.children}
      </GenreContext.Provider>
    );
  }
}

GenreMovie.propTypes = {
  children: PropTypes.node.isRequired,
};
