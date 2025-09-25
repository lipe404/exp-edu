/* projecao.js */

(function () {
  "use strict";

  // Utilidades de moeda BRL
  const nfBRL = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formatBRL = (value) => nfBRL.format(isFinite(value) ? value : 0);

  // Transforma "R$ 12.345,67" em 12345.67
  const parseBRLInput = (value) => {
    if (!value) return 0;
    const digits = String(value).replace(/\D+/g, "");
    if (!digits) return 0;
    // Últimos 2 dígitos = centavos
    const num = parseInt(digits, 10);
    return num / 100;
  };

  // Aplica máscara de moeda enquanto digita
  const applyBRLMask = (inputEl) => {
    const caretEnd = inputEl.selectionEnd;
    const raw = inputEl.value;
    const parsed = parseBRLInput(raw);
    inputEl.value = formatBRL(parsed);
    // Cursor no fim por simplicidade
    inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
  };

  // Carrega configuração do JSON embutido
  const loadConfig = () => {
    const el = document.getElementById("parceria-config");
    if (!el) {
      console.error("Elemento #parceria-config não encontrado.");
      return null;
    }
    try {
      const cfg = JSON.parse(el.textContent);
      // Sanitiza e ordena tiers por minRevenue asc
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
          corHex: String(t.corHex || "#2563EB"),
        }))
        .sort((a, b) => a.minRevenue - b.minRevenue); // Garante a ordem para a "escadinha"

      return {
        tiers,
        texto: {
          titulo: cfg.texto?.titulo || "Modelos de Parceria",
          subtitulo:
            cfg.texto?.subtitulo ||
            "Escolha o modelo e projete seus ganhos com base no faturamento.",
        },
      };
    } catch (e) {
      console.error("Erro ao ler configuração de parceria:", e);
      return null;
    }
  };

  // Encontra o tier compatível para um faturamento dado
  const findTierByRevenue = (tiers, revenue) => {
    if (!Array.isArray(tiers)) return null;
    return (
      tiers.find((t) => {
        const minOK = revenue >= t.minRevenue;
        const maxOK = t.maxRevenue === null ? true : revenue <= t.maxRevenue;
        return minOK && maxOK;
      }) || null
    );
  };

  // Próximo passo com base no faturamento atual
  const nextTierInfo = (tiers, revenue) => {
    if (!Array.isArray(tiers)) return null;
    const higher = tiers
      .filter((t) => t.minRevenue > revenue)
      .sort((a, b) => a.minRevenue - b.minRevenue)[0];
    if (!higher) return null;
    return {
      id: higher.id,
      nome: higher.nome,
      faltam: Math.max(0, higher.minRevenue - revenue),
    };
  };

  // Renderiza os cards de tiers como uma "escadinha"
  const renderTiers = (cfg) => {
    const tiers = cfg.tiers;
    const container = document.getElementById("tier-ladder");
    if (!container) return;

    // Atualiza título e subtítulo da seção
    document.getElementById("section-title").textContent = cfg.texto.titulo;
    document.getElementById("section-subtitle").textContent =
      cfg.texto.subtitulo;

    container.innerHTML = "";
    tiers.forEach((t, index) => {
      const card = document.createElement("div");
      // Classes iniciais para estilizar o "degrau" da escadinha
      card.className = "tier-step relative p-5"; // Base class, custom styles handle other properties
      card.setAttribute("data-tier-id", t.id);

      // Define z-index para sobreposição (quanto mais alto, mais acima na visualização)
      card.style.zIndex = tiers.length - index;
      // Adiciona um offset para criar o efeito de escadinha
      card.style.setProperty("--step-offset", `${index * 40}px`); // Ajuste 40px para a inclinação desejada
      card.style.marginLeft = `var(--step-offset)`; // Aplica o offset via margin-left

      // Número do degrau (agora um div real, não um pseudo-elemento)
      const stepNumberEl = document.createElement("div");
      stepNumberEl.className = "tier-step-number";
      stepNumberEl.textContent = index + 1;

      // Conteúdo do card
      const header = document.createElement("div");
      header.className = "flex items-center justify-between mb-3";

      const title = document.createElement("h4");
      title.className = "text-lg font-bold text-gray-900"; // Default color, will change with active/next tier
      title.textContent = t.nome;

      const badge = document.createElement("span");
      badge.className =
        "inline-block text-xs font-semibold px-3 py-1 rounded-full";
      badge.style.backgroundColor = `${t.corHex}20`; // Cor mais clara do tier
      badge.style.color = t.corHex;
      badge.textContent = t.destaque ? "🏆 Destaque" : "📈 Modelo";

      const desc = document.createElement("p");
      desc.className = "text-sm text-gray-700 mb-3 leading-relaxed"; // Default color
      desc.textContent = t.descricao;

      const faixa = document.createElement("div");
      faixa.className =
        "flex items-center justify-between text-xs text-gray-600 bg-gray-100 p-2 rounded-lg mb-2"; // Default color
      const maxTxt =
        t.maxRevenue === null ? "sem teto" : `até ${formatBRL(t.maxRevenue)}`;
      faixa.innerHTML = `
        <span><strong>Faixa:</strong> ${formatBRL(t.minRevenue)} ${
        t.maxRevenue === null ? "+" : `- ${formatBRL(t.maxRevenue)}`
      }</span>
      `;

      const comissao = document.createElement("div");
      comissao.className =
        "flex items-center justify-between text-sm font-medium";
      const comissaoSpan = document.createElement("span");
      comissaoSpan.className =
        t.comissao == null ? "text-amber-700" : "text-gray-900"; // Default color
      comissaoSpan.textContent =
        t.comissao == null
          ? "Comissão: a definir"
          : `Comissão: ${(t.comissao * 100).toFixed(0)}%`;

      const comissaoIcon = document.createElement("span");
      comissaoIcon.className = "text-lg";
      comissaoIcon.textContent = t.comissao == null ? "⏳" : "💰";

      comissao.appendChild(comissaoSpan);
      comissao.appendChild(comissaoIcon);

      header.appendChild(title);
      header.appendChild(badge);

      card.appendChild(stepNumberEl); // Add the step number div
      card.appendChild(header);
      card.appendChild(desc);
      card.appendChild(faixa);
      card.appendChild(comissao);

      container.appendChild(card);
    });
  };

  // Preenche o select de tiers
  const populateTierSelect = (tiers) => {
    const select = document.getElementById("tier-select");
    if (!select) return;

    select.innerHTML = "";

    const optAuto = document.createElement("option");
    optAuto.value = "__auto__";
    optAuto.textContent = "Selecionar automaticamente pela meta de faturamento";
    select.appendChild(optAuto);

    tiers.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      const faixaTexto =
        t.maxRevenue === null
          ? `≥ ${formatBRL(t.minRevenue)}`
          : `${formatBRL(t.minRevenue)} — ${formatBRL(t.maxRevenue)}`;
      const comTxt =
        t.comissao == null
          ? "comissão: definir"
          : `comissão: ${(t.comissao * 100).toFixed(0)}%`;
      opt.textContent = `${t.nome} • ${faixaTexto} • ${comTxt}`;
      select.appendChild(opt);
    });

    // Restaura valor salvo, se existir
    const savedTier = localStorage.getItem("projecao.tierSelect");
    if (savedTier) {
      const has = Array.from(select.options).some((o) => o.value === savedTier);
      select.value = has ? savedTier : "__auto__";
    }
  };

  // Atualiza resultados de simulação e destaca tiers na escadinha
  const updateResults = (cfg) => {
    const tiers = cfg.tiers;

    const faturamentoEl = document.getElementById("faturamento-input");
    const tierSelect = document.getElementById("tier-select");

    const comissaoEl = document.getElementById("comissao-percent");
    const comissaoAlertEl = document.getElementById("comissao-alert");
    const ganhosMensaisEl = document.getElementById("ganhos-mensais");
    const ganhosAnuaisEl = document.getElementById("ganhos-anuais");
    const proximoPassoEl = document.getElementById("proximo-passo");

    const faturamento = parseBRLInput(faturamentoEl.value);

    // Qual tier aplicar?
    let tierAplicado = null;

    if (tierSelect.value === "__auto__") {
      tierAplicado = findTierByRevenue(tiers, faturamento);
    } else {
      tierAplicado = tiers.find((t) => t.id === tierSelect.value) || null;
    }

    // Limpa destaques anteriores na escadinha
    document.querySelectorAll(".tier-step").forEach((step) => {
      step.classList.remove("active-tier", "next-tier");
      step.style.zIndex =
        tiers.length - Array.from(step.parentNode.children).indexOf(step); // Reset z-index
      step.style.borderColor = ""; // Reset inline styles
      step.style.backgroundColor = "";
      step.style.transform = "";
      step.style.boxShadow = "";

      // Limpa labels anteriores
      const currentLabel = step.querySelector(".tier-label");
      if (currentLabel) currentLabel.remove();

      // Reset do círculo do número do degrau
      const stepNumberEl = step.querySelector(".tier-step-number");
      if (stepNumberEl) {
        stepNumberEl.style.backgroundColor = ""; // Reset to default CSS
        stepNumberEl.style.color = "";
        stepNumberEl.style.borderColor = "";
      }
    });

    // Destaca o tier atual na escadinha
    if (tierAplicado) {
      const currentTierStep = document.querySelector(
        `.tier-step[data-tier-id="${tierAplicado.id}"]`
      );
      if (currentTierStep) {
        currentTierStep.classList.add("active-tier");
        currentTierStep.style.zIndex = 20; // Ensure active tier is on top

        // Atualiza o círculo do número do degrau
        const stepNumberEl = currentTierStep.querySelector(".tier-step-number");
        if (stepNumberEl) {
          // Cores definidas no CSS, então não precisamos setar inline aqui
          // stepNumberEl.style.backgroundColor = tierAplicado.corHex; // Pode ser definido pelo CSS para Educa+ blue
          // stepNumberEl.style.color = "white";
          // stepNumberEl.style.borderColor = tierAplicado.corHex;
        }

        // Adiciona um label "Atual"
        const label = document.createElement("span");
        label.className = "tier-label"; // Classes definidas no CSS
        label.textContent = "🎯 Tier Atual";
        currentTierStep.appendChild(label);
      }
    }

    // Comissão e ganhos
    let comissao = tierAplicado?.comissao ?? null;
    let ganhosMensais = null;
    let ganhosAnuais = null;

    if (comissao != null && isFinite(faturamento)) {
      ganhosMensais = faturamento * comissao;
      ganhosAnuais = ganhosMensais * 12;
    }

    // Atualiza UI
    if (comissao == null) {
      comissaoEl.textContent = "—";
      comissaoAlertEl.classList.remove("hidden");
    } else {
      comissaoEl.textContent = `${(comissao * 100).toFixed(0)}%`;
      comissaoAlertEl.classList.add("hidden");
    }

    ganhosMensaisEl.textContent =
      ganhosMensais == null ? "—" : formatBRL(ganhosMensais);
    ganhosAnuaisEl.textContent =
      ganhosAnuais == null ? "—" : formatBRL(ganhosAnuais);

    // Próximo passo
    const next = nextTierInfo(tiers, faturamento);
    if (!next) {
      proximoPassoEl.textContent =
        "🏆 Você está no topo da escada de parceria!";
    } else {
      proximoPassoEl.textContent = `🎯 Faltam ${formatBRL(
        next.faltam
      )} para atingir "${next.nome}"`;

      // Destaca o próximo tier na escadinha (se não for o tier atual)
      if (!tierAplicado || next.id !== tierAplicado.id) {
        const nextTierStep = document.querySelector(
          `.tier-step[data-tier-id="${next.id}"]`
        );
        if (nextTierStep) {
          nextTierStep.classList.add("next-tier");
          nextTierStep.style.zIndex = 15; // Ensure next tier is above inactive ones

          // Adiciona um label "Próximo"
          const label = document.createElement("span");
          label.className = "tier-label"; // Classes definidas no CSS
          label.textContent = "🚀 Próximo";
          nextTierStep.appendChild(label);
        }
      }
    }
  };

  // Inicialização
  const init = () => {
    const cfg = loadConfig();
    if (!cfg) {
      // Exibe uma mensagem de erro visível na página se a configuração falhar
      const mainContent = document.getElementById("projecao-ganhos");
      if (mainContent) {
        mainContent.innerHTML = `
          <div class="mx-auto max-w-xl text-center py-20">
            <h2 class="text-3xl font-extrabold text-red-600">⚠️ Erro ao carregar os modelos de parceria</h2>
            <p class="mt-4 text-lg text-gray-700">Por favor, verifique a configuração JSON. Consulte o console do navegador para mais detalhes.</p>
            <div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p class="text-sm text-red-800"><strong>Dica:</strong> Verifique se não há caracteres de escape inválidos como <code>\$</code> no JSON.</p>
            </div>
          </div>
        `;
      }
      return;
    }

    renderTiers(cfg);
    populateTierSelect(cfg.tiers);

    // Máscara e eventos
    const faturamentoEl = document.getElementById("faturamento-input");
    const tierSelect = document.getElementById("tier-select");

    // Restaura faturamento, se houver
    const savedFat = localStorage.getItem("projecao.faturamento");
    if (savedFat) {
      faturamentoEl.value = formatBRL(Number(savedFat));
    } else {
      faturamentoEl.value = "";
    }

    const onInput = () => {
      applyBRLMask(faturamentoEl);
      const parsed = parseBRLInput(faturamentoEl.value);
      localStorage.setItem("projecao.faturamento", String(parsed));
      updateResults(cfg);
    };

    faturamentoEl.addEventListener("input", onInput);
    faturamentoEl.addEventListener("blur", onInput);

    tierSelect.addEventListener("change", () => {
      localStorage.setItem("projecao.tierSelect", tierSelect.value);
      updateResults(cfg);
    });

    // Primeira atualização
    if (!savedFat) {
      faturamentoEl.value = formatBRL(0);
    }
    updateResults(cfg);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
