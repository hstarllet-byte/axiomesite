/* =========================================================================
   AXIOME — Script principal
   Curseur, particules, navigation, révélations au scroll, compteurs,
   filtres portfolio, carousel témoignages, accordéon FAQ, formulaires.
   ========================================================================= */
(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ---------------------------------------------------------------------
     1. CURSEUR PERSONNALISÉ
  --------------------------------------------------------------------- */
  if (!isTouch && !prefersReducedMotion) {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const interactiveSelectors = "a, button, input, textarea, .service-card, .portfolio-item, .about-card, .faq-question";
    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-active"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
    });
  }

  /* ---------------------------------------------------------------------
     2. PARTICULES DISCRÈTES (canvas, légères, non intrusives)
  --------------------------------------------------------------------- */
  (function particles() {
    const canvas = document.getElementById("particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height, particlesArr;
    const COUNT = prefersReducedMotion ? 0 : Math.min(60, Math.floor(window.innerWidth / 24));

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createParticles() {
      particlesArr = Array.from({ length: COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.4,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        o: Math.random() * 0.4 + 0.15,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      particlesArr.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(91, 140, 255, ${p.o})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    if (COUNT > 0) draw();
    window.addEventListener("resize", () => {
      resize();
      createParticles();
    });
  })();

  /* ---------------------------------------------------------------------
     3. NAVBAR — scroll, menu mobile
  --------------------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  let lastScroll = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    navbar.style.top = y > 80 && y > lastScroll ? "-100px" : "18px";
    lastScroll = y;

    // Bouton retour en haut
    backToTop.classList.toggle("is-visible", y > 600);
  }, { passive: true });

  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------------------------------------------------------------------
     4. RETOUR EN HAUT DE PAGE
  --------------------------------------------------------------------- */
  const backToTop = document.getElementById("backToTop");
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  /* ---------------------------------------------------------------------
     5. INDICATEUR DE DÉFILEMENT DU HERO
  --------------------------------------------------------------------- */
  const scrollCue = document.getElementById("scrollCue");
  if (scrollCue) {
    scrollCue.addEventListener("click", () => {
      document.getElementById("apropos").scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------------------------------------------------------------
     6. APPARITION DES ÉLÉMENTS AU SCROLL (IntersectionObserver)
  --------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // léger décalage pour un effet en cascade au sein d'une même grille
            const delay = (entry.target.dataset.delay || 0);
            setTimeout(() => entry.target.classList.add("is-visible"), delay);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el, i) => {
      el.dataset.delay = (i % 4) * 70;
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------------------
     7. COMPTEURS DE STATISTIQUES ANIMÉS
  --------------------------------------------------------------------- */
  const statValues = document.querySelectorAll(".stat-value");
  if (statValues.length && "IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    statValues.forEach((el) => countObserver.observe(el));
  }

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || "";
    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1600;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------------------
     8. PARALLAXE LÉGER SUR LES BLOBS DE FOND (au mouvement de souris)
  --------------------------------------------------------------------- */
  if (!isTouch && !prefersReducedMotion) {
    const blobs = document.querySelectorAll(".mesh-blob");
    window.addEventListener("mousemove", (e) => {
      const relX = (e.clientX / window.innerWidth - 0.5);
      const relY = (e.clientY / window.innerHeight - 0.5);
      blobs.forEach((blob, i) => {
        const strength = (i + 1) * 10;
        blob.style.marginLeft = `${relX * strength}px`;
        blob.style.marginTop = `${relY * strength}px`;
      });
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     9. EFFET LUMIÈRE SUR LES BOUTONS PRIMAIRES (suit le curseur)
  --------------------------------------------------------------------- */
  document.querySelectorAll(".btn-primary").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      btn.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  });

  /* ---------------------------------------------------------------------
     10. FILTRES PORTFOLIO
  --------------------------------------------------------------------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const portfolioItems = document.querySelectorAll(".portfolio-item");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      const filter = btn.dataset.filter;
      portfolioItems.forEach((item) => {
        const match = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("is-hidden", !match);
      });
    });
  });

  /* ---------------------------------------------------------------------
     11. CAROUSEL DE TÉMOIGNAGES
  --------------------------------------------------------------------- */
  (function testimonialCarousel() {
    const slides = document.querySelectorAll(".testimonial-slide");
    const dotsWrap = document.getElementById("testimonialDots");
    const prevBtn = document.getElementById("prevTestimonial");
    const nextBtn = document.getElementById("nextTestimonial");
    if (!slides.length) return;

    let current = 0;
    let timer = null;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", `Aller au témoignage ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap.querySelectorAll(".dot");

    function goTo(index) {
      slides[current].classList.remove("is-active");
      dots[current].classList.remove("is-active");
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      dots[current].classList.add("is-active");
      resetTimer();
    }

    prevBtn.addEventListener("click", () => goTo(current - 1));
    nextBtn.addEventListener("click", () => goTo(current + 1));

    function resetTimer() {
      if (prefersReducedMotion) return;
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), 7000);
    }
    resetTimer();
  })();

  /* ---------------------------------------------------------------------
     12. ACCORDÉON FAQ
  --------------------------------------------------------------------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // Ferme les autres items ouverts (accordéon exclusif)
      document.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("is-open");
          openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
          openItem.querySelector(".faq-answer").style.maxHeight = null;
        }
      });

      item.classList.toggle("is-open", !isOpen);
      question.setAttribute("aria-expanded", String(!isOpen));
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + "px" : null;
    });
  });

  /* ---------------------------------------------------------------------
     13. VALIDATION DU FORMULAIRE DE CONTACT
  --------------------------------------------------------------------- */
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  const validators = {
    fName: (v) => v.trim().length >= 2 || "Merci d'indiquer votre nom (2 caractères minimum).",
    fEmail: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Merci de saisir une adresse email valide.",
    fSubject: (v) => v.trim().length >= 3 || "Merci de préciser le sujet de votre demande.",
    fMessage: (v) => v.trim().length >= 10 || "Votre message doit contenir au moins 10 caractères.",
  };

  function validateField(field) {
    const value = field.value;
    const rule = validators[field.name];
    const errorEl = document.getElementById(`err-${field.name}`);
    const wrapper = field.closest(".form-field");
    if (!rule) return true;

    const result = rule(value);
    if (result === true) {
      wrapper.classList.remove("has-error");
      errorEl.textContent = "";
      return true;
    } else {
      wrapper.classList.add("has-error");
      errorEl.textContent = result;
      return false;
    }
  }

  if (contactForm) {
    contactForm.querySelectorAll("input, textarea").forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.closest(".form-field").classList.contains("has-error")) validateField(field);
      });
    });

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fields = [...contactForm.querySelectorAll("input, textarea")];
      const results = fields.map(validateField);
      const allValid = results.every(Boolean);

      if (!allValid) {
        formStatus.textContent = "Merci de corriger les champs signalés avant l'envoi.";
        formStatus.classList.add("is-error");
        return;
      }

      const submitBtn = contactForm.querySelector("button[type=submit]");
      const submitLabel = document.getElementById("submitLabel");
      submitBtn.disabled = true;
      const originalLabel = submitLabel.textContent;
      submitLabel.textContent = "Envoi en cours…";

      // Simulation d'un envoi (aucun backend fourni) — à remplacer par un vrai appel API.
      setTimeout(() => {
        formStatus.classList.remove("is-error");
        formStatus.textContent = "Merci ! Votre message a bien été envoyé, nous revenons vers vous sous 48h.";
        contactForm.reset();
        submitBtn.disabled = false;
        submitLabel.textContent = originalLabel;
      }, 900);
    });
  }

  /* ---------------------------------------------------------------------
     14. FORMULAIRE NEWSLETTER
  --------------------------------------------------------------------- */
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("newsletterEmail");
      const error = document.getElementById("err-newsletter");
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());

      if (!valid) {
        error.textContent = "Adresse email invalide.";
        input.style.borderColor = "#ff6b6b";
        return;
      }
      error.textContent = "";
      input.style.borderColor = "";
      input.value = "";
      error.textContent = "Merci, votre inscription est confirmée.";
      error.style.color = "var(--c-blue-light)";
    });
  }

  /* ---------------------------------------------------------------------
     15. LIENS D'ANCRAGE — défilement fluide géré nativement (CSS
         scroll-behavior), fallback JS pour navigateurs plus anciens.
  --------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
        }
      }
    });
  });

})();
