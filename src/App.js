import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Markdown from './components/Markdown';

import 'font-awesome/css/font-awesome.min.css';
import './App.css';  // Make sure to add your CSS for light and dark theme

function App() {
  const [markdown, setMarkdown] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply theme to the body element
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  // Toggle the theme on button click
  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <Router>
      <div className="App">
        {/* Theme Toggle Button */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Toggle Dark/Light Theme"
        >
          <i className={`fa ${isDarkMode ? 'fa-sun' : 'fa-moon'}`} />
        </button>

        <Routes>
          <Route
            path="/"
            element={
              <Markdown
                markdown={markdown}
                setMarkdown={setMarkdown}
              />
            }
          />
         
        </Routes>
      </div>
    </Router>
  );
}

export default App;
