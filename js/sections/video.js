// Controle do vídeo com autoplay no scroll
document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("main-video");
  const poster = document.getElementById("video-poster");
  const overlay = document.getElementById("video-overlay");
  const playButton = document.getElementById("play-button");
  const playIcon = playButton.querySelector("i");
  const section = document.getElementById("sobre-educa-minas");

  let hasAutoPlayed = false;
  let isUserInteracting = false;

  // Função para iniciar o vídeo
  function playVideo() {
    poster.classList.add("hidden");
    video.classList.remove("hidden");
    overlay.classList.add("opacity-0", "pointer-events-none");

    // Tentar reproduzir o vídeo
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Autoplay funcionou
          updatePlayButton(false); // false = playing
        })
        .catch((error) => {
          // Autoplay bloqueado pelo navegador
          console.warn("Autoplay bloqueado:", error);
          showPlayButton();
        });
    }
  }

  // Função para pausar o vídeo
  function pauseVideo() {
    video.pause();
    overlay.classList.remove("opacity-0", "pointer-events-none");
    updatePlayButton(true); // true = paused
  }

  // Função para resetar o vídeo
  function resetVideo() {
    video.pause();
    video.currentTime = 0;
    video.classList.add("hidden");
    poster.classList.remove("hidden");
    overlay.classList.remove("opacity-0", "pointer-events-none");
    updatePlayButton(true); // true = paused
    hasAutoPlayed = false;
  }

  // Função para atualizar o botão play/pause
  function updatePlayButton(isPaused) {
    if (isPaused) {
      playIcon.className = "fas fa-play text-educa-pink text-xl ml-1";
      playButton.title = "Reproduzir Vídeo";
    } else {
      playIcon.className = "fas fa-pause text-educa-pink text-xl";
      playButton.title = "Pausar Vídeo";
    }
  }

  // Função para mostrar o botão play quando autoplay falha
  function showPlayButton() {
    overlay.classList.remove("opacity-0", "pointer-events-none");
    overlay.style.opacity = "1";
    updatePlayButton(true);
  }

  // Intersection Observer para autoplay quando a seção aparecer
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5, // 50% da seção visível
  };

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !hasAutoPlayed && !isUserInteracting) {
        // Delay para sincronizar com a animação da seção
        setTimeout(() => {
          if (entry.target.classList.contains("active")) {
            hasAutoPlayed = true;
            playVideo();
          }
        }, 800); // Aguarda a animação da seção (0.8s)
      }
    });
  }, observerOptions);

  // Observar a seção
  if (section) {
    videoObserver.observe(section);
  }

  // Event listener para o botão play/pause
  playButton.addEventListener("click", function (e) {
    e.stopPropagation();
    isUserInteracting = true;

    if (video.paused) {
      playVideo();
    } else {
      pauseVideo();
    }
  });

  // Event listener para quando o vídeo termina
  video.addEventListener("ended", function () {
    // Após terminar, permite que o usuário clique para reproduzir novamente
    overlay.classList.remove("opacity-0", "pointer-events-none");
    updatePlayButton(true);

    // Opcional: resetar completamente após 3 segundos
    setTimeout(() => {
      if (video.paused) {
        resetVideo();
      }
    }, 3000);
  });

  // Event listener para clique no vídeo (play/pause)
  video.addEventListener("click", function () {
    isUserInteracting = true;

    if (video.paused) {
      playVideo();
    } else {
      pauseVideo();
    }
  });

  // Event listeners para mostrar/esconder overlay no hover
  video.addEventListener("mouseenter", function () {
    if (!video.paused) {
      overlay.classList.remove("opacity-0", "pointer-events-none");
    }
  });

  video.addEventListener("mouseleave", function () {
    if (!video.paused && isUserInteracting) {
      overlay.classList.add("opacity-0", "pointer-events-none");
    }
  });

  // Event listener para detectar quando o vídeo realmente começa a reproduzir
  video.addEventListener("playing", function () {
    updatePlayButton(false);
  });

  // Event listener para quando o vídeo é pausado
  video.addEventListener("pause", function () {
    updatePlayButton(true);
  });

  // Event listener para erros de vídeo
  video.addEventListener("error", function (e) {
    console.error("❌ Erro no vídeo:", e);
    showPlayButton();
  });

  // Configurações de vídeo para melhor autoplay
  video.muted = true; // Necessário para autoplay em muitos navegadores
  video.playsInline = true; // Para dispositivos móveis
  video.preload = "metadata"; // Carrega metadados

  // Função para verificar se o vídeo pode ser reproduzido automaticamente
  function checkAutoplaySupport() {
    const testVideo = document.createElement("video");
    testVideo.muted = true;
    testVideo.playsInline = true;

    const canAutoplay = testVideo.play();

    if (canAutoplay !== undefined) {
      canAutoplay
        .then(() => {
          console.log("Autoplay suportado");
          testVideo.pause();
        })
        .catch(() => {
          console.warn("Autoplay não suportado");
        });
    }
  }

  // Verificar suporte ao autoplay
  checkAutoplaySupport();

  // Função para reativar autoplay se o usuário sair e voltar para a seção
  function handleVisibilityChange() {
    if (document.hidden) {
      if (!video.paused) {
        pauseVideo();
      }
    }
  }

  // Event listener para mudança de visibilidade da página
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Função para lidar com scroll para fora da seção
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting && !video.paused && !isUserInteracting) {
          // Se o usuário não interagiu e saiu da seção, pausa o vídeo
          pauseVideo();
        }
      });
    },
    { threshold: 0.1 }
  );

  if (section) {
    sectionObserver.observe(section);
  }
});
