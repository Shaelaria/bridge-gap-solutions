const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");
const mobileLayout = window.matchMedia("(max-width: 800px)");

function setMenuOpen(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  navigation.dataset.open = String(open);
  navigation.hidden = mobileLayout.matches && !open;
}

function syncNavigation() {
  const focusedElement = document.activeElement;
  menuButton.hidden = !mobileLayout.matches;
  setMenuOpen(false);
  if (mobileLayout.matches && navigation.contains(focusedElement)) {
    menuButton.focus();
  } else if (!mobileLayout.matches && focusedElement === menuButton) {
    navigation.querySelector("a").focus();
  }
}

menuButton.addEventListener("click", () => {
  setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});

navigation.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link || !mobileLayout.matches) return;
  setMenuOpen(false);
  const target = document.querySelector(link.hash);
  if (target) {
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    mobileLayout.matches &&
    menuButton.getAttribute("aria-expanded") === "true"
  ) {
    setMenuOpen(false);
    menuButton.focus();
  }
});

mobileLayout.addEventListener("change", syncNavigation);
syncNavigation();

// Contact form. The endpoint lives only in the form's action attribute
// (see the FORMSPREE ENDPOINT comment in index.html).
const contactForm = document.querySelector("#contact-form");
const inquiryType = contactForm.querySelector("#inquiry-type");
const vendorFields = contactForm.querySelector("#vendor-fields");
const formStatus = contactForm.querySelector(".form-status");
const submitButton = contactForm.querySelector('[type="submit"]');
const inquiryOptions = {
  government: "Government / Contracting Officer",
  teaming: "Prime Contractor / Teaming",
  vendor: "Vendor / Subcontractor",
  general: "General Inquiry",
};
const vendorOption = inquiryOptions.vendor;
const fallbackMessage = "Please email nick@chameleonlabs.ai directly.";

function syncVendorFields() {
  const isVendor = inquiryType.value === vendorOption;
  vendorFields.dataset.visible = String(isVendor);
  vendorFields.disabled = !isVendor;
}

function setStatus(message, state) {
  formStatus.textContent = message;
  formStatus.dataset.state = state;
}

// Conversation CTAs keep their #contact link and preselect the inquiry type.
document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-inquiry]");
  const option = link && inquiryOptions[link.dataset.inquiry];
  if (!option) return;
  inquiryType.value = option;
  syncVendorFields();
  setStatus("", "");
});

inquiryType.addEventListener("change", syncVendorFields);

function configuredEndpoint() {
  const action = (contactForm.getAttribute("action") || "").trim();
  return /^https:\/\//i.test(action) ? action : "";
}

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const endpoint = configuredEndpoint();
  if (!endpoint) {
    setStatus(
      `This form is not connected yet, so nothing was sent. ${fallbackMessage}`,
      "error",
    );
    return;
  }
  submitButton.disabled = true;
  setStatus("Sending…", "pending");
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: new FormData(contactForm),
      headers: { Accept: "application/json" },
    });
    if (!response.ok)
      throw new Error(`Form endpoint returned ${response.status}`);
    contactForm.reset();
    syncVendorFields();
    setStatus(
      "Thank you. Your message was sent. We reply by email.",
      "success",
    );
  } catch (error) {
    console.error("Contact form submission failed:", error);
    setStatus(`Your message could not be sent. ${fallbackMessage}`, "error");
  } finally {
    submitButton.disabled = false;
  }
});

syncVendorFields();
