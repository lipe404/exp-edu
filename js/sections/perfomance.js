// Performance Monitor
const PerformanceMonitor = {
  init() {
    this.monitorPageLoad();
    this.monitorCoreWebVitals();
  },

  monitorPageLoad() {
    window.addEventListener("load", () => {
      const loadTime =
        performance.timing.loadEventEnd - performance.timing.navigationStart;

      if (typeof gtag !== "undefined") {
        gtag("event", "page_load_time", {
          load_time_ms: loadTime,
        });
      }
    });
  },

  monitorCoreWebVitals() {
    // Implementar Web Vitals se necessário
    // Requer biblioteca web-vitals
  },
};