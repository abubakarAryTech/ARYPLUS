const isDevelopment = import.meta.env.VITE_MODE === 'development';

class Logger {
  constructor() {
    this.errorCount = 0;
    this.warnCount = 0;
    this.startTime = Date.now();
  }

  formatMessage(level, args) {
    const timestamp = new Date().toISOString();
    const uptime = ((Date.now() - this.startTime) / 1000).toFixed(2);
    return [`[${timestamp}] [${uptime}s] [${level}]`, ...args];
  }

  log(...args) {
    console.log(...this.formatMessage('LOG', args));
  }

  error(...args) {
    this.errorCount++;
    console.error(...this.formatMessage('ERROR', args));
    
    const errorObj = args.find(arg => arg instanceof Error) || new Error(args.join(' '));
    
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: errorObj.message,
        fatal: false,
      });
    }
    
    if (this.errorCount > 50) {
      console.error('⚠️ High error count detected:', this.errorCount);
    }
  }

  warn(...args) {
    this.warnCount++;
    console.warn(...this.formatMessage('WARN', args));
  }

  info(...args) {
    console.info(...this.formatMessage('INFO', args));
  }

  debug(...args) {
    if (isDevelopment) {
      console.debug(...this.formatMessage('DEBUG', args));
    }
  }

  table(...args) {
    if (isDevelopment) {
      console.table(...args);
    }
  }

  time(label) {
    if (isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }

  getStats() {
    return {
      errors: this.errorCount,
      warnings: this.warnCount,
      uptime: ((Date.now() - this.startTime) / 1000).toFixed(2) + 's'
    };
  }
}

export default new Logger();
