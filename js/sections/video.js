// Controle do vídeo
document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("main-video");
  const poster = document.getElementById("video-poster");
  const overlay = document.getElementById("video-overlay");
  const playButton = document.getElementById("play-button");
  const playIcon = playButton.querySelector("i");

  // Função para iniciar o vídeo
  function playVideo() {
    poster.classList.add("hidden");
    video.classList.remove("hidden");
    overlay.classList.add("opacity-0", "pointer-events-none");
    video.play();

    // Muda o ícone para pause
    playIcon.className = "fas fa-pause text-educa-pink text-xl";
    playButton.title = "Pausar Vídeo";
  }

  // Função para pausar o vídeo
  function pauseVideo() {
    video.pause();
    overlay.classList.remove("opacity-0", "pointer-events-none");

    // Muda o ícone para play
    playIcon.className = "fas fa-play text-educa-pink text-xl ml-1";
    playButton.title = "Reproduzir Vídeo";
  }

  // Função para resetar o vídeo
  function resetVideo() {
    video.pause();
    video.currentTime = 0;
    video.classList.add("hidden");
    poster.classList.remove("hidden");
    overlay.classList.remove("opacity-0", "pointer-events-none");

    // Volta o ícone para play
    playIcon.className = "fas fa-play text-educa-pink text-xl ml-1";
    playButton.title = "Reproduzir Vídeo";
  }

  // Event listener para o botão play/pause
  playButton.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    } else {
      pauseVideo();
    }
  });

  // Event listener para quando o vídeo termina
  video.addEventListener("ended", function () {
    resetVideo();
  });

  // Event listener para clique no vídeo (play/pause)
  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    } else {
      pauseVideo();
    }
  });

  // Event listener para mostrar overlay quando o mouse está sobre o vídeo
  video.addEventListener("mouseenter", function () {
    if (!video.paused) {
      overlay.classList.remove("opacity-0", "pointer-events-none");
    }
  });

  // Event listener para esconder overlay quando o mouse sai do vídeo
  video.addEventListener("mouseleave", function () {
    if (!video.paused) {
      overlay.classList.add("opacity-0", "pointer-events-none");
    }
  });
});
