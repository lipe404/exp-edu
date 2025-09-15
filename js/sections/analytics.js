// Gerenciamento de Analytics e Tracking
const AnalyticsManager = {
  init() {
    this.setupScrollTracking();
    this.setupClickTracking();
    this.setupTimeOnPage();
  },

  setupScrollTracking() {
    const milestones = [25, 50, 75, 100];
    const tracked = new Set();

    const trackScroll = Utils.debounce(() => {
      const scrollPercent = Math.round(
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
          100
      );

      milestones.forEach((milestone) => {
        if (scrollPercent >= milestone && !tracked.has(milestone)) {
          tracked.add(milestone);

          if (typeof gtag !== "undefined") {
            gtag("event", "scroll", {
              scroll_depth: milestone,
            });
          }
        }
      });
    }, 500);

    window.addEventListener("scroll", trackScroll);
  },

  setupClickTracking() {
    // Tracking de CTAs
    document
      .querySelectorAll('a[href="#formulario-parceria"]')
      .forEach((cta) => {
        cta.addEventListener("click", () => {
          if (typeof gtag !== "undefined") {
            gtag("event", "cta_click", {
              cta_text: cta.textContent.trim(),
              cta_location: this.getCTALocation(cta),
            });
          }
        });
      });

    // Tracking de links externos
    document.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (typeof gtag !== "undefined") {
          gtag("event", "external_link_click", {
            link_url: link.href,
            link_text: link.textContent.trim(),
          });
        }
      });
    });
  },

  setupTimeOnPage() {
    const startTime = Date.now();

    // Tracking a cada 30 segundos
    setInterval(() => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);

      if (typeof gtag !== "undefined") {
        gtag("event", "time_on_page", {
          time_seconds: timeOnPage,
        });
      }
    }, 30000);
  },

  getCTALocation(element) {
    const section = element.closest("section");
    return section ? section.id || "unknown" : "header";
  },
};
