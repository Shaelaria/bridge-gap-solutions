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

const copyButton = document.querySelector(".copy-email");
const copyStatus = document.querySelector(".copy-email-status");
const emailText = document.querySelector(".contact-email");
let copyStatusTimer;

// Fallback for browsers or contexts without the asynchronous Clipboard API.
function copyWithSelection(text) {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  field.remove();
  copyButton.focus();
  return copied;
}

// If copying is blocked, select the visible address so it can be copied manually.
function selectAddress(address) {
  const text = emailText.firstChild;
  const range = document.createRange();
  range.setStart(text, 0);
  range.setEnd(text, Math.min(address.length, text.length));
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

copyButton.addEventListener("click", async () => {
  const address = copyButton.dataset.copyEmail;
  clearTimeout(copyStatusTimer);
  copyStatus.textContent = "";
  let copied = false;
  try {
    await navigator.clipboard.writeText(address);
    copied = true;
  } catch {
    copied = copyWithSelection(address);
  }
  if (copied) {
    copyStatus.textContent = "Copied";
    copyStatusTimer = setTimeout(() => {
      copyStatus.textContent = "";
    }, 4000);
  } else {
    selectAddress(address);
    copyStatus.textContent = "Couldn’t copy. Select the address above.";
  }
});
