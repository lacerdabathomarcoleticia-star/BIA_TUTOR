document.addEventListener('DOMContentLoaded', () => {
  /* 1. WEBDOOR CAROUSEL */
  const webdoor = document.getElementById('webdoor-1');
  if (webdoor) {
    const wrapper = webdoor.querySelector('.swiper-wrapper');
    const slides = webdoor.querySelectorAll('.swiper-slide');
    let current = 0;
    let timer = null;

    const goWebdoor = (idx) => {
      current = (idx + slides.length) % slides.length;
      wrapper.style.transform = `translate3d(-${current * 100}%, 0, 0)`;
      clearInterval(timer);
      timer = setInterval(() => goWebdoor(current + 1), 6000);
    };

    webdoor.querySelectorAll('[data-carousel-prev-webdoor]').forEach((btn) => {
      btn.addEventListener('click', () => goWebdoor(current - 1));
    });
    webdoor.querySelectorAll('[data-carousel-next-webdoor]').forEach((btn) => {
      btn.addEventListener('click', () => goWebdoor(current + 1));
    });

    timer = setInterval(() => goWebdoor(current + 1), 6000);
  }

  /* 2. HORIZONTAL CAROUSELS (CURSOS, TRILHAS, PARCERIAS) */
  function initCarousel({ containerSel, prevSel, nextSel, pagSel, barSel }) {
    const container = document.querySelector(containerSel);
    if (!container) return;
    const wrapper = container.querySelector('.swiper-wrapper');
    const slides = container.querySelectorAll('.swiper-slide');
    const prevBtn = document.querySelector(prevSel);
    const nextBtn = document.querySelector(nextSel);
    const pagEl = document.querySelector(pagSel);
    const barEl = document.querySelector(barSel);
    if (!wrapper || !slides.length) return;

    let page = 0;

    const getMetrics = () => {
      const slideWidth = slides[0].getBoundingClientRect().width + 20;
      const visible = Math.max(1, Math.floor(container.getBoundingClientRect().width / slideWidth));
      const totalPages = Math.max(1, Math.ceil(slides.length / visible));
      return { slideWidth, visible, totalPages };
    };

    const render = () => {
      const { slideWidth, visible, totalPages } = getMetrics();
      if (page >= totalPages) page = totalPages - 1;
      const offset = page * visible * slideWidth;
      const maxOffset = Math.max(0, wrapper.scrollWidth - container.clientWidth);
      const clamped = Math.min(offset, maxOffset);
      wrapper.style.transform = `translate3d(-${clamped}px, 0, 0)`;

      if (pagEl) {
        pagEl.innerHTML = `<span class="swiper-pagination-current">${page + 1}</span>/<span class="swiper-pagination-total">${totalPages}</span>`;
      }
      if (barEl) {
        let track = barEl.querySelector('.carousel-bar, .o-trails_track');
        if (!track) {
          track = document.createElement('span');
          track.className = 'carousel-bar';
          barEl.textContent = '';
          barEl.appendChild(track);
        }
        const pct = ((page + 1) / totalPages) * 100;
        track.style.width = `${pct}%`;
      }
    };

    if (prevBtn) prevBtn.addEventListener('click', () => { page = Math.max(0, page - 1); render(); });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      const { totalPages } = getMetrics();
      page = Math.min(totalPages - 1, page + 1);
      render();
    });

    window.addEventListener('resize', render);
    render();
  }

  initCarousel({
    containerSel: '.o-access_tabs [data-component="carousel"]',
    prevSel: '[data-carousel-mostaccess-prev]',
    nextSel: '[data-carousel-mostaccess-next]',
    pagSel: '[data-carousel-mostaccess-pagination]',
    barSel: '[data-carousel-mostaccess-bar]',
  });

  initCarousel({
    containerSel: '.o-trails_carousel-wrp',
    prevSel: '[data-carousel-prev-trails]',
    nextSel: '[data-carousel-next-trails]',
    pagSel: '.o-trails_pagination',
    barSel: '.o-trails_bar',
  });

  initCarousel({
    containerSel: '.o-partnerships_carousel-container',
    prevSel: '[data-carousel-partnerships-prev]',
    nextSel: '[data-carousel-partnerships-next]',
    pagSel: '[data-carousel-partnerships-pagination]',
    barSel: '[data-carousel-partnerships-bar]',
  });

  /* 3. MODAIS (LOGIN, CURSOS, AJUDA, CHAT) */
  function openModalById(id) {
    closeAllModals();
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('is-open', '-active');
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.t-modal.is-open, .t-modal.-active').forEach((m) => {
      m.classList.remove('is-open', '-active');
    });
  }

  document.querySelectorAll('a[href="#menu-de-acesso"], a[href="#cursos"], a[href="#ajuda"], a[href="/entrar"], a[href^="/cadastro"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      let target = 'menu-de-acesso';
      if (href === '#cursos') target = 'cursos';
      else if (href === '#ajuda') target = 'ajuda';
      e.preventDefault();
      openModalById(target);
    });
  });

  document.querySelectorAll('[halley-modal-close]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      closeAllModals();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  /* 4. FAVORITAR (HEART TOGGLE) */
  document.querySelectorAll('.a-favorite').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.classList.toggle('-active');
    });
  });

  /* 5. ACCORDION (FAQ & FOOTER) */
  document.querySelectorAll('[data-component="accordion"]').forEach((acc) => {
    const btn = acc.querySelector('[data-accordion-button]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      acc.classList.toggle('is-open');
    });
  });

  /* 6. FLOATING LABELS & LOGIN VALIDATION */
  document.querySelectorAll('.m-input_input').forEach((input) => {
    const field = input.closest('.m-input_field');
    const sync = () => {
      if (field) field.classList.toggle('-filled', input.value.trim().length > 0);
    };
    input.addEventListener('input', sync);
    sync();
  });

  const loginEmail = document.querySelector('[data-login-email]');
  const loginPass = document.querySelector('[data-login-password]');
  const loginCta = document.querySelector('.m-access_login-cta');
  if (loginEmail && loginPass && loginCta) {
    const validateLogin = () => {
      const ok = loginEmail.value.trim().length > 0 && loginPass.value.trim().length > 0;
      loginCta.disabled = !ok;
      loginCta.classList.toggle('--disabled', !ok);
    };
    loginEmail.addEventListener('input', validateLogin);
    loginPass.addEventListener('input', validateLogin);
  }
});
