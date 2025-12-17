import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { FocusContext } from '../App';
import './Sidebar.css';

const Sidebar = () => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { focusMode, setFocusMode } = useContext(FocusContext);
  const navigate = useNavigate();
  
  const menuItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/movies', label: 'Movies', icon: '🎬' },
    { path: '/series', label: 'TV Series', icon: '📺' },
    { path: '/live', label: 'Live TV', icon: '📡' },
    { path: '/sports', label: 'Sports', icon: '⚽' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (focusMode === 'sidebar') {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusedIndex(prev => (prev + 1) % menuItems.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setFocusedIndex(prev => (prev - 1 + menuItems.length) % menuItems.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          navigate(menuItems[focusedIndex].path);
          setFocusMode('content');
        }
      } else if (focusMode === 'content' && e.key === 'Escape') {
        setFocusMode('sidebar');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, menuItems, navigate, focusMode]);

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h2>ARYPLUS TV</h2>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item, index) => (
          <li key={item.path}>
            <NavLink 
              to={item.path}
              data-index={index}
              className={({ isActive }) => {
                const classes = ['menu-item'];
                if (isActive) classes.push('active');
                if (index === focusedIndex && focusMode === 'sidebar') classes.push('focused');
                return classes.join(' ');
              }}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;