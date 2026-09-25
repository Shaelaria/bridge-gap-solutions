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
