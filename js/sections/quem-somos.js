// quem-somos.js - Sistema de Gerenciamento da Equipe

class TeamManager {
  constructor() {
    this.teamMembers = [];
    this.filteredMembers = [];
    this.currentFilter = "all";
    this.searchTerm = "";

    this.init();
  }

  init() {
    this.loadTeamData();
    this.setupEventListeners();
    this.setupModal();
    this.hideLoading();
  }

  // Dados da equipe (substitua por dados reais)
  loadTeamData() {
    this.teamMembers = [
      {
        id: 1,
        name: "Felipe Toledo Lopes da Silva",
        role: "Consultor de Expansão",
        department: "Expansão",
        photo:
          "assets/quem-somos/felipe.png",
        skills: [
          "Planejamento Estratégico",
          "Execução de Projetos",
          "Desenvolvimento de Negócios",
          "Análise de Dados",
        ],
        hobbies: "Leitura, jogos e viagens",
        favoriteMusic: "Construção - Chico Buarque",
        favoriteMovie: "Na Natureza Selvagem",
        quote: "Se a educação sozinha não transforma a sociedade, sem ela tampouco a sociedade muda. - PAulo Freire",
        email: "felipe@educamais.com.br",
        experience: "10+ anos",
      },
      {
        id: 2,
        name: "Mateus Santos Coelho",
        role: "- Coordenador de Marketing",
        department: "Expansão",
        photo:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
        skills: [
          "Design",
          "Editor",
          "Foto e Vídeo",
          "EAD",
        ],
        hobbies: "Assistir filme/série, cozinhar e jogar",
        favoriteMusic: "Não tem",
        favoriteMovie: "Filme de ação e aventura",
        quote: "- Transformando ideias em estratégias e estratégias em resultados.",
        email: "mcoelho2710@gmail.com",
        experience: "7+ anos",
      },
      {
        id: 3,
        name: "Igor",
        role: "Desenvolvedora Full Stack",
        department: "tecnologia",
        photo:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
        skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "AWS"],
        hobbies: "Games, séries de ficção científica e café especial",
        favoriteMusic: "Eletrônica - Daft Punk",
        favoriteMovie: "Matrix",
        quote: "Código limpo é poesia em movimento.",
        email: "mariana.costa@educamais.com.br",
        experience: "8+ anos",
      },
      {
        id: 4,
        name: "Leila",
        role: "Gerente de Marketing Digital",
        department: "marketing",
        photo:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
        skills: [
          "Marketing Digital",
          "SEO",
          "Google Ads",
          "Analytics",
          "Social Media",
        ],
        hobbies: "Surf, viagens e cerveja artesanal",
        favoriteMusic: "Reggae - Bob Marley",
        favoriteMovie: "Pulp Fiction",
        quote: "Marketing é contar histórias que as pessoas querem ouvir.",
        email: "rafael.oliveira@educamais.com.br",
        experience: "10+ anos",
      },
      {
        id: 5,
        name: "Juliana Ferreira",
        role: "Consultora de Vendas Sênior",
        department: "vendas",
        photo:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop&crop=face",
        skills: [
          "Vendas Consultivas",
          "CRM",
          "Negociação",
          "Relacionamento",
          "Apresentações",
        ],
        hobbies: "Dança, teatro e gastronomia",
        favoriteMusic: "Pop Internacional - Adele",
        favoriteMovie: "O Diabo Veste Prada",
        quote: "Vender é resolver problemas, não empurrar produtos.",
        email: "juliana.ferreira@educamais.com.br",
        experience: "7+ anos",
      },
      {
        id: 6,
        name: "Bruno Almeida",
        role: "Analista de Suporte Técnico",
        department: "suporte",
        photo:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
        skills: [
          "Suporte Técnico",
          "Troubleshooting",
          "Redes",
          "Linux",
          "Help Desk",
        ],
        hobbies: "Montar PCs, RPG e quadrinhos",
        favoriteMusic: "Metal - Iron Maiden",
        favoriteMovie: "Star Wars: O Império Contra-Ataca",
        quote: "Todo problema tem uma solução, só precisa encontrá-la.",
        email: "bruno.almeida@educamais.com.br",
        experience: "5+ anos",
      },
    ];

    this.filteredMembers = [...this.teamMembers];
    this.updateStats();
    this.renderTeam();
  }

  // Setup de event listeners
  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.filterTeam();
    });

    // Filter buttons
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // Remove active class from all buttons
        filterButtons.forEach((b) => b.classList.remove("active"));
        // Add active class to clicked button
        e.target.classList.add("active");

        this.currentFilter = e.target.dataset.filter;
        this.filterTeam();
      });
    });
  }

  // Setup do modal
  setupModal() {
    const modal = document.getElementById("memberModal");
    const closeBtn = document.getElementById("closeModal");

    closeBtn.addEventListener("click", () => this.closeModal());

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal();
      }
    });
  }

  // Filtrar equipe
  filterTeam() {
    this.filteredMembers = this.teamMembers.filter((member) => {
      const matchesFilter =
        this.currentFilter === "all" ||
        member.department === this.currentFilter;
      const matchesSearch =
        this.searchTerm === "" || this.matchesSearchTerm(member);

      return matchesFilter && matchesSearch;
    });

    this.renderTeam();
  }

  // Verificar se membro corresponde ao termo de busca
  matchesSearchTerm(member) {
    const searchFields = [
      member.name,
      member.role,
      member.department,
      ...member.skills,
      member.hobbies,
      member.favoriteMusic,
      member.favoriteMovie,
    ]
      .join(" ")
      .toLowerCase();

    return searchFields.includes(this.searchTerm);
  }

  // Renderizar equipe
  renderTeam() {
    const grid = document.getElementById("teamGrid");
    const noResults = document.getElementById("noResultsMessage");

    if (this.filteredMembers.length === 0) {
      grid.classList.add("hidden");
      noResults.classList.remove("hidden");
      return;
    }

    grid.classList.remove("hidden");
    noResults.classList.add("hidden");

    grid.innerHTML = this.filteredMembers
      .map((member, index) => this.createMemberCard(member, index))
      .join("");

    // Adicionar event listeners aos cards
    this.setupCardListeners();
  }

  // Criar card do membro
  createMemberCard(member, index) {
    const delay = Math.min(index * 100, 500);

    return `
            <div class="team-card bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer animate-scale-in" 
                 style="animation-delay: ${delay}ms"
                 data-member-id="${member.id}">
                <!-- Photo Section -->
                <div class="relative">
                    <img src="${member.photo}" 
                         alt="${member.name}" 
                         class="w-full h-64 object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div class="absolute bottom-4 left-4 text-white">
                        <div class="text-sm opacity-90">${this.getDepartmentName(
                          member.department
                        )}</div>
                    </div>
                    <div class="absolute top-4 right-4">
                        <div class="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs">
                            ${member.experience}
                        </div>
                    </div>
                </div>

                <!-- Content Section -->
                <div class="p-6">
                    <h3 class="font-heading text-xl font-bold text-educa-blue mb-2">${
                      member.name
                    }</h3>
                    <p class="text-educa-dark-gray mb-4">${member.role}</p>
                    
                    <!-- Skills Preview -->
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${member.skills
                          .slice(0, 3)
                          .map(
                            (skill) =>
                              `<span class="skill-tag text-white text-xs px-2 py-1 rounded-full">${skill}</span>`
                          )
                          .join("")}
                        ${
                          member.skills.length > 3
                            ? `<span class="text-xs text-educa-dark-gray">+${
                                member.skills.length - 3
                              } mais</span>`
                            : ""
                        }
                    </div>

                    <!-- Quick Info -->
                    <div class="space-y-2 text-sm text-educa-dark-gray">
                        <div class="flex items-center">
                            <i class="fas fa-music w-4 text-educa-pink mr-2"></i>
                            <span class="truncate">${
                              member.favoriteMusic
                            }</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-heart w-4 text-red-500 mr-2"></i>
                            <span class="truncate">${
                              member.hobbies.split(",")[0]
                            }</span>
                        </div>
                    </div>

                    <!-- View Details Button -->
                    <button class="mt-4 w-full bg-educa-pink text-white py-2 rounded-lg hover:bg-red-600 transition-colors">
                        <i class="fas fa-eye mr-2"></i>Ver Detalhes
                    </button>
                </div>
            </div>
        `;
  }

  // Setup de listeners para os cards
  setupCardListeners() {
    const cards = document.querySelectorAll(".team-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const memberId = parseInt(card.dataset.memberId);
        this.openModal(memberId);
      });
    });
  }

  // Abrir modal
  openModal(memberId) {
    const member = this.teamMembers.find((m) => m.id === memberId);
    if (!member) return;

    const modal = document.getElementById("memberModal");
    const content = document.getElementById("modalContent");

    content.innerHTML = this.createModalContent(member);
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  // Fechar modal
  closeModal() {
    const modal = document.getElementById("memberModal");
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }

  // Criar conteúdo do modal
  createModalContent(member) {
    return `
            <!-- Header -->
            <div class="relative">
                <img src="${member.photo}" alt="${
      member.name
    }" class="w-full h-64 object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div class="absolute bottom-6 left-6 text-white">
                    <h2 class="text-3xl font-bold mb-2">${member.name}</h2>
                    <p class="text-xl opacity-90">${member.role}</p>
                    <div class="flex items-center mt-2">
                        <span class="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                            ${this.getDepartmentName(member.department)}
                        </span>
                        <span class="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm ml-2">
                            ${member.experience}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="p-8">
                <!-- Quote -->
                <div class="bg-educa-pink/10 rounded-2xl p-6 mb-8 text-center">
                    <i class="fas fa-quote-left text-educa-pink text-2xl mb-4"></i>
                    <p class="text-lg italic text-educa-blue font-medium">"${
                      member.quote
                    }"</p>
                </div>

                <!-- Skills -->
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

                <!-- Personal Info Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Hobbies -->
                    <div class="bg-gray-50 rounded-2xl p-6">
                        <h4 class="font-bold text-educa-blue mb-3 flex items-center">
                            <i class="fas fa-heart text-red-500 mr-2"></i>
                            Hobbies
                        </h4>
                        <p class="text-educa-dark-gray">${member.hobbies}</p>
                    </div>

                    <!-- Favorite Music -->
                    <div class="bg-gray-50 rounded-2xl p-6">
                        <h4 class="font-bold text-educa-blue mb-3 flex items-center">
                            <i class="fas fa-music text-purple-500 mr-2"></i>
                            Música Favorita
                        </h4>
                        <p class="text-educa-dark-gray">${
                          member.favoriteMusic
                        }</p>
                    </div>

                    <!-- Favorite Movie -->
                    <div class="bg-gray-50 rounded-2xl p-6">
                        <h4 class="font-bold text-educa-blue mb-3 flex items-center">
                            <i class="fas fa-film text-yellow-500 mr-2"></i>
                            Filme Favorito
                        </h4>
                        <p class="text-educa-dark-gray">${
                          member.favoriteMovie
                        }</p>
                    </div>

                    <!-- Contact -->
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

  // Obter nome do departamento
  getDepartmentName(dept) {
    const departments = {
      gestao: "Gestão",
      educacional: "Educacional",
      tecnologia: "Tecnologia",
      marketing: "Marketing",
      vendas: "Vendas",
      suporte: "Suporte",
    };
    return departments[dept] || dept;
  }

  // Atualizar estatísticas
  updateStats() {
    const totalMembers = this.teamMembers.length;
    const departments = [...new Set(this.teamMembers.map((m) => m.department))]
      .length;
    const skills = [...new Set(this.teamMembers.flatMap((m) => m.skills))]
      .length;

    this.animateCounter("totalMembers", totalMembers);
    this.animateCounter("totalDepartments", departments);
    this.animateCounter("totalSkills", skills);
  }

  // Animar contador
  animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current);
    }, 16);
  }

  // Esconder loading
  hideLoading() {
    setTimeout(() => {
      const spinner = document.getElementById("loading-spinner");
      if (spinner) {
        spinner.style.opacity = "0";
        setTimeout(() => {
          spinner.style.display = "none";
        }, 300);
      }
    }, 1000);
  }
}

// Função global para limpar pesquisa
function clearSearch() {
  document.getElementById("searchInput").value = "";
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document
    .querySelector('.filter-btn[data-filter="all"]')
    .classList.add("active");

  if (window.teamManager) {
    window.teamManager.searchTerm = "";
    window.teamManager.currentFilter = "all";
    window.teamManager.filterTeam();
  }
}

// CSS adicional para os botões de filtro
const additionalStyles = `
    .filter-btn {
        background: white;
        color: #6b7280;
        border: 2px solid #e5e7eb;
        padding: 0.75rem 1.5rem;
        border-radius: 9999px;
        font-weight: 600;
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .filter-btn:hover {
        border-color: #e71f5d;
        color: #e71f5d;
        transform: translateY(-2px);
    }

    .filter-btn.active {
        background: #e71f5d;
        color: white;
        border-color: #e71f5d;
        box-shadow: 0 4px 12px rgba(231, 31, 93, 0.3);
    }
`;

// Injetar estilos adicionais
const styleSheet = document.createElement("style");
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.teamManager = new TeamManager();
});
