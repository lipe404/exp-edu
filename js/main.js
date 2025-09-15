// Inicialização da Aplicação
class App {
  constructor() {
    this.init();
  }

  init() {
    // Aguardar DOM estar pronto
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
      // Verificar se todos os módulos estão carregados
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
          name: "FormManager",
          obj: typeof FormManager !== "undefined" ? FormManager : null,
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
            console.log(`✅ ${module.name} inicializado com sucesso!`);
          } catch (error) {
            console.error(`❌ Erro ao inicializar ${module.name}:`, error);
          }
        } else {
          console.warn(
            `⚠️ ${module.name} não foi carregado ou não possui método init()`
          );
        }
      });

      console.log("✅ Educa+ Minas Landing Page inicializada com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao inicializar aplicação:", error);
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
  FormManager: typeof FormManager !== "undefined" ? FormManager : {},
};
