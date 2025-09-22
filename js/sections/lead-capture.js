// Gerenciamento do Formulário - Leads de Captura via Botões Flutuantes

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
        e.preventDefault();
        this.openModal(e.target.closest("button"));
      });

    document
      .getElementById("openPodcastModal")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
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

    // Event listener do formulário - CORRIGIDO
    this.form?.addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleSubmit(e);
    });

    // Formatação automática do WhatsApp
    const whatsappInput = document.getElementById("whatsapp");
    whatsappInput?.addEventListener("input", (e) => {
      this.formatWhatsApp(e);
    });

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

    // Limpar formulário antes de abrir
    this.resetForm();

    // Foco no primeiro campo
    setTimeout(() => {
      const emailInput = document.getElementById("email");
      if (emailInput) {
        emailInput.focus();
        emailInput.value = ""; // Garantir que está limpo
      }
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
      modalTitle.textContent = "Baixar Guia Completo";
      modalSubtitle.textContent =
        "Descubra tudo sobre nossa parceria em um material exclusivo";
      submitText.textContent = "BAIXAR GUIA GRÁTIS";
    } else if (type === "podcast") {
      modalIcon.className =
        "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br from-purple-500 to-purple-600";
      modalIcon.innerHTML = '<i class="fas fa-podcast text-white"></i>';
      modalTitle.textContent = "Ouvir Podcast";
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
    e.stopPropagation();

    console.log("=== INÍCIO DA VALIDAÇÃO ===");

    // CAPTURAR VALORES DIRETAMENTE DOS INPUTS
    const emailInput = document.getElementById("email");
    const whatsappInput = document.getElementById("whatsapp");
    const consentInput = document.getElementById("consent");

    if (!emailInput || !whatsappInput || !consentInput) {
      console.error("Inputs não encontrados!");
      return;
    }

    const email = emailInput.value.trim();
    const whatsapp = whatsappInput.value.trim();
    const consent = consentInput.checked;

    console.log("Valores capturados:", { email, whatsapp, consent });

    // Validar formulário
    if (!this.validateFormData(email, whatsapp, consent)) {
      console.log("Validação falhou!");
      return;
    }

    console.log("Validação passou! Processando...");

    const submitBtn = document.getElementById("submitBtn");
    const submitText = document.getElementById("submitText");
    const submitLoader = document.getElementById("submitLoader");

    // Estado de loading
    submitBtn.disabled = true;
    submitText.textContent = "PROCESSANDO...";
    submitLoader.classList.remove("hidden");

    try {
      // Dados do lead
      const leadData = {
        email: email,
        whatsapp: whatsapp,
        content_type: this.currentType,
        file_url: this.currentFileUrl,
        timestamp: new Date().toISOString(),
        source: "floating_buttons",
      };

      console.log("Enviando lead:", leadData);

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

  // NOVA FUNÇÃO DE VALIDAÇÃO
  validateFormData(email, whatsapp, consent) {
    let isValid = true;

    console.log("Validando dados:", { email, whatsapp, consent });

    // Validar e-mail
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email) {
      this.showFieldError("email", "E-mail é obrigatório");
      isValid = false;
      console.log("Email vazio");
    } else if (!emailRegex.test(email)) {
      this.showFieldError("email", "Formato de e-mail inválido");
      isValid = false;
      console.log("Email inválido:", email);
    } else {
      this.hideFieldError("email");
      console.log("Email válido:", email);
    }

    // Validar WhatsApp
    const cleanWhatsapp = whatsapp.replace(/\D/g, "");
    if (!whatsapp) {
      this.showFieldError("whatsapp", "WhatsApp é obrigatório");
      isValid = false;
      console.log("WhatsApp vazio");
    } else if (cleanWhatsapp.length < 10 || cleanWhatsapp.length > 11) {
      this.showFieldError("whatsapp", "WhatsApp deve ter 10 ou 11 dígitos");
      isValid = false;
      console.log(
        "WhatsApp inválido:",
        whatsapp,
        "Dígitos:",
        cleanWhatsapp.length
      );
    } else {
      this.hideFieldError("whatsapp");
      console.log("WhatsApp válido:", whatsapp);
    }

    // Validar consentimento
    if (!consent) {
      this.showError("Você deve concordar com nossa política de privacidade");
      isValid = false;
      console.log("Consentimento não marcado");
    }

    console.log("Resultado da validação:", isValid);
    return isValid;
  }

  async submitLead(leadData) {
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

  showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const error = document.getElementById(fieldName + "Error");

    console.log("Mostrando erro para:", fieldName, message);

    if (field) {
      field.classList.add("border-red-500", "focus:ring-red-500");
      field.classList.remove("border-gray-600");
    }

    if (error) {
      error.textContent = message;
      error.classList.remove("hidden");
    }
  }

  hideFieldError(fieldName) {
    const field = document.getElementById(fieldName);
    const error = document.getElementById(fieldName + "Error");

    if (field) {
      field.classList.remove("border-red-500", "focus:ring-red-500");
      field.classList.add("border-gray-600");
    }

    if (error) {
      error.classList.add("hidden");
    }
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
      if (value.length <= 2) {
        value = value.replace(/(\d{0,2})/, "($1");
      } else if (value.length <= 6) {
        value = value.replace(/(\d{2})(\d{0,4})/, "($1) $2");
      } else if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
      } else {
        value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
      }
    }

    e.target.value = value;
  }

  showError(message) {
    // Toast simples
    const toast = document.createElement("div");
    toast.className =
      "fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-[10000]";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  resetForm() {
    // Limpar formulário manualmente
    const emailInput = document.getElementById("email");
    const whatsappInput = document.getElementById("whatsapp");
    const consentInput = document.getElementById("consent");

    if (emailInput) emailInput.value = "";
    if (whatsappInput) whatsappInput.value = "";
    if (consentInput) consentInput.checked = false;

    // Mostrar formulário e esconder sucesso
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
      console.log("Lead salvo localmente:", leadData);
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
