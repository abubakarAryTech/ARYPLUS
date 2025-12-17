import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, createContext } from 'react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Series from './pages/Series';
import Live from './pages/Live';
import Sports from './pages/Sports';
import Settings from './pages/Settings';
import './App.css';

export const FocusContext = createContext();

function App() {
  const [focusMode, setFocusMode] = useState('sidebar');

  return (
    <Router>
      <FocusContext.Provider value={{ focusMode, setFocusMode }}>
        <div className="app">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/series" element={<Series />} />
              <Route path="/live" element={<Live />} />
              <Route path="/sports" element={<Sports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </FocusContext.Provider>
    </Router>
  );
}

export default App
