/* escada-parceria.js - Versão Corrigida */

(function () {
  "use strict";

  // --- Constantes DOM ---
  const DOM = {
    FATURAMENTO_INPUT: "faturamento-input",
    TIER_SELECT: "tier-select",
    COMISSAO_PERCENT: "comissao-percent",
    COMISSAO_ALERT: "comissao-alert",
    GANHOS_MENSAIS: "ganhos-mensais",
    GANHOS_ANUAIS: "ganhos-anuais",
    PROXIMO_PASSO: "proximo-passo",
    TIER_LADDER: "tier-ladder",
    PARCERIA_CONFIG: "parceria-config",
    SECTION_TITLE: "section-title",
    SECTION_SUBTITLE: "section-subtitle",
  };

  const STORAGE_KEYS = {
    FATURAMENTO: "escada.faturamento",
    TIER_SELECT: "escada.tierSelect",
  };

  // --- Utilidades BRL ---
  const formatBRL = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(isFinite(value) ? value : 0);
  };

  const parseBRLInput = (value) => {
    if (!value) return 0;
    const digits = String(value).replace(/\D+/g, "");
    return digits ? parseInt(digits, 10) / 100 : 0;
  };

  const applyBRLMask = (inputEl) => {
    const parsed = parseBRLInput(inputEl.value);
    inputEl.value = formatBRL(parsed);
    if (document.activeElement === inputEl) {
      inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
    }
  };

  // --- Configuração ---
  const loadConfig = () => {
    const el = document.getElementById(DOM.PARCERIA_CONFIG);
    if (!el) {
      console.error(`Elemento #${DOM.PARCERIA_CONFIG} não encontrado.`);
      return null;
    }

    try {
      const cfg = JSON.parse(el.textContent);
      const tiers = (cfg.tiers || [])
        .map((t) => ({
          id: String(t.id || "").trim(),
          nome: String(t.nome || "").trim(),
          descricao: String(t.descricao || "").trim(),
          minRevenue: Number.isFinite(t.minRevenue) ? Number(t.minRevenue) : 0,
          maxRevenue:
            t.maxRevenue === null || t.maxRevenue === undefined
              ? null
              : Number(t.maxRevenue),
          comissao:
            t.comissao === null || t.comissao === undefined
              ? null
              : Number(t.comissao),
          destaque: Boolean(t.destaque),
        }))
        .sort((a, b) => a.minRevenue - b.minRevenue);

      return {
        tiers,
        texto: {
          titulo: cfg.texto?.titulo || "Escada de Parceria",
          subtitulo:
            cfg.texto?.subtitulo || "Descubra seu potencial de ganhos.",
        },
      };
    } catch (e) {
      console.error("Erro ao ler configuração de parceria:", e);
      return null;
    }
  };

  // --- Lógica de Negócio ---
  const findTierByRevenue = (tiers, revenue) => {
    return (
      tiers.find((t) => {
        const minOK = revenue >= t.minRevenue;
        const maxOK = t.maxRevenue === null ? true : revenue <= t.maxRevenue;
        return minOK && maxOK;
      }) || null
    );
  };

  const getNextTierInfo = (tiers, currentRevenue) => {
    const higherTiers = tiers.filter((t) => t.minRevenue > currentRevenue);
    if (higherTiers.length === 0) return null;

    const nextTier = higherTiers.sort((a, b) => a.minRevenue - b.minRevenue)[0];
    return {
      id: nextTier.id,
      nome: nextTier.nome,
      faltam: Math.max(0, nextTier.minRevenue - currentRevenue),
    };
  };

  // --- Intersection Observer para Animações ---
  const setupScrollAnimations = () => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Adiciona animação com delay baseado no índice
          const steps =
            entry.target.parentElement.querySelectorAll(".tier-step");
          steps.forEach((step, index) => {
            setTimeout(() => {
              step.classList.add("animate-in");
            }, index * 200); // 200ms de delay entre cada degrau
          });
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observa o container da escada
    const ladder = document.getElementById(DOM.TIER_LADDER);
    if (ladder) {
      observer.observe(ladder);
    }
  };

  // --- Renderização ---
  const renderTiers = (cfg) => {
    const container = document.getElementById(DOM.TIER_LADDER);
    if (!container) {
      console.error("Container #tier-ladder não encontrado!");
      return;
    }

    // Atualiza títulos
    const titleEl = document.getElementById(DOM.SECTION_TITLE);
    const subtitleEl = document.getElementById(DOM.SECTION_SUBTITLE);

    if (titleEl) titleEl.textContent = cfg.texto.titulo;
    if (subtitleEl) subtitleEl.textContent = cfg.texto.subtitulo;

    // Limpa container
    container.innerHTML = "";

    console.log("Renderizando", cfg.tiers.length, "tiers"); // Debug

    // Renderiza cada tier
    cfg.tiers.forEach((tier, index) => {
      const stepEl = document.createElement("div");
      stepEl.className = "tier-step";
      stepEl.setAttribute("data-tier-id", tier.id);

      // Mostra imediatamente (remove a dependência da animação)
      stepEl.style.opacity = "1";
      stepEl.style.transform = "translateY(0) scale(1)";

      // Número do degrau
      const numberEl = document.createElement("div");
      numberEl.className = "tier-step-number";
      numberEl.textContent = index + 1;

      // Porcentagem grande
      const percentageEl = document.createElement("div");
      percentageEl.className = "tier-percentage";
      percentageEl.textContent = `${(tier.comissao * 100).toFixed(0)}%`;

      // Conteúdo
      const contentEl = document.createElement("div");
      contentEl.className = "tier-content";

      // Título
      const titleEl = document.createElement("h4");
      titleEl.className = "tier-title";
      titleEl.textContent = tier.nome;

      // Descrição
      const descEl = document.createElement("p");
      descEl.className = "tier-description";
      descEl.textContent = tier.descricao;

      // Faixa de valores
      const rangeEl = document.createElement("span");
      rangeEl.className = "tier-range";
      const faixaText =
        tier.maxRevenue === null
          ? `A partir de ${formatBRL(tier.minRevenue)}`
          : `${formatBRL(tier.minRevenue)} – ${formatBRL(tier.maxRevenue)}`;
      rangeEl.textContent = faixaText;

      // Monta o conteúdo
      contentEl.appendChild(titleEl);
      contentEl.appendChild(descEl);
      contentEl.appendChild(rangeEl);

      // Monta o degrau
      stepEl.appendChild(numberEl);
      stepEl.appendChild(percentageEl);
      stepEl.appendChild(contentEl);
      container.appendChild(stepEl);
    });

    console.log("Escada renderizada com", container.children.length, "degraus"); // Debug

    // Configura animações após renderizar
    setTimeout(() => {
      setupScrollAnimations();
    }, 100);
  };

  const populateTierSelect = (tiers) => {
    const select = document.getElementById(DOM.TIER_SELECT);
    if (!select) {
      console.error("Select #tier-select não encontrado!");
      return;
    }

    select.innerHTML = "";

    // Opção automática
    const optAuto = document.createElement("option");
    optAuto.value = "__auto__";
    optAuto.textContent =
      "Selecionar automaticamente pela meta de investimento";
    select.appendChild(optAuto);

    // Opções dos tiers
    tiers.forEach((tier) => {
      const opt = document.createElement("option");
      opt.value = tier.id;
      const faixaText =
        tier.maxRevenue === null
          ? `≥ ${formatBRL(tier.minRevenue)}`
          : `${formatBRL(tier.minRevenue)} – ${formatBRL(tier.maxRevenue)}`;
      const comText = `comissão: ${(tier.comissao * 100).toFixed(0)}%`;
      opt.textContent = `${tier.nome} • ${faixaText} • ${comText}`;
      select.appendChild(opt);
    });

    // Restaura seleção salva
    const savedTier = localStorage.getItem(STORAGE_KEYS.TIER_SELECT);
    if (
      savedTier &&
      Array.from(select.options).some((o) => o.value === savedTier)
    ) {
      select.value = savedTier;
    }

    console.log("Select populado com", select.options.length, "opções"); // Debug
  };

  // --- Atualização de Resultados ---
  const updateResults = (cfg) => {
    const faturamentoEl = document.getElementById(DOM.FATURAMENTO_INPUT);
    const tierSelect = document.getElementById(DOM.TIER_SELECT);

    if (!faturamentoEl || !tierSelect) {
      console.error("Elementos de input não encontrados!");
      return;
    }

    const faturamento = parseBRLInput(faturamentoEl.value);

    // Determina tier aplicado
    let tierAplicado = null;
    if (tierSelect.value === "__auto__") {
      tierAplicado = findTierByRevenue(cfg.tiers, faturamento);
    } else {
      tierAplicado = cfg.tiers.find((t) => t.id === tierSelect.value) || null;
    }

    // Limpa destaques anteriores
    document.querySelectorAll(".tier-step").forEach((step) => {
      step.classList.remove("active-tier", "next-tier");
      const label = step.querySelector(".tier-label");
      if (label) label.remove();
    });

    // Calcula valores
    const comissao = tierAplicado?.comissao ?? null;
    const ganhosMensais =
      comissao !== null && isFinite(faturamento)
        ? faturamento * comissao
        : null;
    const ganhosAnuais = ganhosMensais ? ganhosMensais * 12 : null;

    // Atualiza UI dos resultados
    const comissaoEl = document.getElementById(DOM.COMISSAO_PERCENT);
    const comissaoAlertEl = document.getElementById(DOM.COMISSAO_ALERT);
    const ganhosMensaisEl = document.getElementById(DOM.GANHOS_MENSAIS);
    const ganhosAnuaisEl = document.getElementById(DOM.GANHOS_ANUAIS);
    const proximoPassoEl = document.getElementById(DOM.PROXIMO_PASSO);

    if (comissaoEl) {
      comissaoEl.textContent =
        comissao === null ? "—" : `${(comissao * 100).toFixed(0)}%`;
    }

    if (comissaoAlertEl) {
      comissaoAlertEl.classList.toggle("hidden", comissao !== null);
    }

    if (ganhosMensaisEl) {
      ganhosMensaisEl.textContent =
        ganhosMensais === null ? "—" : formatBRL(ganhosMensais);
    }

    if (ganhosAnuaisEl) {
      ganhosAnuaisEl.textContent =
        ganhosAnuais === null ? "—" : formatBRL(ganhosAnuais);
    }

    // Próximo passo
    const nextTier = getNextTierInfo(cfg.tiers, faturamento);

    if (proximoPassoEl) {
      if (!nextTier) {
        proximoPassoEl.textContent =
          "🏆 Você está no topo da escada de parceria!";
      } else {
        proximoPassoEl.innerHTML = `🎯 Faltam ${formatBRL(
          nextTier.faltam
        )} para atingir "<strong>${nextTier.nome}</strong>"`;
      }
    }

    // Destaca tier atual
    if (tierAplicado) {
      const currentStep = document.querySelector(
        `[data-tier-id="${tierAplicado.id}"]`
      );
      if (currentStep) {
        currentStep.classList.add("active-tier");
        const label = document.createElement("span");
        label.className = "tier-label";
        label.textContent = "🎯 Tier Atual";
        currentStep.appendChild(label);
      }
    }

    // Destaca próximo tier
    if (nextTier && (!tierAplicado || nextTier.id !== tierAplicado.id)) {
      const nextStep = document.querySelector(
        `[data-tier-id="${nextTier.id}"]`
      );
      if (nextStep) {
        nextStep.classList.add("next-tier");
        const label = document.createElement("span");
        label.className = "tier-label";
        label.textContent = "🚀 Próximo";
        nextStep.appendChild(label);
      }
    }
  };

  // --- Inicialização ---
  const init = () => {
    console.log("Inicializando escada de parceria..."); // Debug

    const cfg = loadConfig();
    if (!cfg) {
      console.error("Configuração não carregada!");
      const escadaSection = document.getElementById("escada-parceria");
      if (escadaSection) {
        escadaSection.innerHTML = `
          <div class="mx-auto max-w-xl text-center py-20">
            <h2 class="text-3xl font-extrabold text-red-600">⚠️ Erro ao carregar configuração</h2>
            <p class="mt-4 text-lg text-gray-700">Verifique a configuração JSON.</p>
          </div>
        `;
      }
      return;
    }

    console.log("Configuração carregada:", cfg); // Debug

    // Renderiza a escada
    renderTiers(cfg);

    // Popula o select
    populateTierSelect(cfg.tiers);

    const faturamentoEl = document.getElementById(DOM.FATURAMENTO_INPUT);
    const tierSelect = document.getElementById(DOM.TIER_SELECT);

    if (!faturamentoEl || !tierSelect) {
      console.error("Elementos de input não encontrados!");
      return;
    }

    // Restaura faturamento salvo
    const savedFat = localStorage.getItem(STORAGE_KEYS.FATURAMENTO);
    faturamentoEl.value = savedFat ? formatBRL(Number(savedFat)) : formatBRL(0);

    // Event listeners
    const handleUpdate = () => {
      applyBRLMask(faturamentoEl);
      const parsed = parseBRLInput(faturamentoEl.value);
      localStorage.setItem(STORAGE_KEYS.FATURAMENTO, String(parsed));
      updateResults(cfg);
    };

    faturamentoEl.addEventListener("input", handleUpdate);
    faturamentoEl.addEventListener("blur", handleUpdate);

    tierSelect.addEventListener("change", () => {
      localStorage.setItem(STORAGE_KEYS.TIER_SELECT, tierSelect.value);
      updateResults(cfg);
    });

    // Primeira atualização
    updateResults(cfg);

    // Remove loading spinner
    const loadingSpinner = document.getElementById("loading-spinner");
    if (loadingSpinner) {
      setTimeout(() => {
        loadingSpinner.style.opacity = "0";
        setTimeout(() => {
          loadingSpinner.style.display = "none";
        }, 300);
      }, 1000);
    }

    console.log("Inicialização concluída!"); // Debug
  };

  // Inicializa quando DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
