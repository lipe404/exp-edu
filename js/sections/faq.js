// Gerenciamento do FAQ - Seção FAQ
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
