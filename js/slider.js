(() => {
  "use strict";

  const comparison = document.querySelector("[data-comparison]");
  const range = document.querySelector("[data-comparison-range]");
  const beforeImage = comparison?.querySelector(".comparison__before img");

  if (comparison && range && beforeImage) {
    const updateComparisonWidth = () => {
      beforeImage.style.width = `${comparison.clientWidth}px`;
    };

    const updateComparison = () => {
      const value = Number(range.value);
      comparison.style.setProperty("--position", `${value}%`);
      range.setAttribute(
        "aria-valuetext",
        value === 0
          ? "All after cleaning"
          : value === 100
            ? "All before cleaning"
            : `${value} percent before cleaning and ${100 - value} percent after cleaning`
      );
    };

    range.addEventListener("input", updateComparison);
    window.addEventListener("resize", updateComparisonWidth, { passive: true });
    updateComparisonWidth();
    updateComparison();
  }

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
