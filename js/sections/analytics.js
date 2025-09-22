// Gerenciamento de Analytics e Tracking
const AnalyticsManager = {
  init() {
    this.setupScrollTracking();
    this.setupClickTracking();
    this.setupTimeOnPage();
    this.setupFormTracking();
    this.setupVideoTracking();
    this.setupModalTracking();
    this.setupCalculatorTracking();
    this.setupFloatingButtonsTracking();
    this.setupEngagementTracking();
  },

  setupScrollTracking() {
    const milestones = [25, 50, 75, 100];
    const tracked = new Set();
    const sectionTracked = new Set();

    const trackScroll = Utils.debounce(() => {
      const scrollPercent = Math.round(
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
          100
      );

      // Track scroll milestones
      milestones.forEach((milestone) => {
        if (scrollPercent >= milestone && !tracked.has(milestone)) {
          tracked.add(milestone);

          if (typeof gtag !== "undefined") {
            gtag("event", "scroll", {
              event_category: "engagement",
              scroll_depth: milestone,
              page_location: window.location.href,
            });
          }

          if (typeof fbq !== "undefined") {
            fbq("track", "PageScroll", {
              scroll_depth: milestone,
            });
          }
        }
      });

      // Track section views
      this.trackSectionViews(sectionTracked);
    }, 500);

    window.addEventListener("scroll", trackScroll);
  },

  trackSectionViews(tracked) {
    const sections = document.querySelectorAll("section[id]");

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (isVisible && !tracked.has(section.id)) {
        tracked.add(section.id);

        if (typeof gtag !== "undefined") {
          gtag("event", "section_view", {
            event_category: "engagement",
            section_name: section.id,
            section_title:
              section.querySelector("h1, h2, h3")?.textContent?.trim() ||
              section.id,
          });
        }
      }
    });
  },

  setupClickTracking() {
    // Tracking de CTAs principais
    document
      .querySelectorAll('a[href="#formulario-parceria"], a[href*="formulario"]')
      .forEach((cta) => {
        cta.addEventListener("click", () => {
          this.trackEvent("cta_click", {
            event_category: "conversion",
            cta_text: cta.textContent.trim(),
            cta_location: this.getCTALocation(cta),
            cta_type: "form_redirect",
          });
        });
      });

    // Tracking de links externos
    document
      .querySelectorAll("a[href^='http'], a[href^='mailto'], a[href^='tel']")
      .forEach((link) => {
        link.addEventListener("click", () => {
          const linkType = this.getLinkType(link.href);

          this.trackEvent("external_link_click", {
            event_category: "engagement",
            link_url: link.href,
            link_text: link.textContent.trim(),
            link_type: linkType,
            link_location: this.getCTALocation(link),
          });
        });
      });

    // Tracking de navegação interna
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", () => {
        this.trackEvent("internal_navigation", {
          event_category: "navigation",
          target_section: link.getAttribute("href"),
          link_text: link.textContent.trim(),
          source_location: this.getCTALocation(link),
        });
      });
    });
  },

  setupFormTracking() {
    // Track form interactions
    const forms = ["partnership-form", "partner-form", "leadForm"];

    forms.forEach((formId) => {
      const form = document.getElementById(formId);
      if (!form) return;

      const formType = this.getFormType(formId);

      // Track form start (first interaction)
      let formStarted = false;
      const inputs = form.querySelectorAll("input, select, textarea");

      inputs.forEach((input) => {
        input.addEventListener("focus", () => {
          if (!formStarted) {
            formStarted = true;
            this.trackEvent("form_start", {
              event_category: "forms",
              form_type: formType,
              form_id: formId,
              field_name: input.name || input.id,
            });
          }
        });

        // Track field completion
        input.addEventListener("blur", () => {
          if (input.value.trim()) {
            this.trackEvent("form_field_complete", {
              event_category: "forms",
              form_type: formType,
              form_id: formId,
              field_name: input.name || input.id,
              field_type: input.type,
            });
          }
        });
      });

      // Track form submission attempts
      form.addEventListener("submit", () => {
        this.trackEvent("form_submit_attempt", {
          event_category: "forms",
          form_type: formType,
          form_id: formId,
        });
      });

      // Track form abandonment
      document.addEventListener("beforeunload", () => {
        if (formStarted && !form.dataset.submitted) {
          this.trackEvent("form_abandon", {
            event_category: "forms",
            form_type: formType,
            form_id: formId,
          });
        }
      });
    });
  },

  setupVideoTracking() {
    const video = document.querySelector("video");
    if (!video) return;

    let videoStarted = false;
    let quarterTracked = new Set();

    video.addEventListener("play", () => {
      if (!videoStarted) {
        videoStarted = true;
        this.trackEvent("video_start", {
          event_category: "engagement",
          video_title: "Vinheta Educa+",
          video_duration: video.duration,
        });
      }
    });

    video.addEventListener("pause", () => {
      this.trackEvent("video_pause", {
        event_category: "engagement",
        video_title: "Vinheta Educa+",
        video_current_time: video.currentTime,
        video_percent: Math.round((video.currentTime / video.duration) * 100),
      });
    });

    video.addEventListener("ended", () => {
      this.trackEvent("video_complete", {
        event_category: "engagement",
        video_title: "Vinheta Educa+",
        video_duration: video.duration,
      });
    });

    // Track video progress
    video.addEventListener("timeupdate", () => {
      const percent = Math.round((video.currentTime / video.duration) * 100);
      const quarters = [25, 50, 75];

      quarters.forEach((quarter) => {
        if (percent >= quarter && !quarterTracked.has(quarter)) {
          quarterTracked.add(quarter);
          this.trackEvent("video_progress", {
            event_category: "engagement",
            video_title: "Vinheta Educa+",
            video_percent: quarter,
          });
        }
      });
    });
  },

  setupModalTracking() {
    // Track modal opens/closes
    const modals = ["partnership-form-modal", "leadCaptureModal"];

    modals.forEach((modalId) => {
      const modal = document.getElementById(modalId);
      if (!modal) return;

      // Observer para detectar quando modal abre/fecha
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === "class") {
            const isHidden = modal.classList.contains("hidden");
            const modalType = modalId.includes("partnership")
              ? "partnership"
              : "lead_capture";

            if (!isHidden && mutation.oldValue?.includes("hidden")) {
              this.trackEvent("modal_open", {
                event_category: "engagement",
                modal_type: modalType,
                modal_id: modalId,
              });
            } else if (isHidden && !mutation.oldValue?.includes("hidden")) {
              this.trackEvent("modal_close", {
                event_category: "engagement",
                modal_type: modalType,
                modal_id: modalId,
              });
            }
          }
        });
      });

      observer.observe(modal, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ["class"],
      });
    });
  },

  setupCalculatorTracking() {
    // Track calculator usage
    const calculatorInputs = document.querySelectorAll(
      "#calculator input, #calculator select"
    );
    let calculatorUsed = false;

    calculatorInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (!calculatorUsed) {
          calculatorUsed = true;
          this.trackEvent("calculator_start", {
            event_category: "tools",
            tool_name: "profitability_calculator",
          });
        }

        this.trackEvent("calculator_input", {
          event_category: "tools",
          tool_name: "profitability_calculator",
          input_name: input.name || input.id,
          input_value: input.value,
        });
      });
    });

    // Track calculator results
    const calculateButton = document.querySelector("#calculator button");
    if (calculateButton) {
      calculateButton.addEventListener("click", () => {
        this.trackEvent("calculator_calculate", {
          event_category: "tools",
          tool_name: "profitability_calculator",
        });
      });
    }
  },

  setupFloatingButtonsTracking() {
    // Track floating buttons
    const floatingButtons = ["openGuideModal", "openPodcastModal"];

    floatingButtons.forEach((buttonId) => {
      const button = document.getElementById(buttonId);
      if (!button) return;

      button.addEventListener("click", () => {
        const contentType = button.dataset.type;
        this.trackEvent("floating_button_click", {
          event_category: "engagement",
          button_type: contentType,
          content_type: contentType,
          file_url: button.dataset.file,
        });
      });
    });

    // Track WhatsApp and phone clicks
    document
      .querySelectorAll('a[href^="https://wa.me"], a[href^="tel:"]')
      .forEach((link) => {
        link.addEventListener("click", () => {
          const type = link.href.includes("wa.me") ? "whatsapp" : "phone";
          this.trackEvent("contact_click", {
            event_category: "conversion",
            contact_type: type,
            contact_value: link.href,
          });
        });
      });
  },

  setupTimeOnPage() {
    const startTime = Date.now();
    const milestones = [30, 60, 120, 300, 600]; // 30s, 1m, 2m, 5m, 10m
    const tracked = new Set();

    // Track time milestones
    setInterval(() => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);

      milestones.forEach((milestone) => {
        if (timeOnPage >= milestone && !tracked.has(milestone)) {
          tracked.add(milestone);

          this.trackEvent("time_on_page", {
            event_category: "engagement",
            time_seconds: milestone,
            time_formatted: this.formatTime(milestone),
          });
        }
      });
    }, 10000); // Check every 10 seconds

    // Track page exit
    window.addEventListener("beforeunload", () => {
      const finalTime = Math.round((Date.now() - startTime) / 1000);
      this.trackEvent("page_exit", {
        event_category: "engagement",
        total_time_seconds: finalTime,
        total_time_formatted: this.formatTime(finalTime),
      });
    });
  },

  setupEngagementTracking() {
    // Track FAQ interactions
    document.querySelectorAll(".faq-item").forEach((item, index) => {
      item.addEventListener("click", () => {
        this.trackEvent("faq_click", {
          event_category: "engagement",
          faq_question:
            item.querySelector("h3")?.textContent?.trim() || `FAQ ${index + 1}`,
          faq_index: index + 1,
        });
      });
    });

    // Track testimonial interactions
    document.querySelectorAll(".testimonial").forEach((testimonial, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.trackEvent("testimonial_view", {
                event_category: "engagement",
                testimonial_index: index + 1,
                testimonial_author:
                  testimonial.querySelector(".author")?.textContent?.trim() ||
                  "Unknown",
              });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(testimonial);
    });

    // Track copy actions (if any)
    document.addEventListener("copy", () => {
      this.trackEvent("content_copy", {
        event_category: "engagement",
        copied_text: window.getSelection().toString().substring(0, 100),
      });
    });
  },

  // Utility methods
  trackEvent(eventName, parameters = {}) {
    // Google Analytics 4
    if (typeof gtag !== "undefined") {
      gtag("event", eventName, {
        event_category: parameters.event_category || "general",
        ...parameters,
      });
    }

    // Facebook Pixel
    if (typeof fbq !== "undefined") {
      fbq("track", eventName, parameters);
    }
  },

  getCTALocation(element) {
    // Try to find the parent section
    const section = element.closest("section");
    if (section && section.id) {
      return section.id;
    }

    // Try to find parent with class
    const parentWithClass = element.closest(
      "[class*='section'], [class*='hero'], [class*='header']"
    );
    if (parentWithClass) {
      return parentWithClass.className.split(" ")[0];
    }

    // Check if it's in header/nav
    if (element.closest("header, nav")) {
      return "header";
    }

    // Check if it's in footer
    if (element.closest("footer")) {
      return "footer";
    }

    return "unknown";
  },

  getLinkType(href) {
    if (href.includes("mailto:")) return "email";
    if (href.includes("tel:")) return "phone";
    if (href.includes("wa.me") || href.includes("whatsapp")) return "whatsapp";
    if (href.includes("facebook.com")) return "facebook";
    if (href.includes("instagram.com")) return "instagram";
    if (href.includes("linkedin.com")) return "linkedin";
    if (href.includes("youtube.com")) return "youtube";
    return "external";
  },

  getFormType(formId) {
    switch (formId) {
      case "partnership-form":
        return "main_form";
      case "partner-form":
        return "modal_form";
      case "leadForm":
        return "lead_capture";
      default:
        return "unknown";
    }
  },

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  },

  // Enhanced conversion tracking
  trackConversion(type, value = null, currency = "BRL") {
    const conversionData = {
      event_category: "conversion",
      conversion_type: type,
      value: value,
      currency: currency,
      timestamp: new Date().toISOString(),
    };

    // Google Analytics Enhanced Ecommerce
    if (typeof gtag !== "undefined") {
      gtag("event", "conversion", conversionData);

      if (value) {
        gtag("event", "purchase", {
          transaction_id: `conv_${Date.now()}`,
          value: value,
          currency: currency,
          items: [
            {
              item_id: type,
              item_name: type,
              category: "lead_generation",
              quantity: 1,
              price: value,
            },
          ],
        });
      }
    }

    // Facebook Pixel Conversion
    if (typeof fbq !== "undefined") {
      fbq("track", "Lead", conversionData);

      if (value) {
        fbq("track", "Purchase", {
          value: value,
          currency: currency,
        });
      }
    }

    console.log("🎯 Conversion Tracked:", conversionData);
  },

  // Track form success
  trackFormSuccess(formType, leadData = {}) {
    this.trackEvent("form_success", {
      event_category: "conversion",
      form_type: formType,
      lead_source: leadData.source || "unknown",
      content_type: leadData.content_type || null,
    });

    // Track as conversion with estimated value
    const conversionValues = {
      main_form: 50,
      modal_form: 30,
      lead_capture: 20,
    };

    this.trackConversion(formType, conversionValues[formType] || 10);
  },
};
