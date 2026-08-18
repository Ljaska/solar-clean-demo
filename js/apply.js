(() => {
  "use strict";

  const form = document.querySelector("[data-application-form]");
  const successMessage = document.querySelector("[data-form-success]");
  if (!form || !successMessage) return;

  const fields = {
    phone: form.elements.phone,
    email: form.elements.email,
    property_address: form.elements.property_address
  };
  let validationShown = false;

  const errorFor = (name) => form.querySelector(`[data-error-for="${name}"]`);
  const dictionary = () => window.SuncleanI18n?.get()?.apply?.validation || {};

  const validateField = (name) => {
    const field = fields[name];
    const errors = dictionary();
    let message = "";

    if (name === "phone" && !field.value.trim()) message = errors.phoneRequired || "Phone is required.";
    if (name === "email" && field.value && !field.validity.valid) message = errors.emailInvalid || "Enter a valid email address.";
    if (name === "property_address" && !field.value.trim()) message = errors.addressRequired || "Property address is required.";

    field.setAttribute("aria-invalid", String(Boolean(message)));
    errorFor(name).textContent = message;
    return !message;
  };

  Object.entries(fields).forEach(([name, field]) => {
    field.addEventListener("input", () => {
      if (validationShown || field.getAttribute("aria-invalid") === "true") validateField(name);
    });
    field.addEventListener("blur", () => {
      if (validationShown) validateField(name);
    });
  });

  window.addEventListener("sunclean:language", () => {
    if (validationShown) Object.keys(fields).forEach(validateField);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    successMessage.hidden = true;
    validationShown = true;
    const isValid = Object.keys(fields).map(validateField).every(Boolean);

    if (!isValid) {
      Object.values(fields).find((field) => field.getAttribute("aria-invalid") === "true")?.focus();
      return;
    }

    // Placeholder client-side success state. Replace this handler during future form-service integration.
    form.reset();
    validationShown = false;
    Object.entries(fields).forEach(([name, field]) => {
      field.removeAttribute("aria-invalid");
      errorFor(name).textContent = "";
    });
    successMessage.hidden = false;
    successMessage.focus();
  });
})();
