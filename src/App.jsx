import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, createContext, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { registerTizenKeys } from './utils/tizenRemote';
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    registerTizenKeys();
  }, []);

  return (
    <Router>
      <FocusContext.Provider value={{ focusMode, setFocusMode, isCollapsed, setIsCollapsed }}>
        <div className="app">
          <Sidebar />
          <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Movies />} />
              <Route path="/Home" element={<Series />} />
              <Route path="/Snips" element={<Live />} />
              <Route path="/Categories" element={<Sports />} />
              <Route path="/My list" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </FocusContext.Provider>
    </Router>
  );
}

export default App

