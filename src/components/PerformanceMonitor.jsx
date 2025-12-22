import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FaTachometerAlt, FaClock, FaDatabase, FaChartLine } from 'react-icons/fa';
import logger from '../services/logger';

const PerformanceMonitor = ({ userId }) => {
  const [metrics, setMetrics] = useState({
    loadTimes: [],
    cacheHits: 0,
    cacheMisses: 0,
    lastLoadTime: null,
    averageLoadTime: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Load saved metrics from localStorage
    const savedMetrics = localStorage.getItem(`perf_metrics_${userId}`);
    if (savedMetrics) {
      try {
        setMetrics(JSON.parse(savedMetrics));
      } catch (e) {
        logger.warn('Could not parse saved metrics');
      }
    }
  }, [userId]);

  const recordLoadTime = (loadTime) => {
    const newMetrics = {
      ...metrics,
      loadTimes: [...metrics.loadTimes, loadTime].slice(-10), // Keep last 10
      lastLoadTime: loadTime,
      averageLoadTime: calculateAverage([...metrics.loadTimes, loadTime])
    };
    
    setMetrics(newMetrics);
    localStorage.setItem(`perf_metrics_${userId}`, JSON.stringify(newMetrics));
  };

  const recordCacheHit = () => {
    const newMetrics = { ...metrics, cacheHits: metrics.cacheHits + 1 };
    setMetrics(newMetrics);
    localStorage.setItem(`perf_metrics_${userId}`, JSON.stringify(newMetrics));
  };

  const recordCacheMiss = () => {
    const newMetrics = { ...metrics, cacheMisses: metrics.cacheMisses + 1 };
    setMetrics(newMetrics);
    localStorage.setItem(`perf_metrics_${userId}`, JSON.stringify(newMetrics));
  };

  const calculateAverage = (times) => {
    if (times.length === 0) return 0;
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  };

  const getPerformanceGrade = (avgTime) => {
    if (avgTime < 100) return { grade: 'A+', color: 'success', text: 'Excellent' };
    if (avgTime < 200) return { grade: 'A', color: 'success', text: 'Great' };
    if (avgTime < 500) return { grade: 'B', color: 'warning', text: 'Good' };
    if (avgTime < 1000) return { grade: 'C', color: 'warning', text: 'Fair' };
    return { grade: 'D', color: 'danger', text: 'Poor' };
  };

  const clearMetrics = () => {
    const newMetrics = {
      loadTimes: [],
      cacheHits: 0,
      cacheMisses: 0,
      lastLoadTime: null,
      averageLoadTime: 0
    };
    setMetrics(newMetrics);
    localStorage.setItem(`perf_metrics_${userId}`, JSON.stringify(newMetrics));
  };

  const performanceGrade = getPerformanceGrade(metrics.averageLoadTime);
  const cacheHitRate = metrics.cacheHits + metrics.cacheMisses > 0 
    ? Math.round((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100)
    : 0;

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <FaTachometerAlt className="me-2" />
          Performance Monitor
        </h6>
        <div>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={clearMetrics}
            className="me-2"
          >
            Clear
          </Button>
          <Button 
            variant={isMonitoring ? "danger" : "success"} 
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? "Stop" : "Start"} Monitoring
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="row">
          <div className="col-md-6">
            <h6>Load Time Performance</h6>
            <div className="mb-2">
              <strong>Last Load:</strong> 
              <Badge bg={metrics.lastLoadTime < 200 ? "success" : "warning"} className="ms-2">
                {metrics.lastLoadTime ? `${metrics.lastLoadTime}ms` : 'N/A'}
              </Badge>
            </div>
            <div className="mb-2">
              <strong>Average Load:</strong> 
              <Badge bg={performanceGrade.color} className="ms-2">
                {metrics.averageLoadTime}ms
              </Badge>
            </div>
            <div className="mb-2">
              <strong>Grade:</strong> 
              <Badge bg={performanceGrade.color} className="ms-2">
                {performanceGrade.grade} - {performanceGrade.text}
              </Badge>
            </div>
          </div>
          
          <div className="col-md-6">
            <h6>Cache Performance</h6>
            <div className="mb-2">
              <strong>Cache Hits:</strong> 
              <Badge bg="success" className="ms-2">
                {metrics.cacheHits}
              </Badge>
            </div>
            <div className="mb-2">
              <strong>Cache Misses:</strong> 
              <Badge bg="warning" className="ms-2">
                {metrics.cacheMisses}
              </Badge>
            </div>
            <div className="mb-2">
              <strong>Hit Rate:</strong> 
              <Badge bg={cacheHitRate > 80 ? "success" : cacheHitRate > 60 ? "warning" : "danger"} className="ms-2">
                {cacheHitRate}%
              </Badge>
            </div>
          </div>
        </div>

        {metrics.loadTimes.length > 0 && (
          <div className="mt-3">
            <h6>Recent Load Times</h6>
            <div className="d-flex flex-wrap gap-1">
              {metrics.loadTimes.map((time, index) => (
                <Badge 
                  key={index} 
                  bg={time < 200 ? "success" : time < 500 ? "warning" : "danger"}
                  className="me-1"
                >
                  {time}ms
                </Badge>
              ))}
            </div>
          </div>
        )}

        {isMonitoring && (
          <div className="mt-3 p-2 bg-light rounded">
            <small className="text-muted">
              <FaClock className="me-1" />
              Performance monitoring is active. Load times will be recorded automatically.
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PerformanceMonitor;
