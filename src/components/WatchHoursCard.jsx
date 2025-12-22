import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { FaPlay, FaClock, FaMapMarkerAlt, FaDesktop, FaMobile, FaTablet, FaEye, FaAd } from 'react-icons/fa';
import api from '../services/api';
import logger from '../services/logger';

const WatchHoursCard = ({ userId }) => {
  const [watchData, setWatchData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user analytics from backend
      const response = await api.get(`/api/bigquery/user-analytics/${userId}`);
      const analytics = response.data.data;

      // Calculate activity summary from analytics data
      const watchTime = analytics.totalWatchMinutes || 0;
      const pageViews = analytics.pageViews || 0;
      const sessions = analytics.totalSessions || 0;
      const totalActivity = watchTime + pageViews + sessions;
      const engagementScore = Math.min(100, Math.round((totalActivity / 100) * 100));

      const activitySummary = {
        totalActivity,
        engagementScore,
        activityBreakdown: {
          watchTime,
          pageViews,
          sessions
        }
      };

      setWatchData(analytics);
      setActivityData(activitySummary);
    } catch (err) {
      logger.error('Error fetching user data:', err);
      setError('Unable to load watch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <FaMobile className="text-primary" />;
      case 'tablet':
        return <FaTablet className="text-info" />;
      case 'desktop':
        return <FaDesktop className="text-success" />;
      default:
        return <FaDesktop className="text-muted" />;
    }
  };

  const getEngagementColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'info';
    return 'secondary';
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="light" />
        <p className="mt-3 text-white-50">Loading your watch data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="text-danger mb-2">
          <i className="fas fa-exclamation-triangle fa-2x"></i>
        </div>
        <p className="text-white-50">{error}</p>
        <button 
          className="btn btn-outline-light btn-sm"
          onClick={fetchUserData}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!watchData || watchData.totalWatchMinutes === 0) {
    return (
      <div className="text-center py-4">
        <div className="text-white-50 mb-3">
          <FaClock className="fa-3x" />
        </div>
        <h6 className="text-white-50">No Watch Data Available</h6>
        <p className="text-white-50 small">Start watching content to see your analytics here.</p>
      </div>
    );
  }

  return (
    <div className="watch-hours-card">
      <div className="card-header bg-transparent border-bottom border-secondary">
        <h6 className="mb-0 text-white">
          <FaClock className="me-2" />
          Your Watch Analytics
        </h6>
      </div>
      
      <div className="card-body">
        <Row>
          {/* Watch Hours Summary */}
          <Col md={6} className="mb-3">
            <div className="text-center p-3 border border-secondary rounded bg-dark">
              <div className="display-6 text-primary fw-bold">
                {watchData.totalWatchHours || 0}
              </div>
              <div className="text-white-50">Total Watch Hours</div>
              <small className="text-white-50">
                {watchData.totalWatchMinutes || 0} minutes watched
              </small>
            </div>
          </Col>

          {/* Sessions */}
          <Col md={6} className="mb-3">
            <div className="text-center p-3 border border-secondary rounded bg-dark">
              <div className="display-6 text-success fw-bold">
                {watchData.totalSessions || 0}
              </div>
              <div className="text-white-50">Total Sessions</div>
              <small className="text-white-50">
                Avg: {watchData.averageSessionLength || 0} min/session
              </small>
            </div>
          </Col>
        </Row>

        {/* Activity Metrics */}
        <Row className="mt-3">
          <Col md={4} className="mb-3">
            <div className="d-flex align-items-center p-2 border border-secondary rounded bg-dark">
              <FaEye className="text-info me-2" />
              <div>
                <div className="fw-bold text-white">{watchData.pageViews || 0}</div>
                <small className="text-white-50">Page Views</small>
              </div>
            </div>
          </Col>

          <Col md={4} className="mb-3">
            <div className="d-flex align-items-center p-2 border border-secondary rounded bg-dark">
              <FaAd className="text-warning me-2" />
              <div>
                <div className="fw-bold text-white">{watchData.adImpressions || 0}</div>
                <small className="text-white-50">Ad Impressions</small>
              </div>
            </div>
          </Col>

          <Col md={4} className="mb-3">
            <div className="d-flex align-items-center p-2 border border-secondary rounded bg-dark">
              <FaPlay className="text-danger me-2" />
              <div>
                <div className="fw-bold text-white">{watchData.bufferStalls || 0}</div>
                <small className="text-white-50">Buffer Events</small>
              </div>
            </div>
          </Col>
        </Row>

        {/* Device & Location Info */}
        <Row className="mt-3">
          <Col md={6} className="mb-3">
            <div className="d-flex align-items-center p-2 border border-secondary rounded bg-dark">
              {getDeviceIcon(watchData.deviceType)}
              <div className="ms-2">
                <div className="fw-bold text-white">{watchData.deviceType || 'Unknown'}</div>
                <small className="text-white-50">{watchData.operatingSystem || 'Unknown'}</small>
              </div>
            </div>
          </Col>

          <Col md={6} className="mb-3">
            <div className="d-flex align-items-center p-2 border border-secondary rounded bg-dark">
              <FaMapMarkerAlt className="text-danger me-2" />
              <div>
                <div className="fw-bold text-white">{watchData.location || 'Unknown'}</div>
                <small className="text-white-50">Location</small>
              </div>
            </div>
          </Col>
        </Row>

        {/* Engagement Score */}
        {activityData && (
          <Row className="mt-3">
            <Col>
              <div className="p-3 border border-secondary rounded bg-dark">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold text-white">Engagement Score</span>
                  <Badge bg={getEngagementColor(activityData.engagementScore)}>
                    {activityData.engagementScore}%
                  </Badge>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className={`progress-bar bg-${getEngagementColor(activityData.engagementScore)}`}
                    style={{ width: `${activityData.engagementScore}%` }}
                  ></div>
                </div>
                <small className="text-white-50">
                  Based on your watch time, page views, and session activity
                </small>
              </div>
            </Col>
          </Row>
        )}

        {/* Screen Name */}
        {watchData.screenName && watchData.screenName !== 'Unknown' && (
          <Row className="mt-3">
            <Col>
              <div className="p-2 border border-secondary rounded bg-dark">
                <small className="text-white-50">
                  <strong>Favorite Channel:</strong> {watchData.screenName}
                </small>
              </div>
            </Col>
          </Row>
        )}
      </div>

      <style jsx>{`
        .watch-hours-card {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          margin-top: 2rem;
        }
        
        .watch-hours-card .card-header {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .watch-hours-card .card-body {
          padding: 1rem;
        }
        
        .bg-dark {
          background-color: rgba(0, 0, 0, 0.2) !important;
        }
        
        .border-secondary {
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default WatchHoursCard; 