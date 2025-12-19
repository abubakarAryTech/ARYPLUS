import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { FocusContext } from '../App';
import { createKeyHandler } from '../utils/tizenRemote';
import { Search } from '../assets/icons';
import { Home2 } from '../assets/icons';
import { Home1 } from '../assets/icons';
import { Align_Left } from '../assets/icons';
import { My_list } from '../assets/icons';
import { Snips } from '../assets/icons';
import ARYPLUSLOGO from '../assets/images/ARYPLUSLOGO.png';
import ARYPlusicon  from '../assets/images/ARYPlus_icon.png';
import './Sidebar.css';


// Then use as: <Search />

const Sidebar = () => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { focusMode, setFocusMode, isCollapsed, setIsCollapsed } = useContext(FocusContext);
  const navigate = useNavigate();
  
  const menuItems = [
    { path: '/', label: 'Home', icon: <Home1/> },
    { path: '/search', label: 'Search', icon: <Search/>  },
    { path: '/Home', label: 'Home', icon: <Home2/> },
    { path: '/Snips', label: 'Snips', icon: <Align_Left/> },
    { path: '/Categories', label: 'Categories', icon: <My_list/> },
    { path: '/My list', label: 'My list', icon: <Snips/> }
  ];

  useEffect(() => {
    const handleKeyDown = createKeyHandler({
      ArrowDown: (e) => {
        if (focusMode === 'sidebar') {
          e.preventDefault();
          setFocusedIndex(prev => (prev + 1) % menuItems.length);
        }
      },
      ArrowUp: (e) => {
        if (focusMode === 'sidebar') {
          e.preventDefault();
          setFocusedIndex(prev => (prev - 1 + menuItems.length) % menuItems.length);
        }
      },
      Enter: (e) => {
        if (focusMode === 'sidebar') {
          e.preventDefault();
          navigate(menuItems[focusedIndex].path);
          setFocusMode('content');
          setIsCollapsed(true);
        }
      },
      Escape: (e) => {
        if (focusMode === 'content') {
          setFocusMode('sidebar');
          setIsCollapsed(false);
        }
      },
      Return: (e) => {
        if (focusMode === 'content') {
          setFocusMode('sidebar');
          setIsCollapsed(false);
        }
      }
    });

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, menuItems, navigate, focusMode]);

  return (
    <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          {isCollapsed ? <img src={ARYPlusicon} alt="ARYPLUS TV" style={{height: '30px'}} /> : <img src={ARYPLUSLOGO} alt="ARYPLUS TV" style={{height: '30px'}} />}
        </div>
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