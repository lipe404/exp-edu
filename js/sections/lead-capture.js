// lead-capture.js - Sistema de Captura de Leads Educa+

class LeadCapture {
  constructor() {
    this.modal = document.getElementById("leadCaptureModal");
    this.form = document.getElementById("leadForm");
    this.currentFileUrl = "";
    this.currentType = "";

    this.init();
  }

  init() {
    // Event listeners para botões flutuantes
    document
      .getElementById("openGuideModal")
      ?.addEventListener("click", (e) => {
        this.openModal(e.target.closest("button"));
      });

    document
      .getElementById("openPodcastModal")
      ?.addEventListener("click", (e) => {
        this.openModal(e.target.closest("button"));
      });

    // Event listeners do modal
    document.getElementById("closeModal")?.addEventListener("click", () => {
      this.closeModal();
    });

    // Fechar modal clicando fora
    this.modal?.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Event listener do formulário
    this.form?.addEventListener("submit", (e) => {
      this.handleSubmit(e);
    });

    // Formatação automática do WhatsApp
    const whatsappInput = document.getElementById("whatsapp");
    whatsappInput?.addEventListener("input", this.formatWhatsApp);

    // Fechar modal com ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.modal.classList.contains("hidden")) {
        this.closeModal();
      }
    });
  }

  openModal(button) {
    const fileUrl = button.dataset.file;
    const type = button.dataset.type;

    this.currentFileUrl = fileUrl;
    this.currentType = type;

    // Configurar conteúdo do modal baseado no tipo
    this.setupModalContent(type);

    // Mostrar modal
    this.modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    // Foco no primeiro campo
    setTimeout(() => {
      document.getElementById("email")?.focus();
    }, 300);

    // Analytics
    this.trackEvent("modal_opened", { content_type: type });
  }

  setupModalContent(type) {
    const modalIcon = document.getElementById("modalIcon");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const submitText = document.getElementById("submitText");

    if (type === "guide") {
      modalIcon.className =
        "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br from-blue-500 to-blue-600";
      modalIcon.innerHTML = '<i class="fas fa-file-pdf text-white"></i>';
      modalTitle.textContent = "📋 Baixar Guia Completo";
      modalSubtitle.textContent =
        "Descubra tudo sobre nossa parceria em um material exclusivo";
      submitText.textContent = "BAIXAR GUIA GRÁTIS";
    } else if (type === "podcast") {
      modalIcon.className =
        "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br from-purple-500 to-purple-600";
      modalIcon.innerHTML = '<i class="fas fa-podcast text-white"></i>';
      modalTitle.textContent = "🎧 Ouvir Podcast";
      modalSubtitle.textContent = "Conheça nossa proposta de parceria em áudio";
      submitText.textContent = "OUVIR PODCAST";
    }
  }

  closeModal() {
    this.modal.classList.add("hidden");
    document.body.style.overflow = "";
    this.resetForm();
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Validar formulário
    if (!this.validateForm()) {
      return;
    }

    const submitBtn = document.getElementById("submitBtn");
    const submitText = document.getElementById("submitText");
    const submitLoader = document.getElementById("submitLoader");

    // Estado de loading
    submitBtn.disabled = true;
    submitText.textContent = "PROCESSANDO...";
    submitLoader.classList.remove("hidden");

    try {
      // Coletar dados
      const formData = new FormData(this.form);
      const leadData = {
        email: formData.get("email"),
        whatsapp: formData.get("whatsapp"),
        content_type: this.currentType,
        file_url: this.currentFileUrl,
        timestamp: new Date().toISOString(),
        source: "floating_buttons",
      };

      // Simular envio (substituir por sua API)
      await this.submitLead(leadData);

      // Mostrar sucesso
      this.showSuccessState();

      // Aguardar e redirecionar
      setTimeout(() => {
        this.redirectToContent();
      }, 2000);
    } catch (error) {
      console.error("Erro ao enviar lead:", error);
      this.showError("Ops! Algo deu errado. Tente novamente.");
    } finally {
      // Restaurar botão
      submitBtn.disabled = false;
      submitText.textContent =
        this.currentType === "guide" ? "BAIXAR GUIA GRÁTIS" : "OUVIR PODCAST";
      submitLoader.classList.add("hidden");
    }
  }

  async submitLead(leadData) {
    // Implementar integração com sua API/CRM aqui
    // Exemplo com diferentes opções:

    // Opção 1: Netlify Forms
    if (window.netlify) {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "lead-capture",
          ...leadData,
        }).toString(),
      });

      if (!response.ok) throw new Error("Erro no envio");
    }

    // Opção 2: Google Sheets via Apps Script
    // const response = await fetch('SUA_URL_GOOGLE_APPS_SCRIPT', {
    //     method: 'POST',
    //     body: JSON.stringify(leadData)
    // });

    // Opção 3: RD Station, HubSpot, etc.
    // const response = await fetch('SUA_WEBHOOK_URL', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(leadData)
    // });

    // Salvar no localStorage para backup
    this.saveLeadLocally(leadData);

    // Analytics
    this.trackEvent("lead_captured", {
      content_type: this.currentType,
      email_domain: leadData.email.split("@")[1],
    });

    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  validateForm() {
    const email = document.getElementById("email").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const consent = document.getElementById("consent").checked;

    let isValid = true;

    // Validar e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      this.showFieldError("email", "Por favor, insira um e-mail válido");
      isValid = false;
    } else {
      this.hideFieldError("email");
    }

    // Validar WhatsApp
    const cleanWhatsapp = whatsapp.replace(/\D/g, "");
    if (!whatsapp || cleanWhatsapp.length < 10) {
      this.showFieldError("whatsapp", "Por favor, insira um WhatsApp válido");
      isValid = false;
    } else {
      this.hideFieldError("whatsapp");
    }

    // Validar consentimento
    if (!consent) {
      this.showError("Você deve concordar com nossa política de privacidade");
      isValid = false;
    }

    return isValid;
  }

  showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const error = document.getElementById(fieldName + "Error");

    field?.classList.add("border-red-500", "focus:ring-red-500");
    if (error) {
      error.textContent = message;
      error.classList.remove("hidden");
    }
  }

  hideFieldError(fieldName) {
    const field = document.getElementById(fieldName);
    const error = document.getElementById(fieldName + "Error");

    field?.classList.remove("border-red-500", "focus:ring-red-500");
    error?.classList.add("hidden");
  }

  showSuccessState() {
    const form = document.getElementById("leadForm");
    const successState = document.getElementById("successState");
    const redirectMessage = document.getElementById("redirectMessage");

    form.classList.add("hidden");
    successState.classList.remove("hidden");

    const message =
      this.currentType === "guide"
        ? "Redirecionando para o download do guia em 2 segundos..."
        : "Redirecionando para o podcast em 2 segundos...";

    redirectMessage.textContent = message;
  }

  redirectToContent() {
    if (this.currentType === "guide") {
      // Para PDFs, forçar download
      const link = document.createElement("a");
      link.href = this.currentFileUrl;
      link.download = "guia-parceria-educa-plus.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Para áudio, abrir em nova aba
      window.open(this.currentFileUrl, "_blank");
    }

    this.closeModal();
  }

  formatWhatsApp(e) {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length <= 11) {
      value = value.replace(/(\d{2})(\d)/, "($1) $2");
      value = value.replace(/(\d{4,5})(\d{4})$/, "$1-$2");
    }

    e.target.value = value;
  }

  showError(message) {
    // Implementar sistema de toast/notificação
    alert(message); // Substituir por toast mais elegante
  }

  resetForm() {
    this.form?.reset();
    const formSection = document.getElementById("leadForm");
    const successState = document.getElementById("successState");

    formSection?.classList.remove("hidden");
    successState?.classList.add("hidden");

    // Limpar erros
    ["email", "whatsapp"].forEach((field) => this.hideFieldError(field));
  }

  saveLeadLocally(leadData) {
    try {
      const leads = JSON.parse(localStorage.getItem("educa_leads") || "[]");
      leads.push(leadData);
      localStorage.setItem("educa_leads", JSON.stringify(leads));
    } catch (error) {
      console.warn("Erro ao salvar lead localmente:", error);
    }
  }

  trackEvent(eventName, parameters = {}) {
    // Google Analytics 4
    if (typeof gtag !== "undefined") {
      gtag("event", eventName, {
        event_category: "lead_generation",
        event_label: this.currentType,
        ...parameters,
      });
    }

    // Facebook Pixel
    if (typeof fbq !== "undefined") {
      fbq("track", eventName, parameters);
    }

    // Console para debug
    console.log("Event tracked:", eventName, parameters);
  }
}

// Inicializar quando DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.leadCapture = new LeadCapture();
});

// Export para uso modular (se necessário)
if (typeof module !== "undefined" && module.exports) {
  module.exports = LeadCapture;
}
