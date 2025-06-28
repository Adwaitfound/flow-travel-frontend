class AutoRefresh {
  constructor(options = {}) {
    this.interval = options.interval || 30000; // 30 seconds default
    this.onUpdate = options.onUpdate || (() => {});
    this.onError = options.onError || ((error) => console.error('Auto-refresh error:', error));
    this.isRunning = false;
    this.timeoutId = null;
    this.lastUpdate = null;
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🔄 Auto-refresh started');
    
    const refresh = async () => {
      if (!this.isRunning) return;
      
      try {
        // Check for updates from the API
        const response = await fetch('/api/itineraries');
        
        if (response.ok) {
          const data = await response.json();
          
          // Only trigger update if data has changed
          const currentUpdate = JSON.stringify(data);
          if (this.lastUpdate !== currentUpdate) {
            this.lastUpdate = currentUpdate;
            this.onUpdate(data, true); // true = force refresh
          }
        }
      } catch (error) {
        this.onError(error);
      }
      
      // Schedule next refresh
      if (this.isRunning) {
        this.timeoutId = setTimeout(refresh, this.interval);
      }
    };
    
    // Start first refresh
    refresh();
  }

  stop() {
    this.isRunning = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    console.log('⏹️ Auto-refresh stopped');
  }

  setInterval(newInterval) {
    this.interval = newInterval;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}

// Make it available globally
window.AutoRefresh = AutoRefresh;