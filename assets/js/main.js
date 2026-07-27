/* ═══════════════════════════════════════
   SEKAR JAGAD 43 — App Script
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ══ Utils ══
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ══ Navbar scroll ══
  const navbar = $('#navbar');
  let ticking = false;

  const handleScroll = () => {
    const scrolled = window.scrollY > 40;
    if (navbar) {
      navbar.classList.toggle('scrolled', scrolled);
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });

  // ══ Mobile nav toggle ══
  const navToggle = $('#navToggle');
  const navMenu = $('#navMenu');
  const navLinks = $$('.nav-link');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isActive = navMenu.classList.toggle('active');
      navToggle.classList.toggle('active', isActive);
      navToggle.setAttribute('aria-expanded', isActive);
    });

    // close on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ══ Active nav link on scroll (index.html only) ══
  const sections = $$('section[id]');

  if (sections.length > 0) {
    const updateActive = () => {
      let current = '';
      const scrollY = window.scrollY + 120;

      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollY >= top && scrollY < top + height) {
          current = section.id;
        }
      });

      // internal links only
      const internalLinks = navLinks.filter(l => l.getAttribute('href').startsWith('#'));
      internalLinks.forEach(l => l.classList.remove('active'));
      internalLinks.forEach(l => {
        if (l.getAttribute('href') === '#' + current) {
          l.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

  // ══ Counter animation ══
  const counters = $$('.stat-number');

  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        animateCounter(el, target);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));

    function animateCounter(el, target) {
      if (isNaN(target)) return;
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 50));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          el.textContent = target.toLocaleString();
          clearInterval(timer);
        } else {
          el.textContent = current;
        }
      }, 20);
    }
  }

  // ══ Scroll reveal (non-gated — content visible before JS) ══
  const revealElements = $$('.js-reveal');

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ══ FAQ accordion ══
  const faqItems = $$('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.getAttribute('aria-expanded') === 'true';
      faqItems.forEach(i => i.setAttribute('aria-expanded', 'false'));
      item.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // ══ Back to top ══
  const backToTop = $('#backToTop');

  if (backToTop) {
    let bttTicking = false;
    const toggleBtt = () => {
      backToTop.classList.toggle('show', window.scrollY > 500);
      bttTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!bttTicking) {
        requestAnimationFrame(toggleBtt);
        bttTicking = true;
      }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ══ Smooth scroll for hash links (internal only) ══
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ══ Gallery scroll buttons ══
  const galleryScroll = $('#galleryScroll');
  const prevBtn = $('.gallery-prev');
  const nextBtn = $('.gallery-next');

  if (galleryScroll && prevBtn && nextBtn) {
    const scrollAmount = () => {
      const item = galleryScroll.querySelector('.gallery-item');
      return item ? item.offsetWidth + 24 : 380;
    };

    prevBtn.addEventListener('click', () => {
      galleryScroll.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      galleryScroll.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });
  }
});
