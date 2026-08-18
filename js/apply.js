(() => {
  "use strict";

  const form = document.querySelector("[data-application-form]");
  const successMessage = document.querySelector("[data-form-success]");
  const submitError = document.querySelector("[data-form-submit-error]");
  const submitButton = form?.querySelector("[data-submit-button]");
  if (!form || !successMessage || !submitError || !submitButton) return;

  const fields = {
    phone: form.elements.phone,
    email: form.elements.email,
    property_address: form.elements.property_address
  };
  let validationShown = false;
  let isSubmitting = false;
  let statusTimer = 0;

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

  const hideStatuses = () => {
    window.clearTimeout(statusTimer);
    successMessage.hidden = true;
    submitError.hidden = true;
  };

  const setSubmitting = (submitting) => {
    isSubmitting = submitting;
    submitButton.disabled = submitting;
    submitButton.dataset.i18n = submitting ? "apply.sending" : "apply.submit";
    const apply = window.SuncleanI18n?.get()?.apply;
    submitButton.textContent = submitting ? apply?.sending || "Sending..." : apply?.submit || "Send application";
  };

  const clearValidation = () => {
    validationShown = false;
    Object.entries(fields).forEach(([name, field]) => {
      field.removeAttribute("aria-invalid");
      errorFor(name).textContent = "";
    });
  };

  const submissionData = () => {
    const data = Object.fromEntries(new FormData(form));
    data.service = form.elements.service.selectedOptions[0]?.textContent || "";
    data._url = window.location.href;
    return data;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    hideStatuses();
    validationShown = true;
    const isValid = Object.keys(fields).map(validateField).every(Boolean);

    if (!isValid) {
      Object.values(fields).find((field) => field.getAttribute("aria-invalid") === "true")?.focus();
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(submissionData())
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success === false || result?.success === "false") throw new Error("Submission failed");

      form.reset();
      clearValidation();
      successMessage.hidden = false;
      successMessage.focus();
      statusTimer = window.setTimeout(() => {
        successMessage.hidden = true;
      }, 8000);
    } catch {
      submitError.hidden = false;
      submitError.focus();
    } finally {
      setSubmitting(false);
    }
  });
})();
