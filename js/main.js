(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
  const setMobileNavAvailability = (isOpen = false) => {
    if (!nav) return;
    const shouldHide = window.innerWidth < 992 && !isOpen;
    nav.toggleAttribute("inert", shouldHide);
    nav.setAttribute("aria-hidden", String(shouldHide));
  };

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  const closeMenu = () => {
    if (!menuToggle || !nav || !header) return;
    const wasOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    nav.classList.remove("is-open");
    header.classList.remove("is-menu-open");
    document.body.classList.remove("menu-open");
    setMobileNavAvailability(false);
    if (wasOpen && document.activeElement && nav.contains(document.activeElement)) {
      menuToggle.focus();
    }
  };

  if (menuToggle && nav && header) {
    menuToggle.addEventListener("click", () => {
      const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      menuToggle.setAttribute("aria-label", willOpen ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", willOpen);
      header.classList.toggle("is-menu-open", willOpen);
      document.body.classList.toggle("menu-open", willOpen);
      setMobileNavAvailability(willOpen);
      if (willOpen) {
        requestAnimationFrame(() => navLinks[0]?.focus());
      }
    });

    navLinks.forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }
      if (event.key !== "Tab" || menuToggle.getAttribute("aria-expanded") !== "true") return;
      const focusable = [menuToggle, ...navLinks];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    document.addEventListener("pointerdown", (event) => {
      if (menuToggle.getAttribute("aria-expanded") === "true" && !header.contains(event.target)) closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 992) closeMenu();
      else setMobileNavAvailability(menuToggle.getAttribute("aria-expanded") === "true");
    }, { passive: true });
    setMobileNavAvailability(false);
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
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const numberFormatter = new Intl.NumberFormat("en-GB");
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.counter);
      if (reduceMotion) {
        element.textContent = numberFormatter.format(target);
        observer.unobserve(element);
        return;
      }
      const duration = 1450;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = progress < .5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        element.textContent = numberFormatter.format(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      observer.unobserve(element);
    });
  }, { threshold: 0.65 });
  counters.forEach((counter) => counterObserver.observe(counter));

  const observedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean)
    .sort((firstSection, secondSection) => firstSection.offsetTop - secondSection.offsetTop);

  if (observedSections.length) {
    let activeSectionIndex = -1;
    let scrollSpyFrame = 0;
    let lockedDestination = null;
    let scrollSettleTimer = 0;
    let scrollLockTimeout = 0;

    const setActiveSection = (nextIndex) => {
      if (nextIndex === activeSectionIndex) return;
      activeSectionIndex = nextIndex;
      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${observedSections[nextIndex].id}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    const updateScrollSpy = () => {
      scrollSpyFrame = 0;
      if (lockedDestination) return;
      const headerOffset = (header?.getBoundingClientRect().height || 0) + 28;
      const marker = window.scrollY + headerOffset;
      let nextIndex = 0;

      observedSections.forEach((section, index) => {
        if (section.offsetTop <= marker) nextIndex = index;
      });

      const atPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atPageEnd) nextIndex = observedSections.length - 1;
      setActiveSection(nextIndex);
    };

    const scheduleScrollSpy = () => {
      if (lockedDestination) {
        window.clearTimeout(scrollSettleTimer);
        scrollSettleTimer = window.setTimeout(releaseScrollLock, 140);
        return;
      }
      if (scrollSpyFrame) return;
      scrollSpyFrame = requestAnimationFrame(updateScrollSpy);
    };

    const releaseScrollLock = () => {
      if (!lockedDestination) return;
      lockedDestination = null;
      window.clearTimeout(scrollSettleTimer);
      window.clearTimeout(scrollLockTimeout);
      scheduleScrollSpy();
    };

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const destination = document.querySelector(link.getAttribute("href"));
        const destinationIndex = observedSections.indexOf(destination);
        if (!destination || destinationIndex < 0) return;
        lockedDestination = destination;
        setActiveSection(destinationIndex);
        window.clearTimeout(scrollSettleTimer);
        window.clearTimeout(scrollLockTimeout);
        scrollLockTimeout = window.setTimeout(releaseScrollLock, 2200);
      });
    });

    window.addEventListener("scroll", scheduleScrollSpy, { passive: true });
    window.addEventListener("scrollend", releaseScrollLock, { passive: true });
    window.addEventListener("resize", scheduleScrollSpy, { passive: true });
    window.addEventListener("wheel", releaseScrollLock, { passive: true });
    window.addEventListener("touchstart", releaseScrollLock, { passive: true });
    window.addEventListener("keydown", (event) => {
      if (["PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown", " "].includes(event.key)) releaseScrollLock();
    });
    window.addEventListener("load", updateScrollSpy, { once: true });
    updateScrollSpy();
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
    };

    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener("close", () => {
      document.body.classList.remove("lightbox-open");
      lightboxTrigger?.focus();
    });
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
