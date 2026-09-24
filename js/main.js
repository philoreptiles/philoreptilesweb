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
     1. NAVBAR: sombra al hacer scroll
     ============================================ */
  const mainHeader = document.querySelector('.main-header');

  if (mainHeader) {
    const updateHeaderShadow = () => {
      mainHeader.classList.toggle('scrolled', window.scrollY > 20);
    };
    updateHeaderShadow();
    window.addEventListener('scroll', updateHeaderShadow, { passive: true });
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
     ============================================ */
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  const closeMobileMenu = () => {
    if (!menuToggle || !mainNav) return;
    mainNav.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  const openMobileMenu = () => {
    if (!menuToggle || !mainNav) return;
    mainNav.classList.add('open');
    menuToggle.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
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
    document.addEventListener('click', (event) => {
      const clickedInsideNav = mainNav.contains(event.target);
      const clickedToggle = menuToggle.contains(event.target);
      if (!clickedInsideNav && !clickedToggle && mainNav.classList.contains('open')) {
        closeMobileMenu();
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
     6. INIT — sistema de tabs (setup inicial)
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

});

/* ============================================
   5. SISTEMA DE TABS (solo en páginas que lo usen)
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
