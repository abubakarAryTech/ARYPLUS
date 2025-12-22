import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

export default function CallbackHandler() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    axios.post(`${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/payfast/callback`, Object.fromEntries(params.entries()))
      .finally(() => {
        window.history.go(-1); // Go back two pages
      });
  }, [location.search]);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#23232b',
      color: '#fff',
      fontSize: 22,
      fontWeight: 500,
      letterSpacing: 0.5
    }}>
      Processing callback, please wait...
    </div>
  );
} 