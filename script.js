// Configurações Globais
const CONFIG = {
  ANIMATION_DURATION: 300,
  SCROLL_OFFSET: 80,
  CAROUSEL_AUTO_PLAY: 5000,
  FORM_ENDPOINT: "/api/partnership-form", // Substitua pela sua URL de API
};

// Estado da Aplicação
const AppState = {
  currentTestimonial: 0,
  isFormSubmitting: false,
  hasScrolled: false,
};

// Utilitários
const Utils = {
  // Debounce function para otimizar performance
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Smooth scroll para elementos
  smoothScrollTo(element, offset = CONFIG.SCROLL_OFFSET) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: "smooth",
    });
  },

  // Validação de email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Formatação de telefone
  formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  },

  // Animação de contadores
  animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      element.textContent = current.toLocaleString("pt-BR");

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  },
};

// Gerenciamento de Loading
const LoadingManager = {
  init() {
    window.addEventListener("load", () => {
      setTimeout(() => {
        const spinner = document.getElementById("loading-spinner");
        if (spinner) {
          spinner.style.opacity = "0";
          setTimeout(() => {
            spinner.style.display = "none";
          }, 300);
        }
      }, 500);
    });
  },
};

// Gerenciamento de Scroll
const ScrollManager = {
  init() {
    this.setupSmoothScrolling();
    this.setupScrollIndicators();
    this.setupBackToTop();
    this.setupScrollAnimations();
  },

  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          Utils.smoothScrollTo(targetElement);

          // Atualizar URL sem recarregar página
          history.pushState(null, null, targetId);

          // Google Analytics tracking
          if (typeof gtag !== "undefined") {
            gtag("event", "scroll_to_section", {
              section_name: targetId.replace("#", ""),
            });
          }
        }
      });
    });
  },

  setupScrollIndicators() {
    const backToTopBtn = document.getElementById("back-to-top");

    const handleScroll = Utils.debounce(() => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      // Back to top button
      if (scrollTop > 300) {
        backToTopBtn.classList.remove("opacity-0", "invisible");
        backToTopBtn.classList.add("opacity-100", "visible");
      } else {
        backToTopBtn.classList.add("opacity-0", "invisible");
        backToTopBtn.classList.remove("opacity-100", "visible");
      }

      // Marcar que o usuário fez scroll
      if (scrollTop > 100 && !AppState.hasScrolled) {
        AppState.hasScrolled = true;
        if (typeof gtag !== "undefined") {
          gtag("event", "page_scroll", {
            scroll_depth: "100px",
          });
        }
      }
    }, 100);

    window.addEventListener("scroll", handleScroll);
  },

  setupBackToTop() {
    const backToTopBtn = document.getElementById("back-to-top");
    if (backToTopBtn) {
      backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        if (typeof gtag !== "undefined") {
          gtag("event", "back_to_top_click");
        }
      });
    }
  },

  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in");

          // Animação especial para contadores
          if (entry.target.hasAttribute("data-counter")) {
            const finalValue = parseInt(
              entry.target.getAttribute("data-counter")
            );
            Utils.animateCounter(entry.target, 0, finalValue, 2000);
          }
        }
      });
    }, observerOptions);

    // Observar elementos com animação
    document
      .querySelectorAll(".animate-fade-in-up, [data-counter]")
      .forEach((el) => {
        observer.observe(el);
      });
  },
};

// Gerenciamento do Carrossel de Depoimentos
const TestimonialCarousel = {
  init() {
    this.carousel = document.getElementById("testimonial-carousel");
    this.indicators = document.querySelectorAll(".testimonial-indicator");
    this.prevBtn = document.getElementById("prev-testimonial");
    this.nextBtn = document.getElementById("next-testimonial");

    if (!this.carousel) return;

    this.setupControls();
    this.setupAutoPlay();
    this.setupTouchGestures();
  },

  setupControls() {
    // Botões de navegação
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => this.goToPrevious());
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => this.goToNext());
    }

    // Indicadores
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => this.goToSlide(index));
    });

    // Navegação por teclado
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.goToPrevious();
      if (e.key === "ArrowRight") this.goToNext();
    });
  },

  setupAutoPlay() {
    setInterval(() => {
      this.goToNext();
    }, CONFIG.CAROUSEL_AUTO_PLAY);
  },

  setupTouchGestures() {
    let startX = 0;
    let endX = 0;

    this.carousel.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });

    this.carousel.addEventListener("touchend", (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.goToNext();
        } else {
          this.goToPrevious();
        }
      }
    });
  },

  goToSlide(index) {
    const totalSlides = this.indicators.length;
    AppState.currentTestimonial = index;

    const translateX = -index * 100;
    this.carousel.style.transform = `translateX(${translateX}%)`;

    this.updateIndicators();

    // Analytics tracking
    if (typeof gtag !== "undefined") {
      gtag("event", "testimonial_view", {
        testimonial_index: index,
      });
    }
  },

  goToNext() {
    const totalSlides = this.indicators.length;
    const nextIndex = (AppState.currentTestimonial + 1) % totalSlides;
    this.goToSlide(nextIndex);
  },

  goToPrevious() {
    const totalSlides = this.indicators.length;
    const prevIndex =
      AppState.currentTestimonial === 0
        ? totalSlides - 1
        : AppState.currentTestimonial - 1;
    this.goToSlide(prevIndex);
  },

  updateIndicators() {
    this.indicators.forEach((indicator, index) => {
      if (index === AppState.currentTestimonial) {
        indicator.classList.remove("bg-gray-300");
        indicator.classList.add("bg-educa-pink");
      } else {
        indicator.classList.add("bg-gray-300");
        indicator.classList.remove("bg-educa-pink");
      }
    });
  },
};

// Gerenciamento do FAQ
const FAQManager = {
  init() {
    this.setupFAQToggle();
  },

  setupFAQToggle() {
    document.querySelectorAll(".faq-button").forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-target");
        const content = document.getElementById(targetId);
        const icon = button.querySelector("i");

        if (!content) return;

        const isOpen = !content.classList.contains("hidden");

        // Fechar todas as outras FAQs
        document.querySelectorAll(".faq-content").forEach((faq) => {
          if (faq !== content) {
            faq.classList.add("hidden");
            faq.style.maxHeight = "0px";
          }
        });

        document.querySelectorAll(".faq-button i").forEach((i) => {
          if (i !== icon) {
            i.style.transform = "rotate(0deg)";
          }
        });

        // Toggle da FAQ atual
        if (isOpen) {
          content.classList.add("hidden");
          content.style.maxHeight = "0px";
          icon.style.transform = "rotate(0deg)";
        } else {
          content.classList.remove("hidden");
          content.style.maxHeight = content.scrollHeight + "px";
          icon.style.transform = "rotate(180deg)";

          // Analytics tracking
          if (typeof gtag !== "undefined") {
            gtag("event", "faq_open", {
              faq_question: button.querySelector("h3").textContent,
            });
          }
        }
      });
    });
  },
};

// Calculadora de Rentabilidade
const ProfitabilityCalculator = {
  init() {
    this.studentCountSlider = document.getElementById("student-count");
    this.studentDisplay = document.getElementById("student-display");
    this.partnershipType = document.getElementById("partnership-type");
    this.ticketPrice = document.getElementById("ticket-price");

    this.grossRevenue = document.getElementById("gross-revenue");
    this.commission = document.getElementById("commission");
    this.operationalCosts = document.getElementById("operational-costs");
    this.netProfit = document.getElementById("net-profit");
    this.annualProfit = document.getElementById("annual-profit");

    if (!this.studentCountSlider) return;

    this.setupEventListeners();
    this.calculate(); // Cálculo inicial
  },

  setupEventListeners() {
    this.studentCountSlider.addEventListener("input", () => {
      this.updateStudentDisplay();
      this.calculate();
    });

    this.partnershipType.addEventListener("change", () => {
      this.updateStudentRange();
      this.calculate();
    });

    this.ticketPrice.addEventListener("change", () => {
      this.calculate();
    });
  },

  updateStudentDisplay() {
    const value = this.studentCountSlider.value;
    this.studentDisplay.textContent = value;
  },

  updateStudentRange() {
    const type = this.partnershipType.value;
    let min, max, defaultValue;

    switch (type) {
      case "small":
        min = 20;
        max = 50;
        defaultValue = 35;
        break;
      case "medium":
        min = 50;
        max = 150;
        defaultValue = 100;
        break;
      case "large":
        min = 150;
        max = 300;
        defaultValue = 200;
        break;
      default:
        min = 20;
        max = 300;
        defaultValue = 50;
    }

    this.studentCountSlider.min = min;
    this.studentCountSlider.max = max;
    this.studentCountSlider.value = defaultValue;
    this.updateStudentDisplay();
  },

  calculate() {
    const studentCount = parseInt(this.studentCountSlider.value);
    const ticketValue = parseInt(this.ticketPrice.value);

    // Cálculos
    const grossRevenue = studentCount * ticketValue;
    const commissionRate = 0.4; // 40% de comissão
    const commission = grossRevenue * commissionRate;

    // Custos operacionais baseados no número de alunos
    let operationalCosts;
    if (studentCount <= 50) {
      operationalCosts = Math.max(500, studentCount * 15);
    } else if (studentCount <= 150) {
      operationalCosts = Math.max(1000, studentCount * 12);
    } else {
      operationalCosts = Math.max(1500, studentCount * 10);
    }

    const netProfit = commission - operationalCosts;
    const annualProfit = netProfit * 12;

    // Atualizar display
    this.grossRevenue.textContent = `R$ ${grossRevenue.toLocaleString(
      "pt-BR"
    )}`;
    this.commission.textContent = `R$ ${commission.toLocaleString("pt-BR")}`;
    this.operationalCosts.textContent = `R$ ${operationalCosts.toLocaleString(
      "pt-BR"
    )}`;
    this.netProfit.textContent = `R$ ${netProfit.toLocaleString("pt-BR")}`;
    this.annualProfit.textContent = `R$ ${annualProfit.toLocaleString(
      "pt-BR"
    )}`;

    // Analytics tracking
    if (typeof gtag !== "undefined") {
      gtag("event", "calculator_use", {
        student_count: studentCount,
        ticket_value: ticketValue,
        net_profit: netProfit,
      });
    }
  },
};

// Gerenciamento do Formulário
const FormManager = {
  init() {
    this.form = document.getElementById("partnership-form");
    if (!this.form) return;

    this.setupFormValidation();
    this.setupFormSubmission();
    this.setupPhoneFormatting();
  },

  setupFormValidation() {
    const inputs = this.form.querySelectorAll(
      "input[required], select[required]"
    );

    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener("input", () => this.clearFieldError(input));
    });
  },

  setupFormSubmission() {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (AppState.isFormSubmitting) return;

      if (this.validateForm()) {
        await this.submitForm();
      }
    });
  },

  setupPhoneFormatting() {
    const phoneInput = document.getElementById("phone");
    if (phoneInput) {
      phoneInput.addEventListener("input", (e) => {
        e.target.value = Utils.formatPhone(e.target.value);
      });
    }
  },

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = "";

    // Remover erro anterior
    this.clearFieldError(field);

    // Validações específicas
    if (field.hasAttribute("required") && !value) {
      isValid = false;
      errorMessage = "Este campo é obrigatório";
    } else if (field.type === "email" && value && !Utils.isValidEmail(value)) {
      isValid = false;
      errorMessage = "Digite um e-mail válido";
    } else if (field.type === "tel" && value && value.length < 14) {
      isValid = false;
      errorMessage = "Digite um telefone válido";
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    }

    return isValid;
  },

  validateForm() {
    const inputs = this.form.querySelectorAll(
      "input[required], select[required]"
    );
    let isValid = true;

    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    // Validação dos termos
    const termsCheckbox = document.getElementById("terms");
    if (!termsCheckbox.checked) {
      this.showFieldError(
        termsCheckbox,
        "Você deve aceitar os termos e condições"
      );
      isValid = false;
    }

    return isValid;
  },

  showFieldError(field, message) {
    field.classList.add("border-red-500", "bg-red-50");

    // Remover mensagem de erro anterior
    const existingError = field.parentNode.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    // Adicionar nova mensagem de erro
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message text-red-500 text-sm mt-1";
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
  },

  clearFieldError(field) {
    field.classList.remove("border-red-500", "bg-red-50");
    const errorMessage = field.parentNode.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.remove();
    }
  },

  async submitForm() {
    AppState.isFormSubmitting = true;
    const submitButton = this.form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;

    // Atualizar botão para estado de loading
    submitButton.innerHTML =
      '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
    submitButton.disabled = true;

    try {
      // Coletar dados do formulário
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData);

      // Adicionar dados extras
      data.timestamp = new Date().toISOString();
      data.source = "landing-page-parceria";
      data.user_agent = navigator.userAgent;

      // Simular envio (substitua pela sua API real)
      const response = await this.sendFormData(data);

      if (response.success) {
        this.showSuccessMessage();
        this.form.reset();

        // Analytics tracking
        if (typeof gtag !== "undefined") {
          gtag("event", "form_submit", {
            form_name: "partnership_form",
            partnership_type: data["partnership-interest"],
          });
        }
      } else {
        throw new Error(response.message || "Erro ao enviar formulário");
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      this.showErrorMessage(error.message);
    } finally {
      // Restaurar botão
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
      AppState.isFormSubmitting = false;
    }
  },

  async sendFormData(data) {
    // Simular envio para API (substitua pela sua implementação real)
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular sucesso (90% das vezes)
        if (Math.random() > 0.1) {
          resolve({
            success: true,
            message: "Formulário enviado com sucesso!",
          });
        } else {
          resolve({
            success: false,
            message: "Erro temporário. Tente novamente.",
          });
        }
      }, 2000);
    });

    // Implementação real seria algo como:
    /*
        const response = await fetch(CONFIG.FORM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return await response.json();
        */
  },

  showSuccessMessage() {
    const message = document.createElement("div");
    message.className =
      "fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in";
    message.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-3 text-xl"></i>
                <div>
                    <div class="font-semibold">Formulário enviado com sucesso!</div>
                    <div class="text-sm opacity-90">Nossa equipe entrará em contato em até 24 horas.</div>
                </div>
            </div>
        `;

    document.body.appendChild(message);

    setTimeout(() => {
      message.remove();
    }, 5000);

    // Redirecionar para seção de agradecimento ou WhatsApp
    setTimeout(() => {
      window.open(
        "https://wa.me/5531999998888?text=Olá! Acabei de preencher o formulário de parceria no site. Gostaria de mais informações.",
        "_blank"
      );
    }, 2000);
  },

  showErrorMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className =
      "fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in";
    errorDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle mr-3 text-xl"></i>
                <div>
                    <div class="font-semibold">Erro ao enviar formulário</div>
                    <div class="text-sm opacity-90">${message}</div>
                </div>
            </div>
        `;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  },
};

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
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
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
      LoadingManager.init();
      ScrollManager.init();
      TestimonialCarousel.init();
      FAQManager.init();
      ProfitabilityCalculator.init();
      FormManager.init();
      AnalyticsManager.init();
      PerformanceMonitor.init();

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
  Utils,
  ScrollManager,
  TestimonialCarousel,
  FAQManager,
  ProfitabilityCalculator,
  FormManager,
};
