import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, ProgressBar, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { 
  FaCoins, 
  FaClock, 
  FaAd, 
  FaFire, 
  FaTrophy, 
  FaGift, 
  FaHistory, 
  FaChartLine,
  FaExchangeAlt,
  FaSync,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import api from '../services/api';

const RoyaltyPointsCard = ({ userId }) => {
  const [pointsData, setPointsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [pointHistory, setPointHistory] = useState([]);
  const [subscriptionType, setSubscriptionType] = useState('monthly');
  const [subscriptionValue, setSubscriptionValue] = useState(9.99);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  


  useEffect(() => {
    if (userId) {
      fetchPointsData();
    }
  }, [userId]);

  useEffect(() => {
    if (pointsData) {
      checkWelcomeStatus();
    }
  }, [pointsData]);

  const checkWelcomeStatus = () => {
    if (!pointsData || !userId) return;
    
    const welcomeKey = `welcomeSeen_${userId}`;
    const hasSeen = localStorage.getItem(welcomeKey);
    setHasSeenWelcome(!!hasSeen);
    
    // Show welcome if user is new and hasn't seen it before
    if (pointsData?.isNewUser && !hasSeen) {
      setShowWelcome(true);
    } else {
      setShowWelcome(false);
    }
  };

  const markWelcomeAsSeen = () => {
    const welcomeKey = `welcomeSeen_${userId}`;
    localStorage.setItem(welcomeKey, 'true');
    setHasSeenWelcome(true);
    setShowWelcome(false);
  };

  const fetchPointsData = async () => {
    try {
      setIsLoading(true);
      
      // ✅ Only fetch from database (fast) - no BigQuery calls here
      const response = await api.get(`/api/v2/royalty-points/summary/${userId}`);
      
      // Check if we got a successful response
      if (response.data && response.data.success === true) {
        // Data is wrapped in response.data.data
        const data = response.data.data;
        setPointsData(data);
      } else if (response.data && response.data.success === false) {
        // API returned an error
        setError(response.data.message || 'Failed to load points data');
      } else {
        // Unexpected response structure
        setError('Unexpected response format from server');
      }
      
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You can only access your own data.');
      } else if (err.response?.status === 404) {
        // User not found, try to register them
        await registerUser();
      } else {
        setError('Unable to load points data. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async () => {
    try {
      const response = await api.post(`/api/v2/royalty-points/register/${userId}`);
      
      if (response.data && response.data.success === true) {
        setPointsData(response.data.data);
        setError(null);
      } else {
        setError('Failed to register user for royalty points');
      }
    } catch (err) {
      setError('Failed to register user for royalty points. Please try again.');
    }
  };

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      
      // Call the calculation endpoint to sync with BigQuery
      await api.post(`/api/v2/royalty-points/calculate/${userId}`);
      
      // Fetch updated data
      await fetchPointsData();
      
      // Update sync timestamp
      setLastSyncTime(new Date());
      
      alert('✅ Points data synced with BigQuery successfully!');
      
    } catch (err) {
      setError('Failed to sync with BigQuery. Please try again later.');
      alert('❌ Failed to sync with BigQuery: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchPointHistory = async () => {
    try {
      const response = await api.get(`/api/v2/royalty-points/history/${userId}?limit=100`);
      
      // Check if we got a successful response
      if (response.data && response.data.success === true) {
        // Data is wrapped in response.data.data
        const data = response.data.data;
        setPointHistory(Array.isArray(data) ? data : []);
      } else {
        // Set empty array if no data or error
        setPointHistory([]);
      }
    } catch (err) {
      // Set empty array on error
      setPointHistory([]);
    }
  };

  const handleRedeemPoints = async () => {
    try {
      setRedeemLoading(true);
      
      const response = await api.post('/api/v2/royalty-points/redeem', {
        userId,
        subscriptionType,
        subscriptionValue
      });

      // Refresh points data
      await fetchPointsData();
      
      setShowRedeemModal(false);
      alert(`Successfully redeemed points for ${subscriptionType} subscription!`);
      
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to redeem points');
    } finally {
      setRedeemLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'watch_hours': return <FaClock className="text-primary" />;
      case 'ad_impressions': return <FaAd className="text-warning" />;
      case 'daily_bonus': return <FaGift className="text-success" />;
      case 'streak_bonus': return <FaFire className="text-danger" />;
      case 'redemption': return <FaExchangeAlt className="text-info" />;
      default: return <FaCoins className="text-secondary" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'watch_hours': return 'Watch Hours';
      case 'ad_impressions': return 'Ad Impressions';
      case 'daily_bonus': return 'Daily Bonus';
      case 'streak_bonus': return 'Streak Bonus';
      case 'redemption': return 'Redemption';
      default: return type;
    }
  };

  // Early return if no data or still loading
  if (isLoading || !pointsData) {
    return (
      <Card className="royalty-points-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaCoins className="me-2" />
            Royalty Points System
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="text-center p-4">
            <p className="mt-2">Loading royalty points...</p>
            {error && (
              <div className="mt-3">
                <Alert variant="danger">
                  <FaExclamationTriangle className="me-2" />
                  {error}
                </Alert>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={() => {
                    setError(null);
                    fetchPointsData();
                  }}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            )}
            
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="royalty-points-card">
        <Card.Body>
          <Alert variant="danger">
            <FaCoins className="me-2" />
            {error}
          </Alert>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={() => fetchPointsData(true)}
            className="mt-2"
          >
            Try Again
          </Button>
        </Card.Body>
      </Card>
    );
  }

  if (!pointsData) {
    return null;
  }

  return (
    <>
      <Card className="royalty-points-card">
        <Card.Header className="bg-transparent border-bottom border-secondary">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0 text-white">
              <FaCoins className="me-2" />
              Royalty Points System
            </h6>
            <div className="d-flex align-items-center gap-2">
              {lastSyncTime && (
                <small className="text-white-50">
                  Last sync: {lastSyncTime.toLocaleTimeString()}
                </small>
              )}
              <Button 
                variant="outline-light" 
                size="sm" 
                onClick={handleManualSync}
                disabled={isSyncing}
                title="Manually sync with BigQuery"
                className="d-flex align-items-center gap-1"
              >
                {isSyncing ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <FaSync />
                    <span>Sync</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card.Header>
        
        <Card.Body>
          {/* Welcome Message for New Users */}
          {showWelcome && (
            <Alert variant="success" className="mb-4">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <FaGift className="me-2" size={20} />
                  <div>
                    <strong>Welcome to AryZap! 🎉</strong>
                    <br />
                    <small>You've received 100 welcome points to start your journey. 
                    Watch videos and engage with ads to earn more points!</small>
                  </div>
                </div>
                <Button 
                  variant="outline-success" 
                  size="sm" 
                  onClick={markWelcomeAsSeen}
                  className="ms-2"
                >
                  Got it!
                </Button>
              </div>
            </Alert>
          )}

          {/* Show content only when data is loaded */}
          <>
            {/* Points Summary */}
            <Row className="mb-4">
              <Col md={6} className="mb-3">
                <div className="text-center p-3 border border-primary rounded bg-dark">
                  <div className="display-6 text-primary fw-bold">
                    {(pointsData?.availablePoints || 0).toLocaleString()}
                  </div>
                  <div className="text-white-50">Available Points</div>
                  <small className="text-white-50">
                    Total: {(pointsData?.totalPoints || 0).toLocaleString()}
                  </small>
                </div>
              </Col>
              
              <Col md={6} className="mb-3">
                <div className="text-center p-3 border border-success rounded bg-dark">
                  <div className="display-6 text-success fw-bold">
                    {(pointsData?.lifetimePoints || 0).toLocaleString()}
                  </div>
                  <div className="text-white-50">Lifetime Points</div>
                  <small className="text-white-50">
                    Redeemed: {(pointsData?.redeemedPoints || 0).toLocaleString()}
                  </small>
                </div>
              </Col>
            </Row>

            {/* Watch Hours & Ad Impressions */}
            <Row className="mb-4">
              <Col md={6} className="mb-3">
                <div className="d-flex align-items-center p-3 border border-info rounded bg-dark">
                  <FaClock className="text-info me-3" size={24} />
                  <div className="flex-grow-1">
                    <div className="fw-bold text-white">{pointsData?.watchHours?.total || 0}</div>
                    <small className="text-white-50">Watch Hours</small>
                    <div className="text-info small">
                      +{pointsData?.watchHours?.pointsEarned || 0} points earned
                    </div>
                  </div>
                </div>
              </Col>
              
              <Col md={6} className="mb-3">
                <div className="d-flex align-items-center p-3 border border-warning rounded bg-dark">
                  <FaAd className="text-warning me-3" size={24} />
                  <div className="flex-grow-1">
                    <div className="fw-bold text-white">{pointsData?.adImpressions?.total || 0}</div>
                    <small className="text-white-50">Ad Impressions</small>
                    <div className="text-warning small">
                      +{pointsData?.adImpressions?.pointsEarned || 0} points earned
                    </div>
                  </div>
                </div>
              </Col>
            </Row>

            {/* Daily Streak */}
            <Row className="mb-4">
              <Col md={6} className="mb-3">
                <div className="d-flex align-items-center p-3 border border-danger rounded bg-dark">
                  <FaFire className="text-danger me-3" size={24} />
                  <div className="flex-grow-1">
                    <div className="fw-bold text-white">{pointsData?.dailyStreak?.current || 0}</div>
                    <small className="text-white-50">Current Streak</small>
                    <div className="text-danger small">
                      Longest: {pointsData?.dailyStreak?.longest || 0} days
                    </div>
                  </div>
                </div>
              </Col>
              
              <Col md={6} className="mb-3">
                <div className="d-flex align-items-center p-3 border border-success rounded bg-dark">
                  <FaTrophy className="text-success me-3" size={24} />
                  <div className="flex-grow-1">
                    <div className="fw-bold text-white">
                      {pointsData?.nextMilestone?.points ? pointsData.nextMilestone.points.toLocaleString() : 'Max'}
                    </div>
                    <small className="text-white-50">Next Milestone</small>
                    <div className="text-success small">
                      {pointsData?.nextMilestone?.description || 'No milestone set'}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>

            {/* Progress Bar */}
            {pointsData?.nextMilestone?.points && (
              <Row className="mb-4">
                <Col>
                  <div className="p-3 border border-secondary rounded bg-dark">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-white-50">Progress to Next Milestone</span>
                      <span className="text-white">{pointsData?.nextMilestone?.progress || 0}%</span>
                    </div>
                    <ProgressBar 
                      now={pointsData?.nextMilestone?.progress || 0} 
                      variant="primary"
                      className="bg-secondary"
                    />
                  </div>
                </Col>
              </Row>
            )}
          </>

          {/* Sync Status */}
          <Row className="mb-3">
            <Col>
              <div className="d-flex justify-content-between align-items-center p-2 border border-secondary rounded bg-dark">
                <div className="d-flex align-items-center">
                  <FaSync className="text-info me-2" />
                  <small className="text-white-50">
                    <strong>Data Source:</strong> 
                    {lastSyncTime ? ' Last synced with BigQuery' : ' Database (cached)'}
                  </small>
                </div>
                <small className="text-white-50">
                  {lastSyncTime ? `Updated: ${lastSyncTime.toLocaleString()}` : 'Not synced yet'}
                </small>
              </div>
            </Col>
          </Row>

          {/* Action Buttons */}
          <Row>
            <Col md={4} className="mb-2">
              <Button 
                variant="primary" 
                className="w-100"
                onClick={() => setShowRedeemModal(true)}
                disabled={(pointsData?.availablePoints || 0) < 100}
              >
                <FaGift className="me-2" />
                Redeem Points
              </Button>
            </Col>
            
            <Col md={4} className="mb-2">
              <Button 
                variant="outline-info" 
                className="w-100"
                onClick={() => {
                  fetchPointHistory();
                  setShowHistoryModal(true);
                }}
              >
                <FaHistory className="me-2" />
                Point History
              </Button>
            </Col>

            <Col md={4} className="mb-2">
              <Button 
                variant="outline-warning" 
                className="w-100"
                onClick={handleManualSync}
                disabled={isSyncing}
                title="Sync with BigQuery for latest data"
              >
                {isSyncing ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <FaSync className="me-2" />
                    Sync BigQuery
                  </>
                )}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Redeem Points Modal */}
      <Modal show={showRedeemModal} onHide={() => setShowRedeemModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaGift className="me-2" />
            Redeem Points for Subscription
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Subscription Type</Form.Label>
              <Form.Select 
                value={subscriptionType} 
                onChange={(e) => setSubscriptionType(e.target.value)}
              >
                <option value="daily">Daily ($0.99)</option>
                <option value="weekly">Weekly ($4.99)</option>
                <option value="monthly">Monthly ($9.99)</option>
                <option value="yearly">Yearly ($99.99)</option>
                <option value="premium">Premium ($19.99)</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Subscription Value (USD)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0.01"
                value={subscriptionValue}
                onChange={(e) => setSubscriptionValue(parseFloat(e.target.value))}
              />
            </Form.Group>
            
            <Alert variant="info">
              <strong>Points Required:</strong> {Math.ceil(subscriptionValue * 100).toLocaleString()}
              <br />
              <strong>Available Points:</strong> {(pointsData?.availablePoints || 0).toLocaleString()}
              <br />
              <strong>Rate:</strong> 100 points = $1.00
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRedeemModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleRedeemPoints}
            disabled={redeemLoading || (pointsData?.availablePoints || 0) < Math.ceil(subscriptionValue * 100)}
          >
            {redeemLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              'Redeem Points'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Point History Modal */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaHistory className="me-2" />
            Point History
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="point-history-list">
            {Array.isArray(pointHistory) && pointHistory.map((entry, index) => (
              <div key={index} className="d-flex align-items-center p-2 border-bottom">
                <div className="me-3">
                  {getTypeIcon(entry.type)}
                </div>
                <div className="flex-grow-1">
                  <div className="fw-bold text-white">
                    {entry.amount > 0 ? `+${entry.amount}` : entry.amount} points
                  </div>
                  <small className="text-white-50">{entry.description}</small>
                  <div className="text-muted small">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                </div>
                <Badge bg={entry.amount > 0 ? 'success' : 'secondary'}>
                  {getTypeLabel(entry.type)}
                </Badge>
              </div>
            ))}
            
            {(!Array.isArray(pointHistory) || pointHistory.length === 0) && (
              <div className="text-center text-muted py-4">
                No point history available
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default RoyaltyPointsCard;
