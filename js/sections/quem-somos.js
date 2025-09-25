class TeamManager {
  constructor() {
    this.teamMembers = [];
    this.filteredMembers = [];
    this.searchTerm = "";
    this.searchTimeout = null;
    this.intersectionObserver = null;
    this.isLoading = false;

    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.loadTeamData();
    this.setupEventListeners();
    this.setupModal();
    this.hideLoading();
  }

  // Dados da equipe
  loadTeamData() {
    this.teamMembers = [
      {
        id: 1,
        name: "Felipe Toledo",
        role: "Consultor de Expansão",
        photo: "assets/quem-somos/felipe.png",
        skills: [
          "Gestor de tráfego",
          "Automação de Processos",
          "Desenvolvimento Web",
          "Análise de Dados",
        ],
        hobbies: "Leitura, jogos e viagens",
        favoriteMusic: "Construção - Chico Buarque",
        favoriteMovie: "Na Natureza Selvagem",
        quote:
          "Se a educação sozinha não transforma a sociedade, sem ela tampouco a sociedade muda. - Paulo Freire",
        email: "felipe@educamais.com.br",
        experience: "5+ anos",
      },
      {
        id: 2,
        name: "Mateus Coelho",
        role: "Coordenador de Marketing",
        photo: "assets/quem-somos/mateus.png",
        skills: ["Design", "Editor", "Foto e Vídeo"],
        hobbies: "Assistir filme/série, cozinhar e jogar",
        favoriteMusic: "Não tem",
        favoriteMovie: "Filme de ação e aventura",
        quote:
          "Transformando ideias em estratégias e estratégias em resultados.",
        email: "mateus@sejaeducamais.com",
        experience: "7+ anos",
      },
      {
        id: 3,
        name: "Igor Alecsander",
        role: "Consultor de Expansão",
        photo: "assets/quem-somos/igor.png",
        skills: ["Designer Gráfico", "Gestor de Tráfego", "Copywriter"],
        hobbies: "Jogar e cozinhar",
        favoriteMusic: "Hungria - Um Pedido",
        favoriteMovie: "A Forja: O Poder da Transformação",
        quote: "A persistência realiza o impossível.",
        email: "igor@sejaeducamais.com.br",
        experience: "6+ anos",
      },
      {
        id: 4,
        name: "Leila Reis",
        role: "Consultora de Expansão",
        photo: "assets/quem-somos/leila.png",
        skills: [
          "Organização e Gerenciamento de Tempo",
          "Gerenciamento de Pessoas",
          "Gerenciamento de Projetos",
        ],
        hobbies: "Exercícios físicos, jogar e cozinhar",
        favoriteMusic: "Andanças - Beth Carvalho",
        favoriteMovie: "Comer, Rezar e Amar",
        quote: "Nós somos nossas escolhas. - Jean-Paul Sartre",
        email: "leila@sejaeducamais.com.br",
        experience: "10+ anos",
      },
      {
        id: 5,
        name: "Rafael Pessoa",
        role: "Diretor de Expansão",
        photo: "assets/quem-somos/rafael.png",
        skills: [
          "Gestão Estratégica de Alta Performance",
          "Liderança e Desenvolvimento de Pessoas",
          "Integração de Processos & Parcerias",
        ],
        hobbies: "Exercícios Físicos, jogos e cozinhar",
        favoriteMusic: "Jota Quest -  Dias Melhores",
        favoriteMovie: "O Lobo de Wall Street",
        quote: "A melhor maneira de prever o futuro é criá-lo. – Peter Drucker",
        email: "rafael@sejaeducamais.com.br",
        experience: "15+ anos",
      },
    ];

    this.filteredMembers = [...this.teamMembers];
    this.renderTeam();
  }

  setupEventListeners() {
    const searchInput = document.getElementById("searchInput");

    if (!searchInput) {
      console.warn("Search input not found");
      return;
    }

    searchInput.addEventListener("input", (e) => {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.searchTerm = e.target.value.toLowerCase();
        this.filterTeam();
      }, 300);
    });

    searchInput.addEventListener("input", (e) => {
      this.addSearchFeedback(e.target.value);
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.clearSearch();
      }
    });
  }

  addSearchFeedback(value) {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    if (value.length > 0) {
      searchInput.classList.add("animate-glow-pulse");
    } else {
      searchInput.classList.remove("animate-glow-pulse");
    }
  }

  setupModal() {
    const modal = document.getElementById("memberModal");
    const closeBtn = document.getElementById("closeModal");

    if (!modal || !closeBtn) {
      console.warn("Modal elements not found");
      return;
    }

    closeBtn.addEventListener("click", () => this.closeModal());

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) {
        this.closeModal();
      }
    });
  }

  setupIntersectionObserver() {
    if (!("IntersectionObserver" in window)) {
      console.warn("IntersectionObserver not supported");
      this.intersectionObserver = null;
      return;
    }

    const options = {
      threshold: 0.1,
      rootMargin: "50px",
    };

    try {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("card-enter-active");
            this.intersectionObserver.unobserve(entry.target);
          }
        });
      }, options);
    } catch (error) {
      console.warn("Error creating IntersectionObserver:", error);
      this.intersectionObserver = null;
    }
  }

  filterTeam() {
    if (this.isLoading) return;

    this.isLoading = true;

    requestAnimationFrame(() => {
      this.filteredMembers = this.teamMembers.filter((member) => {
        const matchesSearch =
          this.searchTerm === "" || this.matchesSearchTerm(member);
        return matchesSearch;
      });

      this.renderTeam();
      this.isLoading = false;
    });
  }

  matchesSearchTerm(member) {
    const searchFields = [
      member.name,
      member.role,
      ...member.skills,
      member.hobbies,
      member.favoriteMusic,
      member.favoriteMovie,
      member.email,
    ]
      .join(" ")
      .toLowerCase();

    return searchFields.includes(this.searchTerm);
  }

  renderTeam() {
    const grid = document.getElementById("teamGrid");
    const noResults = document.getElementById("noResultsMessage");

    if (!grid || !noResults) {
      console.warn("Grid or noResults elements not found");
      return;
    }

    if (this.filteredMembers.length === 0) {
      grid.classList.add("hidden");
      noResults.classList.remove("hidden");
      return;
    }

    grid.classList.remove("hidden");
    noResults.classList.add("hidden");

    const fragment = document.createDocumentFragment();

    this.filteredMembers.forEach((member, index) => {
      const cardElement = this.createMemberCardElement(member, index);
      fragment.appendChild(cardElement);
    });

    grid.innerHTML = "";
    grid.appendChild(fragment);

    this.setupCardListeners();
    this.animateCards();
  }

  createMemberCardElement(member, index) {
    const delay = Math.min(index * 100, 500);

    const cardDiv = document.createElement("div");
    cardDiv.className =
      "team-card bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer card-enter h-[400px]";
    cardDiv.style.animationDelay = `${delay}ms`;
    cardDiv.dataset.memberId = member.id;

    cardDiv.innerHTML = `
      <div class="team-card-inner">
        <img src="${member.photo}"
             alt="${member.name}"
             class="team-card-image"
             loading="lazy"
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzEyNy45IDEwMCAxMTAgMTE3LjkgMTEwIDE0MFMxMjcuOSAxODAgMTUwIDE4MFMxOTAgMTYyLjEgMTkwIDE0MFMxNzIuMSAxMDAgMTUwIDEwMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTIxMCAyMDBDMjEwIDE3Mi4zOSAxODcuNjEgMTUwIDE2MCAxNTBIMTQwQzExMi4zOSAxNTAgOTAgMTcyLjM5IDkwIDIwMFYyMTBIMjEwVjIwMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+'">

        <div class="team-card-overlay">
          <h3 class="text-xl font-bold mb-1">${member.name}</h3>
          <p class="text-sm">${member.role}</p>
          <span class="email text-xs opacity-80 mb-4">${member.email}</span>

          <button class="w-full bg-educa-pink text-white py-2 rounded-lg hover:bg-red-600 transition-colors micro-bounce">
            <i class="fas fa-eye mr-2"></i>Ver Detalhes
          </button>
        </div>
      </div>
    `;

    return cardDiv;
  }

  animateCards() {
    const cards = document.querySelectorAll(".team-card.card-enter");

    if (this.intersectionObserver) {
      cards.forEach((card) => {
        this.intersectionObserver.observe(card);
      });
    } else {
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add("card-enter-active");
        }, index * 100);
      });
    }
  }

  setupCardListeners() {
    const cards = document.querySelectorAll(".team-card");
    cards.forEach((card) => {
      const newCard = card.cloneNode(true);
      card.parentNode.replaceChild(newCard, card);

      newCard.addEventListener("click", this.handleCardClick.bind(this));
    });
  }

  handleCardClick(event) {
    const card = event.currentTarget;
    const memberId = parseInt(card.dataset.memberId);
    this.openModal(memberId);
  }

  openModal(memberId) {
    const member = this.teamMembers.find((m) => m.id === memberId);
    if (!member) return;

    const modal = document.getElementById("memberModal");
    const content = document.getElementById("modalContent");

    if (!modal || !content) {
      console.warn("Modal elements not found");
      return;
    }

    content.innerHTML = this.createModalContent(member);
    modal.classList.remove("hidden");

    const modalContentDiv = modal.querySelector(".modal-content");
    if (modalContentDiv) {
      requestAnimationFrame(() => {
        modalContentDiv.classList.add("show");
      });
    }

    document.body.style.overflow = "hidden";

    this.preloadModalImage(member.photo);
  }

  preloadModalImage(imageSrc) {
    const img = new Image();
    img.src = imageSrc;
    img.onerror = () => {
      console.warn("Failed to preload image:", imageSrc);
    };
  }

  closeModal() {
    const modal = document.getElementById("memberModal");
    if (!modal) return;

    const modalContentDiv = modal.querySelector(".modal-content");

    if (modalContentDiv) {
      modalContentDiv.classList.remove("show");
    }

    setTimeout(() => {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    }, 300);
  }

  createModalContent(member) {
    return `
      <div class="relative">
        <img src="${member.photo}"
             alt="${member.name}"
             class="modal-image rounded-t-3xl"
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDYwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iMjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMDAgMTAwQzI2Ny45IDEwMCAyNDIgMTI1LjkgMjQyIDE1OFMyNjcuOSAyMTYgMzAwIDIxNlMzNTggMTkwLjEgMzU4IDE1OFMzMzIuMSAxMDAgMzAwIDEwMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTM3MCAyNDBDMzcwIDIwMi4zOSAzMzcuNjEgMTcwIDMwMCAxNzBIMzAwQzI2Mi4zOSAxNzAgMjMwIDIwMi4zOSAyMzAgMjQwVjI2MEgzNzBWMjQwWiIgZmlsbD0iIzlDQTRBRiIvPgo8L3N2Zz4='">
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div class="absolute bottom-6 left-6 text-white">
          <h2 class="text-3xl font-bold mb-2">${member.name}</h2>
          <p class="text-xl opacity-90">${member.role}</p>
          <div class="flex items-center mt-2">
            <span class="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
              ${member.experience}
            </span>
          </div>
        </div>
      </div>

      <div class="p-8">
        <div class="bg-educa-pink/10 rounded-2xl p-6 mb-8 text-center">
          <i class="fas fa-quote-left text-educa-pink text-2xl mb-4"></i>
          <p class="text-lg italic text-educa-blue font-medium">"${
            member.quote
          }"</p>
        </div>

        <div class="mb-8">
          <h3 class="text-xl font-bold text-educa-blue mb-4 flex items-center">
            <i class="fas fa-cogs text-educa-pink mr-3"></i>
            Habilidades Técnicas
          </h3>
          <div class="flex flex-wrap gap-3">
            ${member.skills
              .map(
                (skill) =>
                  `<span class="skill-tag text-white px-4 py-2 rounded-full font-medium">${skill}</span>`
              )
              .join("")}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Hobbies -->
          <div class="bg-gray-50 rounded-2xl p-6">
            <h4 class="font-bold text-educa-blue mb-3 flex items-center">
              <i class="fas fa-heart text-red-500 mr-2"></i>
              Hobbies
            </h4>
            <p class="text-educa-dark-gray">${member.hobbies}</p>
          </div>

          <div class="bg-gray-50 rounded-2xl p-6">
            <h4 class="font-bold text-educa-blue mb-3 flex items-center">
              <i class="fas fa-music text-purple-500 mr-2"></i>
              Música Favorita
            </h4>
            <p class="text-educa-dark-gray">${member.favoriteMusic}</p>
          </div>

          <div class="bg-gray-50 rounded-2xl p-6">
            <h4 class="font-bold text-educa-blue mb-3 flex items-center">
              <i class="fas fa-film text-yellow-500 mr-2"></i>
              Filme Favorito
            </h4>
            <p class="text-educa-dark-gray">${member.favoriteMovie}</p>
          </div>

          <div class="bg-gray-50 rounded-2xl p-6">
            <h4 class="font-bold text-educa-blue mb-3 flex items-center">
              <i class="fas fa-envelope text-blue-500 mr-2"></i>
              Contato
            </h4>
            <a href="mailto:${
              member.email
            }" class="text-educa-pink hover:underline break-all">
              ${member.email}
            </a>
          </div>
        </div>
      </div>
    `;
  }

  clearSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    searchInput.value = "";
    searchInput.classList.remove("animate-glow-pulse");
    this.searchTerm = "";
    this.filterTeam();
    searchInput.focus();
  }

  hideLoading() {
    setTimeout(() => {
      const spinner = document.getElementById("loading-spinner");
      if (spinner) {
        spinner.style.opacity = "0";
        spinner.style.transform = "scale(0.8)";
        setTimeout(() => {
          spinner.style.display = "none";
        }, 300);
      }
    }, 1000);
  }

  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}

function clearSearch() {
  if (window.teamManager) {
    window.teamManager.clearSearch();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.teamManager = new TeamManager();
});

window.addEventListener("beforeunload", () => {
  if (window.teamManager) {
    window.teamManager.destroy();
  }
});
