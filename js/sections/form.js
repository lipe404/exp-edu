// Gerenciamento do Formulário - Seção Formulário de Parceria
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
      // Validar antes de enviar
      if (!this.validateForm()) {
        e.preventDefault();
        return;
      }

      // Se chegou até aqui, o form é válido
      if (AppState.isFormSubmitting) {
        e.preventDefault();
        return;
      }

      // Marcar como enviando
      AppState.isFormSubmitting = true;
      this.updateSubmitButton(true);

      // Adicionar dados extras antes do envio
      this.addHiddenFields();

      // Analytics tracking
      if (typeof gtag !== "undefined") {
        gtag("event", "form_submit", {
          form_name: "partnership_form",
          partnership_type: document.getElementById("partnership-interest")
            .value,
        });
      }

      // Mostrar feedback visual
      this.showSubmittingFeedback();

      // O Netlify Forms vai processar o envio automaticamente
      // Não precisamos prevenir o comportamento padrão se tudo estiver válido
    });
  },

  addHiddenFields() {
    // Adicionar timestamp
    this.addOrUpdateHiddenField("timestamp", new Date().toISOString());

    // Adicionar user agent
    this.addOrUpdateHiddenField("user_agent", navigator.userAgent);

    // Adicionar URL da página
    this.addOrUpdateHiddenField("page_url", window.location.href);

    // Adicionar informações de referrer
    this.addOrUpdateHiddenField(
      "referrer",
      document.referrer || "Acesso direto"
    );

    // Adicionar resolução da tela
    this.addOrUpdateHiddenField(
      "screen_resolution",
      `${screen.width}x${screen.height}`
    );
  },

  addOrUpdateHiddenField(name, value) {
    let field = this.form.querySelector(`input[name="${name}"]`);

    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.name = name;
      this.form.appendChild(field);
    }

    field.value = value;
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

    this.clearFieldError(field);

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

    const existingError = field.parentNode.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

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

  updateSubmitButton(isSubmitting) {
    const submitButton = this.form.querySelector('button[type="submit"]');
    const originalText =
      '<i class="fas fa-paper-plane mr-2"></i>Quero Ser Parceiro da Educa+ Minas!';

    if (isSubmitting) {
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
      submitButton.disabled = true;
    } else {
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    }
  },

  showSubmittingFeedback() {
    const message = document.createElement("div");
    message.className =
      "fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in";
    message.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-paper-plane mr-3 text-xl"></i>
        <div>
          <div class="font-semibold">Enviando formulário...</div>
          <div class="text-sm opacity-90">Aguarde um momento.</div>
        </div>
      </div>
    `;

    document.body.appendChild(message);

    // Remover após 3 segundos
    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, 3000);
  },

  // Método para lidar com erros de envio (caso necessário)
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
