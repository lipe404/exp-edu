// Inicialização da Aplicação
class App {
  constructor() {
    this.init();
  }

  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.initializeModules()
      );
    } else {
      this.initializeModules();
    }
  }

  initializeModules() {
    try {
      const modules = [
        {
          name: "LoadingManager",
          obj: typeof LoadingManager !== "undefined" ? LoadingManager : null,
        },
        {
          name: "ScrollManager",
          obj: typeof ScrollManager !== "undefined" ? ScrollManager : null,
        },
        {
          name: "TestimonialCarousel",
          obj:
            typeof TestimonialCarousel !== "undefined"
              ? TestimonialCarousel
              : null,
        },
        {
          name: "FAQManager",
          obj: typeof FAQManager !== "undefined" ? FAQManager : null,
        },
        {
          name: "ProfitabilityCalculator",
          obj:
            typeof ProfitabilityCalculator !== "undefined"
              ? ProfitabilityCalculator
              : null,
        },
        {
          name: "FormsManager",
          obj: typeof FormsManager !== "undefined" ? FormsManager : null,
        },
        {
          name: "AnalyticsManager",
          obj:
            typeof AnalyticsManager !== "undefined" ? AnalyticsManager : null,
        },
        {
          name: "PerformanceMonitor",
          obj:
            typeof PerformanceMonitor !== "undefined"
              ? PerformanceMonitor
              : null,
        },
      ];

      modules.forEach((module) => {
        if (module.obj && typeof module.obj.init === "function") {
          try {
            module.obj.init();
          } catch (error) {
          }
        } else {
          console.warn(
            `⚠️ ${module.name} não foi carregado ou não possui método init()`
          );
        }
      });

    } catch (error) {
    }
  }
}

// Inicializar aplicação
new App();

// Exportar para uso global se necessário
window.EducaMinas = {
  Utils: typeof Utils !== "undefined" ? Utils : {},
  ScrollManager: typeof ScrollManager !== "undefined" ? ScrollManager : {},
  TestimonialCarousel:
    typeof TestimonialCarousel !== "undefined" ? TestimonialCarousel : {},
  FAQManager: typeof FAQManager !== "undefined" ? FAQManager : {},
  ProfitabilityCalculator:
    typeof ProfitabilityCalculator !== "undefined"
      ? ProfitabilityCalculator
      : {},
  FormsManager: typeof FormsManager !== "undefined" ? FormsManager : {},
};
