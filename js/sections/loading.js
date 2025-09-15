// Gerenciamento de Loading
const LoadingManager = {
  init() {
    window.addEventListener("load", () => {
      setTimeout(() => {
        const spinner = document.getElementById("loading-spinner");
        if (spinner) {
          spinner.style.opacity = "0";
          setTimeout(() => {
            spinner.style.display = "none";
          }, 300);
        }
      }, 500);
    });
  },
};
