import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../services/firebase';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/useAuthStore';
import '../styles/tvActivation.scss';

const TVActivation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [activated, setActivated] = useState(false);
  
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    // Only redirect if not authenticated
    if (!isAuthenticated) {
      const currentPath = `/activate${code ? `?code=${code}` : ''}`;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`, { replace: true });
    }
  }, [isAuthenticated, code, navigate]);

  const handleVerifyAndActivate = async (e) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-character code');
      return;
    }

    setVerifying(true);

    try {
      // Verify code exists
      const verifyRes = await api.get(`/api/tv-activation/verify/${code.toUpperCase()}`);
      
      if (!verifyRes.data.valid) {
        toast.error(verifyRes.data.message || 'Invalid activation code');
        setVerifying(false);
        return;
      }

      // Check if user is logged in
      if (!isAuthenticated || !user) {
        toast.error('Please login first to activate your TV');
        setVerifying(false);
        navigate(`/login?redirect=/activate?code=${code}`);
        return;
      }

      // Get Firebase token and activate
      setLoading(true);
      const firebaseToken = await auth.currentUser.getIdToken();
      
      const activateRes = await api.post('/api/tv-activation/activate', {
        code: code.toUpperCase(),
        firebaseToken
      });

      if (activateRes.data.success) {
        setActivated(true);
        setCode('');
      } else {
        toast.error(activateRes.data.error || 'Activation failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Activation failed');
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  if (activated) {
    return (
      <div className="auth-page-wrapper">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', color: '#4CAF50', marginBottom: '20px' }}>✓</div>
              <h1>TV Activated Successfully!</h1>
              <p style={{ marginTop: '20px', fontSize: '16px' }}>Return to your TV app. You can close this browser.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Activate Your TV</h1>
            <p>Enter the code shown on your TV screen</p>
          </div>

          <form onSubmit={handleVerifyAndActivate} className="auth-form">
            <div className="form-group">
              <input
                type="text"
                className="form-control code-input"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                style={{ 
                  textAlign: 'center', 
                  fontSize: '24px', 
                  letterSpacing: '8px',
                  textTransform: 'uppercase'
                }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading || verifying || !code}
            >
              {loading || verifying ? 'Activating...' : 'Activate TV'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '30px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Don't have a code? Open the ARY ZAP app on your Android TV and select "Login with Code"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVActivation;
