(() => {
  "use strict";

  const bindComparisons = () => {
  document.querySelectorAll("[data-comparison]").forEach((comparison) => {
    const range = comparison.querySelector("[data-comparison-range]");
    if (!range || range.dataset.bound === "true") return;
    range.dataset.bound = "true";
    const beforeImage = comparison.querySelector(".service-comparison__before .service-comparison__image");
    const updateWidth = () => {
      if (beforeImage) beforeImage.style.width = `${comparison.clientWidth}px`;
    };
    const updateComparison = () => {
      const value = Number(range.value);
      comparison.style.setProperty("--position", `${value}%`);
      const dictionary = window.SuncleanI18n?.get()?.results;
      range.setAttribute(
        "aria-valuetext",
        value === 0
          ? dictionary?.after || "After"
          : value === 100
            ? dictionary?.before || "Before"
            : `${dictionary?.before || "Before"} ${value}%, ${dictionary?.after || "After"} ${100 - value}%`
      );
    };

    range.addEventListener("input", updateComparison);
    window.addEventListener("resize", updateWidth, { passive: true });
    updateWidth();
    updateComparison();
  });
  };
  bindComparisons();
  window.addEventListener("sunclean:language", bindComparisons);

  const track = document.querySelector("[data-testimonial-track]");
  const previous = document.querySelector("[data-testimonial-prev]");
  const next = document.querySelector("[data-testimonial-next]");

  if (!track || !previous || !next) return;

  const cards = Array.from(track.children);
  let index = 0;

  const visibleCards = () => {
    if (window.innerWidth >= 992) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const updateTestimonials = () => {
    const card = cards[0];
    if (!card) return;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const maxIndex = Math.max(0, cards.length - visibleCards());
    index = Math.min(index, maxIndex);
    track.style.transform = `translateX(-${index * (card.getBoundingClientRect().width + gap)}px)`;
    previous.disabled = index === 0;
    next.disabled = index === maxIndex;
    cards.forEach((item, cardIndex) => {
      item.setAttribute("aria-hidden", cardIndex < index || cardIndex >= index + visibleCards() ? "true" : "false");
    });
  };

  previous.addEventListener("click", () => {
    index = Math.max(0, index - 1);
    updateTestimonials();
  });

  next.addEventListener("click", () => {
    index = Math.min(cards.length - visibleCards(), index + 1);
    updateTestimonials();
  });

  let touchStart = 0;
  track.addEventListener("touchstart", (event) => {
    touchStart = event.touches[0].clientX;
  }, { passive: true });

  track.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) < 45) return;
    if (distance < 0) next.click();
    else previous.click();
  }, { passive: true });

  window.addEventListener("resize", updateTestimonials, { passive: true });
  updateTestimonials();
})();
