// forms_janela.js

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("partnership-form-modal");
  const openModalButtons = document.querySelectorAll("[data-modal-trigger]");
  const closeModalButton = modal.querySelector(".close-modal-btn");
  const partnerForm = document.getElementById("partner-form");

  // Funções para mostrar/esconder o modal
  const openModal = () => {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    // Opcional: focar no primeiro campo de entrada para acessibilidade
    const firstInput = modal.querySelector("input, select");
    if (firstInput) {
      firstInput.focus();
    }
    document.body.style.overflow = "hidden"; // Previne rolagem do body
  };

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // Restaura rolagem do body
    resetFormValidation(); // Limpa mensagens de erro ao fechar
    partnerForm.reset(); // Limpa os campos do formulário
  };

  // Adiciona event listeners para abrir o modal
  openModalButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault(); // Evita que a página role para o topo ou mude de hash
      // Verifica se o data-modal-trigger corresponde ao ID do modal
      if (button.dataset.modalTrigger === "partnership-form-modal") {
        openModal();
      }
    });
  });

  // Adiciona event listener para fechar o modal
  closeModalButton.addEventListener("click", closeModal);

  // Fecha o modal ao clicar fora do conteúdo
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Fecha o modal ao pressionar ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  // --- Lógica de Validação e Envio do Formulário ---

  const showValidationError = (elementId, message) => {
    const errorElement = document.getElementById(`${elementId}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove("hidden");
    }
    document.getElementById(elementId).classList.add("border-red-500"); // Adiciona borda vermelha
  };

  const hideValidationError = (elementId) => {
    const errorElement = document.getElementById(`${elementId}-error`);
    if (errorElement) {
      errorElement.classList.add("hidden");
    }
    document.getElementById(elementId).classList.remove("border-red-500"); // Remove borda vermelha
  };

  const resetFormValidation = () => {
    const errorElements = modal.querySelectorAll('[id$="-error"]'); // Seleciona todos os spans de erro
    errorElements.forEach((el) => el.classList.add("hidden"));

    const inputElements = partnerForm.querySelectorAll("input, select");
    inputElements.forEach((input) => input.classList.remove("border-red-500"));
  };

  partnerForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Impede o envio padrão do formulário

    let isValid = true;
    resetFormValidation(); // Limpa as validações anteriores

    // Validação do Nome
    const nameInput = document.getElementById("name");
    if (nameInput.value.trim() === "") {
      showValidationError("name", "Preencha esse campo obrigatório.");
      isValid = false;
    } else {
      hideValidationError("name");
    }

    // Validação do E-mail
    const emailInput = document.getElementById("email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput.value.trim() === "") {
      showValidationError("email", "Preencha esse campo obrigatório.");
      isValid = false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
      showValidationError("email", "Por favor, insira um e-mail válido.");
      isValid = false;
    } else {
      hideValidationError("email");
    }

    // Validação do Telefone (WhatsApp)
    const phoneInput = document.getElementById("phone");
    // Remova caracteres não numéricos para a validação
    const phoneNumber = phoneInput.value.replace(/\D/g, "");
    if (phoneNumber === "") {
      showValidationError("phone", "Preencha esse campo obrigatório.");
      isValid = false;
    } else if (phoneNumber.length < 10) {
      // Ex: (XX) XXXX-XXXX para min 10 dígitos
      showValidationError(
        "phone",
        "Por favor, insira um número de telefone válido (mín. 10 dígitos)."
      );
      isValid = false;
    } else {
      hideValidationError("phone");
    }

    // Validação do Select de Experiência
    const experienceSelect = document.getElementById("experience");
    if (experienceSelect.value === "") {
      showValidationError("experience", "Selecione uma opção.");
      isValid = false;
    } else {
      hideValidationError("experience");
    }

    // Validação do Checkbox de Consentimento
    const privacyConsentCheckbox = document.getElementById("privacyConsent");
    if (!privacyConsentCheckbox.checked) {
      showValidationError(
        "privacyConsent",
        "Você deve concordar para continuar."
      );
      isValid = false;
    } else {
      hideValidationError("privacyConsent");
    }

    if (isValid) {
      // Se o formulário for válido, capture os dados
      const formData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        experience: experienceSelect.value,
        privacyConsent: privacyConsentCheckbox.checked,
      };

      console.log("Dados do formulário enviados:", formData);

      // --- AQUI INTEGRAREI NO FUTURO O FORMS A API DE UM CRM OU SIMILAR ---
      // Exemplo de como enviar dados para uma API (substitua pela sua lógica real)
      /*
            fetch('/api/submit-partner-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Sucesso:', data);
                alert('Obrigado! Recebemos sua solicitação e entraremos em contato em breve.');
                closeModal(); // Fecha o modal após o envio bem-sucedido
            })
            .catch((error) => {
                console.error('Erro:', error);
                alert('Houve um erro ao enviar seu formulário. Por favor, tente novamente.');
            });
            */

      // Para este exemplo, apenas logamos e fechamos o modal
      alert(
        "Obrigado! Recebemos sua solicitação e entraremos em contato em breve."
      );
      closeModal();
    }
  });

  // Opcional: Máscara para o campo de telefone
  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
      let formattedValue = "";

      if (value.length > 0) {
        formattedValue = "(" + value.substring(0, 2);
      }
      if (value.length >= 3) {
        formattedValue += ") " + value.substring(2, 7);
      }
      if (value.length >= 8) {
        formattedValue += "-" + value.substring(7, 11);
      }
      e.target.value = formattedValue;
    });
  }
});
