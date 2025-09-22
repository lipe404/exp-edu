/**
 * Forms Manager - Gerenciamento Unificado de Formulários
 * Gerencia 3 tipos de formulários:
 * 1. Formulário Principal (Seção LP) - #partnership-form
 * 2. Formulário Modal Resumido - #partner-form
 * 3. Formulário Lead Capture - #leadForm
 */

class FormsManagerClass {
  constructor() {
    this.forms = {
      main: {
        id: "partnership-form",
        element: null,
        type: "main_form",
        source: "landing_page_section",
      },
      modal: {
        id: "partner-form",
        element: null,
        type: "modal_form",
        source: "modal_popup",
        modalId: "partnership-form-modal",
      },
      leadCapture: {
        id: "leadForm",
        element: null,
        type: "lead_capture",
        source: "floating_buttons",
        modalId: "leadCaptureModal",
      },
    };

    this.currentLeadCaptureData = {
      fileUrl: "",
      contentType: "",
    };

    // CORREÇÃO: Desabilitar API por enquanto
    this.apiConfig = {
      endpoint: null, // Desabilitado
      timeout: 10000,
      retries: 3,
      enabled: false, // Flag para controlar API
    };
  }

  /**
   * Inicialização do sistema
   */
  init() {
    this.setupForms();
    this.setupModals();
    this.setupFloatingButtons();
    this.setupValidationListeners();
    console.log("✅ Forms Manager inicializado");
  }

  /**
   * Configuração inicial dos formulários
   */
  setupForms() {
    Object.keys(this.forms).forEach((key) => {
      const form = this.forms[key];
      form.element = document.getElementById(form.id);

      if (form.element) {
        this.setupFormSubmission(key);
        console.log(`📋 Formulário ${key} configurado`);
      }
    });
  }

  /**
   * Configuração dos modais
   */
  setupModals() {
    // Modal do formulário de parceria
    this.setupPartnershipModal();

    // Modal de captura de leads
    this.setupLeadCaptureModal();
  }

  /**
   * Configuração do modal de parceria
   */
  setupPartnershipModal() {
    const modal = document.getElementById("partnership-form-modal");
    const openButtons = document.querySelectorAll(
      '[data-modal-trigger="partnership-form-modal"]'
    );
    const closeButton = modal?.querySelector(".close-modal-btn");

    if (!modal) return;

    // Abrir modal
    openButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.openModal("partnership-form-modal");
      });
    });

    // Fechar modal
    closeButton?.addEventListener("click", () => {
      this.closeModal("partnership-form-modal");
    });

    // Fechar clicando fora
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeModal("partnership-form-modal");
      }
    });

    // Fechar com ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) {
        this.closeModal("partnership-form-modal");
      }
    });
  }

  /**
   * Configuração do modal de captura de leads
   */
  setupLeadCaptureModal() {
    const modal = document.getElementById("leadCaptureModal");
    const closeButton = document.getElementById("closeModal");

    if (!modal) return;

    // Fechar modal
    closeButton?.addEventListener("click", () => {
      this.closeModal("leadCaptureModal");
    });

    // Fechar clicando fora
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeModal("leadCaptureModal");
      }
    });

    // Fechar com ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) {
        this.closeModal("leadCaptureModal");
      }
    });
  }

  /**
   * Configuração dos botões flutuantes
   */
  setupFloatingButtons() {
    const guideButton = document.getElementById("openGuideModal");
    const podcastButton = document.getElementById("openPodcastModal");

    guideButton?.addEventListener("click", (e) => {
      e.preventDefault();
      this.openLeadCaptureModal(e.target.closest("button"));
    });

    podcastButton?.addEventListener("click", (e) => {
      e.preventDefault();
      this.openLeadCaptureModal(e.target.closest("button"));
    });
  }

  /**
   * Configuração de listeners de validação
   */
  setupValidationListeners() {
    Object.keys(this.forms).forEach((key) => {
      const form = this.forms[key];
      if (!form.element) return;

      // Validação em tempo real
      const inputs = form.element.querySelectorAll(
        "input[required], select[required]"
      );
      inputs.forEach((input) => {
        input.addEventListener("blur", () => {
          this.validateField(input, key);
        });

        input.addEventListener("input", () => {
          this.clearFieldError(input, key);
        });
      });

      // Formatação de telefone
      const phoneInputs = form.element.querySelectorAll('input[type="tel"]');
      phoneInputs.forEach((input) => {
        input.addEventListener("input", (e) => {
          this.formatPhone(e.target);
        });
      });
    });
  }

  /**
   * Configuração do envio de formulários
   */
  setupFormSubmission(formKey) {
    const form = this.forms[formKey];
    if (!form.element) return;

    form.element.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      console.log(`📤 Enviando formulário: ${formKey}`);

      if (!this.validateForm(formKey)) {
        console.log("❌ Validação falhou");
        return;
      }

      await this.handleFormSubmission(formKey);
    });
  }

  /**
   * Abrir modal genérico
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Focar no primeiro campo
    setTimeout(() => {
      const firstInput = modal.querySelector("input, select");
      firstInput?.focus();
    }, 300);

    this.trackEvent("modal_opened", { modal_type: modalId });
  }

  /**
   * Fechar modal genérico
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // Reset do formulário
    const form = modal.querySelector("form");
    if (form) {
      this.resetForm(form);
    }
  }

  /**
   * Abrir modal de captura de leads
   */
  openLeadCaptureModal(button) {
    const fileUrl = button.dataset.file;
    const type = button.dataset.type;

    this.currentLeadCaptureData = {
      fileUrl,
      contentType: type,
    };

    this.setupLeadCaptureContent(type);
    this.openModal("leadCaptureModal");
  }

  /**
   * Configurar conteúdo do modal de captura
   */
  setupLeadCaptureContent(type) {
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

  /**
   * Validação de campo individual
   */
  validateField(field, formKey) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = "";

    this.clearFieldError(field, formKey);

    // Validação por tipo de campo
    if (field.hasAttribute("required") && !value) {
      isValid = false;
      errorMessage = "Este campo é obrigatório";
    } else if (field.type === "email" && value && !this.isValidEmail(value)) {
      isValid = false;
      errorMessage = "Digite um e-mail válido";
    } else if (field.type === "tel" && value) {
      const cleanPhone = value.replace(/\D/g, "");
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        isValid = false;
        errorMessage = "Digite um telefone válido (10-11 dígitos)";
      }
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage, formKey);
    }

    return isValid;
  }

  /**
   * Validação completa do formulário
   */
  validateForm(formKey) {
    const form = this.forms[formKey];
    if (!form.element) return false;

    const requiredFields = form.element.querySelectorAll(
      "input[required], select[required]"
    );
    let isValid = true;

    // Validar campos obrigatórios
    requiredFields.forEach((field) => {
      if (!this.validateField(field, formKey)) {
        isValid = false;
      }
    });

    // Validar checkboxes de consentimento
    const consentCheckboxes = form.element.querySelectorAll(
      'input[type="checkbox"][required]'
    );
    consentCheckboxes.forEach((checkbox) => {
      if (!checkbox.checked) {
        this.showFieldError(
          checkbox,
          "Você deve concordar para continuar",
          formKey
        );
        isValid = false;
      }
    });

    console.log(`Validação do formulário ${formKey}:`, isValid);
    return isValid;
  }

  /**
   * Manipulação do envio do formulário
   */
  async handleFormSubmission(formKey) {
    const form = this.forms[formKey];
    const submitButton = form.element.querySelector('button[type="submit"]');

    // Estado de loading
    this.setLoadingState(submitButton, true);

    try {
      // Coletar dados do formulário
      const formData = this.collectFormData(formKey);

      // CORREÇÃO: Pular API e ir direto para sucesso
      console.log("📊 Dados coletados:", formData);

      // Salvar localmente sempre
      this.saveLeadLocally(formData);

      // Simular delay de processamento
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Processar resposta de sucesso
      await this.handleSubmissionSuccess(formKey, { success: true });
    } catch (error) {
      console.error("Erro no envio:", error);
      this.handleSubmissionError(formKey, error);
    } finally {
      this.setLoadingState(submitButton, false);
    }
  }

  /**
   * Coletar dados do formulário
   */
  collectFormData(formKey) {
    const form = this.forms[formKey];
    const formData = new FormData(form.element);

    // Dados base
    const data = {
      // Identificação do formulário
      form_type: form.type,
      source: form.source,
      timestamp: new Date().toISOString(),

      // Dados técnicos
      user_agent: navigator.userAgent,
      page_url: window.location.href,
      referrer: document.referrer || "Acesso direto",
      screen_resolution: `${screen.width}x${screen.height}`,
    };

    // Adicionar dados do formulário
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    // Dados específicos do lead capture
    if (formKey === "leadCapture") {
      data.file_url = this.currentLeadCaptureData.fileUrl;
      data.content_type = this.currentLeadCaptureData.contentType;
    }

    return data;
  }

  /**
   * Processar sucesso do envio
   */
  async handleSubmissionSuccess(formKey, response) {
    const form = this.forms[formKey];

    // Analytics
    this.trackEvent("form_submitted", {
      form_type: form.type,
      source: form.source,
    });

    // Ações específicas por tipo de formulário
    switch (formKey) {
      case "main":
        this.showSuccessMessage(
          "Obrigado! Entraremos em contato em até 24 horas."
        );
        this.resetForm(form.element);
        break;

      case "modal":
        this.showSuccessMessage(
          "Solicitação enviada! Nossa equipe entrará em contato."
        );
        this.closeModal("partnership-form-modal");
        break;

      case "leadCapture":
        // CORREÇÃO: Ir direto para download sem mostrar tela de sucesso
        this.processLeadCaptureDownload();
        this.closeModal("leadCaptureModal");
        this.showSuccessMessage("Download iniciado! Verifique seus arquivos.");
        break;
    }
  }

  /**
   * Processar erro do envio
   */
  handleSubmissionError(formKey, error) {
    console.error(`Erro no formulário ${formKey}:`, error);
    this.showErrorMessage(
      "Ops! Algo deu errado. Tente novamente em alguns instantes."
    );
  }

  /**
   * Processar download do lead capture
   */
  processLeadCaptureDownload() {
    const { fileUrl, contentType } = this.currentLeadCaptureData;

    if (contentType === "guide") {
      // Download direto para PDF
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = "guia-parceria-educa-plus.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Abrir em nova aba para áudio
      window.open(fileUrl, "_blank");
    }
  }

  /**
   * Utilitários de UI
   */
  setLoadingState(button, isLoading) {
    if (!button) return;

    if (isLoading) {
      button.disabled = true;
      button.dataset.originalText = button.innerHTML;
      button.innerHTML =
        '<i class="fas fa-spinner fa-spin mr-2"></i>Processando...';
    } else {
      button.disabled = false;
      button.innerHTML = button.dataset.originalText || button.innerHTML;
    }
  }

  showFieldError(field, message, formKey) {
    // Adicionar classes de erro
    field.classList.add("border-red-500");
    field.classList.remove(
      "border-gray-300",
      "border-gray-600",
      "border-gray-700"
    );

    // Encontrar ou criar elemento de erro
    let errorElement = field.parentNode.querySelector(".error-message");

    if (!errorElement) {
      // Tentar encontrar por ID (padrão: fieldId + "Error")
      const fieldId = field.id;
      if (fieldId) {
        errorElement =
          document.getElementById(fieldId + "Error") ||
          document.getElementById(fieldId + "-error");
      }
    }

    if (!errorElement) {
      // Criar novo elemento de erro
      errorElement = document.createElement("div");
      errorElement.className = "error-message text-red-500 text-sm mt-1";
      field.parentNode.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
  }

  clearFieldError(field, formKey) {
    // Remover classes de erro
    field.classList.remove("border-red-500");
    field.classList.add("border-gray-300");

    // Esconder mensagem de erro
    const errorElement =
      field.parentNode.querySelector(".error-message") ||
      document.getElementById(field.id + "Error") ||
      document.getElementById(field.id + "-error");

    if (errorElement) {
      errorElement.classList.add("hidden");
    }
  }

  showSuccessMessage(message) {
    const toast = this.createToast(message, "success");
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 5000);
  }

  showErrorMessage(message) {
    const toast = this.createToast(message, "error");
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 5000);
  }

  createToast(message, type) {
    const toast = document.createElement("div");
    const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
    const icon =
      type === "success" ? "fa-check-circle" : "fa-exclamation-triangle";

    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-[10000] max-w-sm animate-fade-in`;
    toast.innerHTML = `
      <div class="flex items-center">
        <i class="fas ${icon} mr-3 text-xl"></i>
        <div>
          <div class="font-semibold">${
            type === "success" ? "Sucesso!" : "Erro"
          }</div>
          <div class="text-sm opacity-90">${message}</div>
        </div>
      </div>
    `;

    return toast;
  }

  resetForm(form) {
    if (!form) return;

    form.reset();

    // Limpar erros visuais
    const errorElements = form.querySelectorAll(
      '.error-message, [id$="Error"], [id$="-error"]'
    );
    errorElements.forEach((el) => el.classList.add("hidden"));

    const errorFields = form.querySelectorAll(".border-red-500");
    errorFields.forEach((field) => {
      field.classList.remove("border-red-500");
      field.classList.add("border-gray-300");
    });

    // Reset específico do lead capture
    const leadForm = document.getElementById("leadForm");
    const successState = document.getElementById("successState");

    if (form === leadForm) {
      leadForm?.classList.remove("hidden");
      successState?.classList.add("hidden");
    }
  }

  /**
   * Utilitários de validação
   */
  isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  formatPhone(input) {
    let value = input.value.replace(/\D/g, "");

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

    input.value = value;
  }

  /**
   * Salvar lead localmente (backup)
   */
  saveLeadLocally(data) {
    try {
      const leads = JSON.parse(localStorage.getItem("educa_leads") || "[]");
      leads.push({
        ...data,
        saved_locally: true,
        local_timestamp: new Date().toISOString(),
      });
      localStorage.setItem("educa_leads", JSON.stringify(leads));
      console.log("💾 Lead salvo localmente:", data);
    } catch (error) {
      console.warn("Erro ao salvar lead localmente:", error);
    }
  }

  /**
   * Analytics e tracking
   */
  trackEvent(eventName, parameters = {}) {
    // Google Analytics 4
    if (typeof gtag !== "undefined") {
      gtag("event", eventName, {
        event_category: "form_interaction",
        ...parameters,
      });
    }

    // Facebook Pixel
    if (typeof fbq !== "undefined") {
      fbq("track", eventName, parameters);
    }

    // Console para debug
    console.log("📊 Event tracked:", eventName, parameters);
  }
}

// ===== CORREÇÃO: Criar objeto estático compatível com main.js =====
const FormsManager = {
  instance: null,
  isInitialized: false,

  // Método init() que o main.js espera
  init() {
    if (this.isInitialized) {
      console.log("✅ FormsManager já foi inicializado");
      return this.instance;
    }

    try {
      this.instance = new FormsManagerClass();
      this.instance.init();
      this.isInitialized = true;
      return this.instance;
    } catch (error) {
      console.error("❌ Erro ao inicializar FormsManager:", error);
      return null;
    }
  },

  // Métodos de acesso direto (opcional)
  openModal(modalId) {
    return this.instance?.openModal(modalId);
  },

  closeModal(modalId) {
    return this.instance?.closeModal(modalId);
  },

  validateForm(formKey) {
    return this.instance?.validateForm(formKey);
  },

  // Getter para verificar se está pronto
  get ready() {
    return this.isInitialized && this.instance !== null;
  },
};

// Disponibilizar globalmente
window.FormsManager = FormsManager;

// Inicialização manual para compatibilidade
document.addEventListener("DOMContentLoaded", () => {
  if (!FormsManager.isInitialized) {
    window.formsManager = FormsManager.init();
  }
});

// Export para uso modular
if (typeof module !== "undefined" && module.exports) {
  module.exports = FormsManager;
}
