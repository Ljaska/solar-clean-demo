(() => {
  "use strict";

  const faq = document.querySelector("[data-faq]");
  if (!faq) return;

  const buttons = Array.from(faq.querySelectorAll("button[aria-controls]"));

  const closeItem = (button) => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    button.setAttribute("aria-expanded", "false");
    window.setTimeout(() => {
      if (button.getAttribute("aria-expanded") === "false") panel.hidden = true;
    }, 300);
  };

  const openItem = (button) => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    panel.hidden = false;
    window.requestAnimationFrame(() => button.setAttribute("aria-expanded", "true"));
  };

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      buttons.forEach((item) => {
        if (item !== button && item.getAttribute("aria-expanded") === "true") closeItem(item);
      });
      if (isOpen) closeItem(button);
      else openItem(button);
    });

    button.addEventListener("keydown", (event) => {
      let targetIndex = null;
      if (event.key === "ArrowDown") targetIndex = (index + 1) % buttons.length;
      if (event.key === "ArrowUp") targetIndex = (index - 1 + buttons.length) % buttons.length;
      if (event.key === "Home") targetIndex = 0;
      if (event.key === "End") targetIndex = buttons.length - 1;
      if (targetIndex === null) return;
      event.preventDefault();
      buttons[targetIndex].focus();
    });
  });
})();
