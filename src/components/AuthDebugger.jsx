import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Badge } from 'react-bootstrap';
import { auth } from '../firebase';
import api from '../services/api';
import logger from '../services/logger';
import { useAuthStore } from '../stores/useAuthStore';

const AuthDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user: zustandUser } = useAuthStore();

  useEffect(() => {
    updateDebugInfo();
  }, [zustandUser]);

  const updateDebugInfo = () => {
    const firebaseUser = auth.currentUser;
    
    setDebugInfo({
      zustandUser: zustandUser,
      firebaseUser: firebaseUser ? {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified
      } : null,
      timestamp: new Date().toISOString()
    });
  };

  const testAuth = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      // Test BigQuery endpoint (should work)
      const bigQueryResponse = await api.get('/api/bigquery/user-analytics/test-user');
      logger.log('BigQuery test response:', bigQueryResponse);
      
      // Test royalty points endpoint (should work if authenticated)
      const royaltyResponse = await api.get('/api/royalty-points/test');
      logger.log('Royalty points test response:', royaltyResponse);
      
      setTestResult({
        success: true,
        bigQuery: 'Success',
        royaltyPoints: 'Success',
        message: 'Both endpoints working!'
      });
    } catch (error) {
      logger.error('Test failed:', error);
      setTestResult({
        success: false,
        bigQuery: error.response?.status === 401 ? 'Auth Failed' : 'Success',
        royaltyPoints: error.response?.status === 401 ? 'Auth Failed' : 'Success',
        message: error.response?.data?.message || error.message,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  const getToken = async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken(true);
        logger.log('Current token:', token);
        alert(`Token retrieved: ${token ? 'Yes' : 'No'}\nLength: ${token ? token.length : 0}`);
      } else {
        alert('No Firebase user authenticated');
      }
    } catch (error) {
      alert(`Error getting token: ${error.message}`);
    }
  };

  return (
    <Card className="mb-3">
      <Card.Header>
        <h6>🔐 Authentication Debugger</h6>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <h6>Current State:</h6>
          <div className="small">
            <strong>Zustand User:</strong> {debugInfo.zustandUser ? (
              <Badge bg="success">{debugInfo.zustandUser.uid}</Badge>
            ) : (
              <Badge bg="danger">None</Badge>
            )}
          </div>
          <div className="small">
            <strong>Firebase User:</strong> {debugInfo.firebaseUser ? (
              <Badge bg="success">{debugInfo.firebaseUser.uid}</Badge>
            ) : (
              <Badge bg="danger">None</Badge>
            )}
          </div>
          <div className="small">
            <strong>Last Updated:</strong> {debugInfo.timestamp}
          </div>
        </div>

        <div className="mb-3">
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={updateDebugInfo}
            className="me-2"
          >
            🔄 Refresh
          </Button>
          <Button 
            variant="outline-info" 
            size="sm" 
            onClick={getToken}
            className="me-2"
          >
            🔑 Get Token
          </Button>
          <Button 
            variant="outline-success" 
            size="sm" 
            onClick={testAuth}
            disabled={loading}
          >
            🧪 Test Endpoints
          </Button>
        </div>

        {testResult && (
          <Alert variant={testResult.success ? 'success' : 'danger'}>
            <h6>Test Results:</h6>
            <div><strong>BigQuery:</strong> {testResult.bigQuery}</div>
            <div><strong>Royalty Points:</strong> {testResult.royaltyPoints}</div>
            <div><strong>Message:</strong> {testResult.message}</div>
            {testResult.status && <div><strong>Status:</strong> {testResult.status}</div>}
          </Alert>
        )}

        <div className="mt-3">
          <h6>Debug Info:</h6>
          <pre className="small bg-light p-2 rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AuthDebugger;
