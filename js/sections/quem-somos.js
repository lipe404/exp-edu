// quem-somos.js - Sistema de Gerenciamento da Equipe

class TeamManager {
  constructor() {
    this.teamMembers = [];
    this.filteredMembers = [];
    // this.currentFilter = "all"; // Removido: Filtros de departamento
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
        // department: "Expansão", // Removido
        photo: "assets/quem-somos/felipe.png",
        skills: [
          "Gestor de tráfego",
          "Desenvolvimento Web",
          "Análise de Dados",
        ],
        hobbies: "Leitura, jogos e viagens",
        favoriteMusic: "Construção - Chico Buarque",
        favoriteMovie: "Na Natureza Selvagem",
        quote:
          "Se a educação sozinha não transforma a sociedade, sem ela tampouco a sociedade muda. - PAulo Freire",
        email: "felipe@educamais.com.br",
        experience: "10+ anos",
      },
      {
        id: 2,
        name: "Mateus Santos Coelho",
        role: "Coordenador de Marketing",
        // department: "Expansão", // Removido
        photo:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face", // Altere para uma foto real do Mateus se possível
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
        name: "Igor Alecsander Moreira Cassimiro",
        role: "Consultor de Expansão",
        // department: "Expansão", // Removido
        photo:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face", // Altere para uma foto real do Igor se possível
        skills: ["Designer Gráfico", "Gestor de Tráfego", "Copywriter"],
        hobbies: "Jogar e cozinhar",
        favoriteMusic: "Hungria -  Um Pedido",
        favoriteMovie: "A Forja: O Poder da Transformação",
        quote: "A persistência realiza o impossível.",
        email: "igor@sejaeducamais.com.br",
        experience: "6+ anos",
      },
      {
        id: 4,
        name: "Leila Reis Pessoa",
        role: "Consultora de Expansão",
        // department: "Expansão", // Removido
        photo:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face", // Altere para uma foto real da Leila se possível
        skills: [
          "Organização e Gerenciamento de Tempo",
          "Gerenciamento de Pessoas",
          "Gerenciamento de Projetos",
        ],
        hobbies: "Exercícios físicos, jogar e cozinhar",
        favoriteMusic: "Andanças - Beth Carvalho",
        favoriteMovie: "Comer, Rezar e Amar",
        quote: "Nós somos nossas escolhas. - Jean-Paul Sartre",
        email: "reis.leila@hotmail.com",
        experience: "10+ anos",
      },
      {
        id: 5,
        name: "Rafael Pessoa",
        role: "Consultor de Vendas Sênior",
        // department: "vendas", // Removido
        photo:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop&crop=face", // Altere para uma foto real do Rafael se possível
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
        email: "rafael.pessoa@educamais.com.br", // Ajustado para corresponder ao nome
        experience: "7+ anos",
      },
      // Adicione mais membros aqui
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

    // Removido: Filtro por botões de departamento
    // const filterButtons = document.querySelectorAll(".filter-btn");
    // filterButtons.forEach((btn) => {
    //   btn.addEventListener("click", (e) => {
    //     filterButtons.forEach((b) => b.classList.remove("active"));
    //     e.target.classList.add("active");
    //     this.currentFilter = e.target.dataset.filter;
    //     this.filterTeam();
    //   });
    // });
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
      // Simplificado: Agora só filtra pelo termo de busca
      // const matchesFilter = this.currentFilter === "all" || member.department === this.currentFilter;
      const matchesSearch =
        this.searchTerm === "" || this.matchesSearchTerm(member);

      return matchesSearch;
    });

    this.renderTeam();
  }

  // Verificar se membro corresponde ao termo de busca
  matchesSearchTerm(member) {
    const searchFields = [
      member.name,
      member.role,
      // member.department, // Removido
      ...member.skills,
      member.hobbies,
      member.favoriteMusic,
      member.favoriteMovie,
      member.email, // Adicionado email para busca
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
            <div class="team-card bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer animate-scale-in h-[400px]" 
                 style="animation-delay: ${delay}ms"
                 data-member-id="${member.id}">
                <div class="team-card-inner">
                    <img src="${member.photo}" 
                         alt="${member.name}" 
                         class="team-card-image">
                    
                    <div class="team-card-overlay">
                        <h3 class="text-2xl font-bold mb-1">${member.name}</h3>
                        <p class="text-base">${member.role}</p>
                        <span class="email text-sm opacity-80 mb-4">${member.email}</span>
                        
                        <!-- View Details Button -->
                        <button class="w-full bg-educa-pink text-white py-2 rounded-lg hover:bg-red-600 transition-colors">
                            <i class="fas fa-eye mr-2"></i>Ver Detalhes
                        </button>
                    </div>
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
    }" class="w-full h-64 object-cover rounded-t-3xl">
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div class="absolute bottom-6 left-6 text-white">
                    <h2 class="text-3xl font-bold mb-2">${member.name}</h2>
                    <p class="text-xl opacity-90">${member.role}</p>
                    <div class="flex items-center mt-2">
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

  // Removido: Obter nome do departamento
  // getDepartmentName(dept) {
  //   const departments = {
  //     gestao: "Gestão",
  //     educacional: "Educacional",
  //     tecnologia: "Tecnologia",
  //     marketing: "Marketing",
  //     vendas: "Vendas",
  //     suporte: "Suporte",
  //   };
  //   return departments[dept] || dept;
  // }

  // Atualizar estatísticas
  updateStats() {
    const totalMembers = this.teamMembers.length;
    // const departments = [...new Set(this.teamMembers.map((m) => m.department))].length; // Removido
    const skills = [...new Set(this.teamMembers.flatMap((m) => m.skills))]
      .length;

    this.animateCounter("totalMembers", totalMembers);
    // this.animateCounter("totalDepartments", departments); // Removido
    this.animateCounter("totalSkills", skills);
  }

  // Animar contador
  animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return; // Adicionado check para evitar erro se elemento não existir
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
  // Removido: Limpeza de botões de filtro
  // document.querySelectorAll(".filter-btn").forEach((btn) => {
  //   btn.classList.remove("active");
  // });
  // document
  //   .querySelector('.filter-btn[data-filter="all"]')
  //   .classList.add("active");

  if (window.teamManager) {
    window.teamManager.searchTerm = "";
    // window.teamManager.currentFilter = "all"; // Removido
    window.teamManager.filterTeam();
  }
}

// Removido: CSS adicional para os botões de filtro, pois os botões foram removidos
// const additionalStyles = `
//     .filter-btn {
//         background: white;
//         color: #6b7280;
//         border: 2px solid #e5e7eb;
//         padding: 0.75rem 1.5rem;
//         border-radius: 9999px;
//         font-weight: 600;
//         transition: all 0.3s ease;
//         cursor: pointer;
//     }

//     .filter-btn:hover {
//         border-color: #e71f5d;
//         color: #e71f5d;
//         transform: translateY(-2px);
//     }

//     .filter-btn.active {
//         background: #e71f5d;
//         color: white;
//         border-color: #e71f5d;
//         box-shadow: 0 4px 12px rgba(231, 31, 93, 0.3);
//     }
// `;

// Removido: Injeção de estilos adicionais
// const styleSheet = document.createElement("style");
// styleSheet.textContent = additionalStyles;
// document.head.appendChild(styleSheet);

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.teamManager = new TeamManager();
});
