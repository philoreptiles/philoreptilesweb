/* ==========================================================================
   main.js — Philoreptiles
   JavaScript vanilla compartido por todas las páginas del sitio.
   No asume qué elementos existen en la página actual: todo se verifica
   antes de manipularse, así que este mismo archivo puede cargarse en
   index.html, blog.html, boas.html, boas/*.html o posts/*.html sin romper.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================
     1. NAVBAR: estado transparente / sólido según scroll
     HEADER APPLE:
     - En páginas con .hero (solo index): la navbar arranca
       transparente (.transparent) y, al llegar a 20px de scroll,
       pierde .transparent y gana .scrolled. Al volver arriba se
       revierte.
     - En páginas sin .hero: siempre .scrolled (sólido) y nunca
       .transparent.
     ============================================ */
  const mainHeader = document.querySelector('.main-header');
  const hasHero = !!document.querySelector('.hero');

  if (mainHeader) {
    const updateHeaderState = () => {
      if (hasHero) {
        const isScrolled = window.scrollY >= 20;
        mainHeader.classList.toggle('transparent', !isScrolled);
        mainHeader.classList.toggle('scrolled', isScrolled);
      } else {
        mainHeader.classList.remove('transparent');
        mainHeader.classList.add('scrolled');
      }
    };
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
  }

  /* ============================================
     2. DROPDOWN DE "BOAS"
     El <a class="nav-link"> y el <button class="dropdown-toggle">
     son HERMANOS:
     - El <a> nunca lleva listener de click — navega siempre a
       boas.html de forma nativa, sin preventDefault, en desktop
       y en móvil.
     - El <button> (la flecha) es el ÚNICO que abre/cierra el
       submenú, con click, igual en desktop y en móvil. En
       desktop además se abre con :hover vía CSS puro.
     ============================================ */
  const dropdowns = document.querySelectorAll('.dropdown');

  const closeDropdown = (dropdown) => {
    if (!dropdown) return;
    dropdown.classList.remove('open');
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  };

  const closeAllDropdowns = (except) => {
    dropdowns.forEach((dropdown) => {
      if (dropdown !== except) closeDropdown(dropdown);
    });
  };

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (!toggle) return;

    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', (event) => {
      // El botón nunca navega; solo abre/cierra el submenú.
      event.preventDefault();
      event.stopPropagation();

      const isOpen = dropdown.classList.contains('open');
      closeAllDropdowns(dropdown);

      if (isOpen) {
        closeDropdown(dropdown);
      } else {
        dropdown.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Cierra cualquier dropdown abierto al hacer click fuera de él
  // (incluye clicks sobre el propio enlace "Boas", que navega y
  // no necesita mantener el submenú abierto).
  document.addEventListener('click', (event) => {
    dropdowns.forEach((dropdown) => {
      if (!dropdown.contains(event.target)) {
        closeDropdown(dropdown);
      }
    });
  });

  // Cierra cualquier dropdown abierto si la ventana cambia de tamaño
  // (evita que quede "pegado" al cruzar el breakpoint móvil/desktop)
  window.addEventListener('resize', () => {
    closeAllDropdowns();
  });

  /* ============================================
     3. MENÚ HAMBURGUESA (móvil)
     HEADER APPLE: el panel se despliega desde arriba con animación
     CSS (~300ms). Al abrirse:
     - .main-nav y .menu-toggle reciben .open
     - .main-header recibe .menu-open (header sólido aunque esté
       en estado .transparent)
     - se muestra un fondo oscurecido (div.nav-backdrop) detrás
     - el botón cambia de ☰ a ✕ y actualiza su aria-label
     ============================================ */
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  // Fondo oscurecido detrás del panel (solo se ve en móvil, ver CSS).
  let navBackdrop = null;
  if (menuToggle && mainNav) {
    navBackdrop = document.createElement('div');
    navBackdrop.className = 'nav-backdrop';
    navBackdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(navBackdrop);
  }

  const closeMobileMenu = () => {
    if (!menuToggle || !mainNav) return;
    mainNav.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
    menuToggle.textContent = '☰';
    if (mainHeader) mainHeader.classList.remove('menu-open');
    if (navBackdrop) navBackdrop.classList.remove('visible');
  };

  const openMobileMenu = () => {
    if (!menuToggle || !mainNav) return;
    mainNav.classList.add('open');
    menuToggle.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Cerrar menú');
    menuToggle.textContent = '✕';
    if (mainHeader) mainHeader.classList.add('menu-open');
    if (navBackdrop) navBackdrop.classList.add('visible');
  };

  if (menuToggle && mainNav) {
    menuToggle.setAttribute('aria-controls', mainNav.id || 'main-nav');

    menuToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = mainNav.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Cierra el menú al hacer click en cualquier enlace dentro de .main-nav
    // (incluye el <a> "Boas": navega y, de paso, cierra el menú móvil;
    // el botón-flecha no es un <a> así que no dispara este listener).
    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Cierra el menú móvil si la ventana pasa a desktop
    // (el cierre de dropdowns en resize ya lo gestiona el bloque anterior)
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) {
        closeMobileMenu();
      }
    });

    // Cierra el menú si el usuario hace click fuera de la navbar
    // (incluye el click sobre el fondo oscurecido)
    document.addEventListener('click', (event) => {
      const clickedInsideNav = mainNav.contains(event.target);
      const clickedToggle = menuToggle.contains(event.target);
      if (!clickedInsideNav && !clickedToggle && mainNav.classList.contains('open')) {
        closeMobileMenu();
      }
    });

    // Cierra el menú con la tecla Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mainNav.classList.contains('open')) {
        closeMobileMenu();
        menuToggle.focus();
      }
    });
  }

  /* ============================================
     4. ANIMACIONES DE ENTRADA AL HACER SCROLL
     ============================================ */
  const revealTargets = document.querySelectorAll('.reveal');
  const staggerTargets = document.querySelectorAll('.stagger');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('visible'));
    staggerTargets.forEach((el) => el.classList.add('visible'));
  } else {
    if (revealTargets.length) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      revealTargets.forEach((el) => revealObserver.observe(el));
    }

    if (staggerTargets.length) {
      const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            staggerObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      staggerTargets.forEach((el) => staggerObserver.observe(el));
    }
  }

  /* ============================================
     5. INIT — SISTEMA DE TABS (setup inicial)
     ============================================ */
  const tabButtons = document.querySelectorAll('.species-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  if (tabButtons.length && tabPanels.length) {
    tabButtons.forEach((btn) => {
      btn.setAttribute('role', 'tab');
      const isActive = btn.classList.contains('active-tab');
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    tabPanels.forEach((panel) => {
      const isActive = panel.classList.contains('active-panel');
      panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  }

  /* ============================================
     6. CARRUSELES HORIZONTALES ESTILO APPLE
     Manejo interactivo de carruseles con scroll-snap:
     - Generación dinámica de dots por cada item si existe el contenedor.
     - Navegación mediante flechas (si existen) y dots con scroll suave.
     - Detección segura del item activo alineado al viewport del track.
     - Verificación defensiva antes de agregar listeners de flechas.
     - Respeto de prefers-reduced-motion.
     ============================================ */
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach((carousel) => {
    const track = carousel.querySelector('.carousel-track');
    if (!track) return;

    const items = track.querySelectorAll('.carousel-item');
    if (!items.length) return;

    // CORRECCIÓN PROBLEMA 3: Verificación condicional de existencia de elementos
    const prevBtn = carousel.querySelector('.carousel-arrow-prev');
    const nextBtn = carousel.querySelector('.carousel-arrow-next');
    const dotsContainer = carousel.querySelector('.carousel-dots');

    // 1. Generar dots dinámicamente solo si existe el contenedor en el DOM
    const dots = [];
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      items.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (idx === 0 ? ' active' : '');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Ir a la diapositiva ${idx + 1}`);
        dot.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => {
          scrollToIndex(idx);
        });
        dotsContainer.appendChild(dot);
        dots.push(dot);
      });
    }

    // 2. Desplazar a un item específico respetando prefers-reduced-motion
    function scrollToIndex(index) {
      if (index < 0 || index >= items.length) return;
      items[index].scrollIntoView({
        behavior: prefersReducedMotion ? 'instant' : 'smooth',
        inline: 'start',
        block: 'nearest'
      });
    }

    // 3. Obtener el índice del item visible alineado al inicio del contenedor
    function getCurrentIndex() {
      const trackLeft = track.getBoundingClientRect().left;
      let closestIndex = 0;
      let minDistance = Infinity;

      items.forEach((item, index) => {
        const itemLeft = item.getBoundingClientRect().left;
        const distance = Math.abs(itemLeft - trackLeft);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      return closestIndex;
    }

    // 4. Actualizar interfaz (dots y estado de flechas si existen)
    function updateUI() {
      const currentIndex = getCurrentIndex();

      // Actualizar estado de dots si existen
      if (dots.length) {
        dots.forEach((dot, idx) => {
          const isActive = idx === currentIndex;
          dot.classList.toggle('active', isActive);
          dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
      }

      // Detectar extremos del scroll para deshabilitar flechas si existen en el DOM
      const isAtStart = track.scrollLeft <= 10;
      const isAtEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;

      if (prevBtn) {
        prevBtn.disabled = isAtStart;
        prevBtn.classList.toggle('disabled', isAtStart);
      }
      if (nextBtn) {
        nextBtn.disabled = isAtEnd;
        nextBtn.classList.toggle('disabled', isAtEnd);
      }
    }

    // 5. Listeners de clic en flechas (solo si existen)
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const currentIndex = getCurrentIndex();
        if (currentIndex > 0) {
          scrollToIndex(currentIndex - 1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const currentIndex = getCurrentIndex();
        if (currentIndex < items.length - 1) {
          scrollToIndex(currentIndex + 1);
        }
      });
    }

    // 6. Listener de scroll optimizado con requestAnimationFrame
    let isTicking = false;
    track.addEventListener('scroll', () => {
      if (!isTicking) {
        window.requestAnimationFrame(() => {
          updateUI();
          isTicking = false;
        });
        isTicking = true;
      }
    }, { passive: true });

    // 7. Recalcular al cambiar el tamaño de ventana
    window.addEventListener('resize', updateUI, { passive: true });

    // Estado inicial
    updateUI();
  });

});

/* ============================================
   7. SISTEMA DE TABS (solo en páginas que lo usen)
   Global para poder invocarse con onclick inline en el HTML.
   ============================================ */
window.switchTab = function switchTab(event, tabId) {
  const clickedButton = event ? event.currentTarget : null;
  const tabButtons = document.querySelectorAll('.species-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Si la página no tiene sistema de tabs, no hace nada.
  if (!tabButtons.length || !tabPanels.length) return;

  const targetPanel = document.getElementById(tabId);
  if (!targetPanel) return;

  tabPanels.forEach((panel) => {
    const isTarget = panel === targetPanel;
    panel.classList.toggle('active-panel', isTarget);
    panel.setAttribute('aria-hidden', isTarget ? 'false' : 'true');
  });

  tabButtons.forEach((btn) => {
    const isClicked = btn === clickedButton;
    btn.classList.toggle('active-tab', isClicked);
    btn.setAttribute('aria-selected', isClicked ? 'true' : 'false');
  });

  targetPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
};