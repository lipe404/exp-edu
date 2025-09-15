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
