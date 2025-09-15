// Gerenciamento do Carrossel de Depoimentos - Seção Depoimentos
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
