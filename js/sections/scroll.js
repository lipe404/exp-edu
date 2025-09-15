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
