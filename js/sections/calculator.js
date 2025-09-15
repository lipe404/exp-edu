// Calculadora de Rentabilidade - Seção Simulação de Ganhos
const ProfitabilityCalculator = {
  init() {
    this.studentCountSlider = document.getElementById("student-count");
    this.studentDisplay = document.getElementById("student-display");
    this.partnershipType = document.getElementById("partnership-type");
    this.ticketPrice = document.getElementById("ticket-price");

    this.grossRevenue = document.getElementById("gross-revenue");
    this.commission = document.getElementById("commission");
    this.operationalCosts = document.getElementById("operational-costs");
    this.netProfit = document.getElementById("net-profit");
    this.annualProfit = document.getElementById("annual-profit");

    if (!this.studentCountSlider) return;

    this.setupEventListeners();
    this.calculate(); // Cálculo inicial
  },

  setupEventListeners() {
    this.studentCountSlider.addEventListener("input", () => {
      this.updateStudentDisplay();
      this.calculate();
    });

    this.partnershipType.addEventListener("change", () => {
      this.updateStudentRange();
      this.calculate();
    });

    this.ticketPrice.addEventListener("change", () => {
      this.calculate();
    });
  },

  updateStudentDisplay() {
    const value = this.studentCountSlider.value;
    this.studentDisplay.textContent = value;
  },

  updateStudentRange() {
    const type = this.partnershipType.value;
    let min, max, defaultValue;

    switch (type) {
      case "small":
        min = 20;
        max = 50;
        defaultValue = 35;
        break;
      case "medium":
        min = 50;
        max = 150;
        defaultValue = 100;
        break;
      case "large":
        min = 150;
        max = 300;
        defaultValue = 200;
        break;
      default:
        min = 20;
        max = 300;
        defaultValue = 50;
    }

    this.studentCountSlider.min = min;
    this.studentCountSlider.max = max;
    this.studentCountSlider.value = defaultValue;
    this.updateStudentDisplay();
  },

  calculate() {
    const studentCount = parseInt(this.studentCountSlider.value);
    const ticketValue = parseInt(this.ticketPrice.value);

    // Cálculos
    const grossRevenue = studentCount * ticketValue;
    const commissionRate = 0.4; // 40% de comissão
    const commission = grossRevenue * commissionRate;

    // Custos operacionais baseados no número de alunos
    let operationalCosts;
    if (studentCount <= 50) {
      operationalCosts = Math.max(500, studentCount * 15);
    } else if (studentCount <= 150) {
      operationalCosts = Math.max(1000, studentCount * 12);
    } else {
      operationalCosts = Math.max(1500, studentCount * 10);
    }

    const netProfit = commission - operationalCosts;
    const annualProfit = netProfit * 12;

    // Atualizar display
    this.grossRevenue.textContent = `R\$ ${grossRevenue.toLocaleString(
      "pt-BR"
    )}`;
    this.commission.textContent = `R\$ ${commission.toLocaleString("pt-BR")}`;
    this.operationalCosts.textContent = `R\$ ${operationalCosts.toLocaleString(
      "pt-BR"
    )}`;
    this.netProfit.textContent = `R\$ ${netProfit.toLocaleString("pt-BR")}`;
    this.annualProfit.textContent = `R\$ ${annualProfit.toLocaleString(
      "pt-BR"
    )}`;

    // Analytics tracking
    if (typeof gtag !== "undefined") {
      gtag("event", "calculator_use", {
        student_count: studentCount,
        ticket_value: ticketValue,
        net_profit: netProfit,
      });
    }
  },
};
