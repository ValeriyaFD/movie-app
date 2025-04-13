import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import Movie from './components/Movie.js/Movie';
import { Offline, Online } from 'react-detect-offline';
import GenreMovie from './components/GenreMovie/GenreMovie';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <>
  <Online>
    <GenreMovie>
    <Movie />
    </GenreMovie>
  </Online>
  <Offline>
    <div className="offline-notification">
            <div className="offline-content">
              <div className="offline-icon">📶</div>
              <div className="offline-message">{`You're offline right now. Check your connection.`}</div>
            </div>
          </div>
  </Offline>
  </>
);

reportWebVitals();
