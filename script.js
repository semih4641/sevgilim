/* ===================================
   Ela Nur - Anı Web Sitesi
   JavaScript - Animations, Media & Lightboxes
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- Loading Screen ---
  const loadingScreen = document.querySelector('.loading-screen');
  
  const hideLoading = () => {
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };

  window.addEventListener('load', () => {
    setTimeout(hideLoading, 1200);
  });

  // Fallback: hide loading screen after 3s max
  setTimeout(hideLoading, 3000);

  // --- Navigation Scroll Effect ---
  const nav = document.querySelector('.nav');
  let lastScrollY = 0;

  const handleScroll = () => {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScrollY = scrollY;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // --- Mobile Menu ---
  const menuBtn = document.querySelector('.nav-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // --- Scroll Reveal Animations ---
  const setupRevealObserver = () => {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  };

  setupRevealObserver();

  // --- Hero Parallax ---
  const heroBg = document.querySelector('.hero-bg img');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBg.style.transform = `scale(1.1) translateY(${scrollY * 0.25}px)`;
      }
    }, { passive: true });
  }

  // --- Particle System for Hero ---
  const particleContainer = document.querySelector('.hero-particles');
  if (particleContainer) {
    const count = window.innerWidth < 768 ? 20 : 35;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 3 + 1;
      const duration = Math.random() * 4 + 2;
      const delay = Math.random() * 5;
      particle.style.cssText = `
        left: ${x}%;
        top: ${y}%;
        width: ${size}px;
        height: ${size}px;
        --duration: ${duration}s;
        --delay: ${delay}s;
        opacity: ${Math.random() * 0.4 + 0.1};
      `;
      particleContainer.appendChild(particle);
    }
  }

  // --- Ambient Glow Mouse Follow ---
  const ambientGlows = document.querySelectorAll('.ambient-glow');
  if (ambientGlows.length && window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      ambientGlows.forEach((glow, index) => {
        const offsetX = (x - 0.5) * (index === 0 ? 80 : -80);
        const offsetY = (y - 0.5) * (index === 0 ? 60 : -60);
        glow.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });
    }, { passive: true });
  }

  // --- Smooth Scroll for Nav Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offsetTop = target.offsetTop - 70;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ===================================
  // MEDIA RENDERING (ALBUMS & VIDEOS)
  // ===================================
  let allLightboxImages = []; // List of all images on page for gallery browsing
  let currentLightboxIndex = 0;

  const renderAlbumGalleries = () => {
    if (typeof MEDIA_DATA === 'undefined' || !MEDIA_DATA.albums) return;

    allLightboxImages = [];

    MEDIA_DATA.albums.forEach(album => {
      const container = document.getElementById(`gallery-${album.id}`);
      if (!container) return;

      const photos = album.photos || [];
      if (photos.length === 0) return;

      // Header with count
      const header = document.createElement('div');
      header.className = 'album-gallery-header reveal';
      header.innerHTML = `
        <div class="album-gallery-title">
          <span>📷</span> ${album.name} Koleksiyonu
        </div>
        <div class="album-gallery-count">${photos.length} Fotoğraf</div>
      `;
      container.appendChild(header);

      // Grid
      const grid = document.createElement('div');
      grid.className = 'album-gallery-grid';
      container.appendChild(grid);

      // Progressive limits for albums with many photos
      const INITIAL_DISPLAY_COUNT = 16;
      const hasMore = photos.length > INITIAL_DISPLAY_COUNT;

      photos.forEach((photo, idx) => {
        const item = document.createElement('div');
        item.className = 'album-photo-item reveal-scale';
        if (photo.isDuplicate) item.classList.add('has-duplicate');
        item.setAttribute('data-path', photo.path);
        item.setAttribute('data-hash', photo.hash);
        item.setAttribute('data-album', album.name);
        item.setAttribute('data-index', idx);

        if (hasMore && idx >= INITIAL_DISPLAY_COUNT) {
          item.style.display = 'none';
          item.classList.add('photo-item-hidden');
        }

        const safeSrc = encodeURI(photo.path);
        const dupBadgeHtml = photo.isDuplicate 
          ? `<span class="photo-badge-dup" title="Eşi: ${photo.duplicateOf.join(', ')}">⚠️ Çift / Kopya</span>` 
          : '';

        item.innerHTML = `
          <img src="${safeSrc}" alt="${album.name} - ${photo.filename}" loading="lazy">
        `;

        // Click to view in Lightbox
        item.querySelector('img').addEventListener('click', () => {
          openLightboxByPath(photo.path);
        });

        grid.appendChild(item);
        allLightboxImages.push({
          path: photo.path,
          album: album.name,
          filename: photo.filename
        });
      });

      // Expand / More Button if photos > 16
      if (hasMore) {
        const remaining = photos.length - INITIAL_DISPLAY_COUNT;
        const expandWrapper = document.createElement('div');
        expandWrapper.className = 'album-expand-wrapper';

        const moreBtn = document.createElement('button');
        moreBtn.className = 'album-more-btn';
        moreBtn.innerHTML = `<span>✨ Tüm Fotoğrafları Göster (+${remaining} Fotoğraf)</span>`;
        
        moreBtn.addEventListener('click', () => {
          grid.querySelectorAll('.photo-item-hidden').forEach(el => {
            el.style.display = '';
            el.classList.remove('photo-item-hidden');
          });
          expandWrapper.remove();

        });

        expandWrapper.appendChild(moreBtn);
        container.appendChild(expandWrapper);
      }
    });

    // Make hero/trip card cover images also clickable in lightbox
    document.querySelectorAll('.trip-image-wrapper img').forEach(img => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
        openLightboxBySrc(img.src);
      });
    });
  };

  // --- Render Video Gallery ---
  const renderVideoGallery = () => {
    if (typeof MEDIA_DATA === 'undefined' || !MEDIA_DATA.videos) return;
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) return;

    MEDIA_DATA.videos.forEach((vid, idx) => {
      const card = document.createElement('div');
      card.className = 'video-card reveal-scale';
      const safeSrc = encodeURI(vid.path);

      card.innerHTML = `
        <div class="video-thumb-wrapper">
          <video src="${safeSrc}#t=0.5" preload="metadata" muted playsinline></video>
          <div class="video-play-icon">▶</div>
        </div>
        <div class="video-info">
          <div class="video-title">${vid.title}</div>
          <div class="video-meta">
            <span>Hatıra #${idx + 1}</span>
            <span class="video-size-badge">${vid.sizeMb} MB</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openVideoLightbox(safeSrc);
      });

      videoGrid.appendChild(card);
    });
  };

  // ===================================
  // LIGHTBOX LOGIC (PHOTOS & VIDEOS)
  // ===================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  const updateLightboxContent = () => {
    if (!allLightboxImages.length || !lightboxImg) return;
    const current = allLightboxImages[currentLightboxIndex];
    if (!current) return;

    lightboxImg.src = encodeURI(current.path);
    if (lightboxCaption) {
      lightboxCaption.textContent = `${current.album} — ${current.filename}`;
    }
    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${allLightboxImages.length}`;
    }
  };

  const openLightboxByPath = (path) => {
    const idx = allLightboxImages.findIndex(img => img.path === path);
    if (idx !== -1) {
      currentLightboxIndex = idx;
    } else {
      currentLightboxIndex = 0;
    }
    updateLightboxContent();
    if (lightbox) {
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const openLightboxBySrc = (src) => {
    // If src matches one of our images, open index, otherwise open directly
    const foundIdx = allLightboxImages.findIndex(img => src.includes(encodeURI(img.path)) || src.includes(img.path));
    if (foundIdx !== -1) {
      currentLightboxIndex = foundIdx;
      updateLightboxContent();
    } else if (lightboxImg) {
      lightboxImg.src = src;
      if (lightboxCaption) lightboxCaption.textContent = '';
      if (lightboxCounter) lightboxCounter.textContent = '1 / 1';
    }
    if (lightbox) {
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeLightbox = () => {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  const showPrevLightbox = () => {
    if (!allLightboxImages.length) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + allLightboxImages.length) % allLightboxImages.length;
    updateLightboxContent();
  };

  const showNextLightbox = () => {
    if (!allLightboxImages.length) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % allLightboxImages.length;
    updateLightboxContent();
  };

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrevLightbox(); });
  if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNextLightbox(); });
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // --- Video Lightbox ---
  const videoLightbox = document.getElementById('videoLightbox');
  const videoPlayer = document.getElementById('videoLightboxPlayer');
  const videoClose = document.getElementById('videoLightboxClose');

  const pauseBgMusic = () => {
    const bg = document.getElementById('bgMusic');
    if (bg && !bg.paused) {
      bg.pause();
    }
  };

  const resumeBgMusic = () => {
    const bg = document.getElementById('bgMusic');
    if (videoLightbox && videoLightbox.classList.contains('active')) return;
    if (bg && bg.paused) {
      bg.play().catch(() => {});
    }
  };

  const openVideoLightbox = (src) => {
    if (!videoLightbox || !videoPlayer) return;
    pauseBgMusic();
    videoPlayer.src = src;
    videoLightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    videoPlayer.play().catch(() => {});
  };

  const closeVideoLightbox = () => {
    if (!videoLightbox || !videoPlayer) return;
    videoPlayer.pause();
    videoPlayer.src = '';
    videoLightbox.classList.remove('active');
    document.body.style.overflow = '';
    resumeBgMusic();
  };

  if (videoClose) videoClose.addEventListener('click', closeVideoLightbox);
  if (videoLightbox) {
    videoLightbox.addEventListener('click', (e) => {
      if (e.target === videoLightbox) closeVideoLightbox();
    });
  }

  // Universal Video Play/Pause Listeners for Background Music
  document.addEventListener('play', (e) => {
    if (e.target && e.target.tagName === 'VIDEO') {
      pauseBgMusic();
    }
  }, true);

  document.addEventListener('pause', (e) => {
    if (e.target && e.target.tagName === 'VIDEO') {
      resumeBgMusic();
    }
  }, true);

  document.addEventListener('ended', (e) => {
    if (e.target && e.target.tagName === 'VIDEO') {
      resumeBgMusic();
    }
  }, true);

  // Keyboard Navigation (Arrow Keys & Escape)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeVideoLightbox();
    } else if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'ArrowLeft') showPrevLightbox();
      if (e.key === 'ArrowRight') showNextLightbox();
    }
  });

  // --- Current Year in Footer ---
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ===================================
  // AUTOMATIC BACKGROUND MUSIC
  // ===================================
  const bgMusic = document.getElementById('bgMusic');

  const startMusic = () => {
    if (!bgMusic) return;
    if (videoLightbox && videoLightbox.classList.contains('active')) return;
    bgMusic.muted = false;
    bgMusic.volume = 1.0;
    const p = bgMusic.play();
    if (p !== undefined) {
      p.then(() => {
        removeInteractionListeners();
      }).catch(err => {
        // Browser requires first touch/click
      });
    }
  };

  const onFirstInteraction = () => {
    startMusic();
  };

  const interactionEvents = ['click', 'touchstart', 'pointerdown', 'keydown', 'scroll'];
  const addInteractionListeners = () => {
    interactionEvents.forEach(evt => {
      window.addEventListener(evt, onFirstInteraction, { passive: true });
    });
  };

  const removeInteractionListeners = () => {
    interactionEvents.forEach(evt => {
      window.removeEventListener(evt, onFirstInteraction);
    });
  };

  if (bgMusic) {
    startMusic();
    addInteractionListeners();
  }

  window.playBackgroundMusic = startMusic;

  // --- Execute Render ---
  renderAlbumGalleries();
  renderVideoGallery();
  setupRevealObserver();

  console.log('💛 Ela Nur için hazırlandı — Tüm fotoğraflar ve videolar yüklendi.');
});
