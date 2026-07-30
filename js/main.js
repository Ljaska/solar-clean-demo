(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  const closeMenu = () => {
    if (!menuToggle || !nav || !header) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    nav.classList.remove("is-open");
    header.classList.remove("is-menu-open");
    document.body.classList.remove("menu-open");
  };

  if (menuToggle && nav && header) {
    menuToggle.addEventListener("click", () => {
      const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      menuToggle.setAttribute("aria-label", willOpen ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", willOpen);
      header.classList.toggle("is-menu-open", willOpen);
      document.body.classList.toggle("menu-open", willOpen);
    });

    navLinks.forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  const revealItems = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
  revealItems.forEach((item) => revealObserver.observe(item));

  const counters = document.querySelectorAll("[data-counter]");
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.counter);
      const duration = 1200;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(target * eased).toLocaleString("en-GB");
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      observer.unobserve(element);
    });
  }, { threshold: 0.65 });
  counters.forEach((counter) => counterObserver.observe(counter));

  const observedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (observedSections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${visible.target.id}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-25% 0px -60% 0px", threshold: [0, .1, .4] });
    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  const timeline = document.querySelector("[data-timeline]");
  if (timeline) {
    const updateTimeline = () => {
      const rect = timeline.getBoundingClientRect();
      const viewportPoint = window.innerHeight * .72;
      const progress = Math.min(1, Math.max(0, (viewportPoint - rect.top) / (rect.height || 1)));
      timeline.style.setProperty("--timeline-progress", progress.toFixed(3));
    };
    window.addEventListener("scroll", updateTimeline, { passive: true });
    window.addEventListener("resize", updateTimeline, { passive: true });
    updateTimeline();
  }

  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImage = document.querySelector("[data-lightbox-image]");
  const lightboxCaption = document.querySelector("[data-lightbox-caption]");
  const lightboxClose = document.querySelector("[data-lightbox-close]");
  let lightboxTrigger = null;

  if (lightbox && lightboxImage && lightboxCaption && lightboxClose) {
    document.querySelectorAll("[data-lightbox-src]").forEach((item) => {
      item.addEventListener("click", () => {
        lightboxTrigger = item;
        lightboxImage.src = item.dataset.lightboxSrc;
        lightboxImage.alt = item.dataset.lightboxAlt;
        lightboxCaption.textContent = item.dataset.lightboxAlt;
        lightbox.showModal();
        document.body.classList.add("lightbox-open");
      });
    });

    const closeLightbox = () => {
      lightbox.close();
      document.body.classList.remove("lightbox-open");
      lightboxTrigger?.focus();
    };

    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener("close", () => document.body.classList.remove("lightbox-open"));
  }

  const form = document.querySelector("[data-quote-form]");
  if (form) {
    const success = form.querySelector(".form-success");
    const fields = Array.from(form.querySelectorAll("input, textarea"));

    const errorMessage = (field) => {
      if (field.validity.valueMissing) return field.type === "checkbox" ? "Please confirm before continuing." : "Please complete this field.";
      if (field.validity.typeMismatch) return "Please enter a valid email address.";
      if (field.validity.patternMismatch) return "Please enter a valid phone number.";
      if (field.validity.tooShort) return `Please use at least ${field.minLength} characters.`;
      return "Please check this field.";
    };

    const validateField = (field) => {
      const error = form.querySelector(`[data-error-for="${field.name}"]`);
      const isValid = field.checkValidity();
      field.setAttribute("aria-invalid", String(!isValid));
      if (error) error.textContent = isValid ? "" : errorMessage(field);
      return isValid;
    };

    fields.forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid") === "true") validateField(field);
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const invalid = fields.filter((field) => !validateField(field));
      if (invalid.length) {
        invalid[0].focus();
        return;
      }
      success.hidden = false;
      success.focus();
      form.reset();
      fields.forEach((field) => field.removeAttribute("aria-invalid"));
    });
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
