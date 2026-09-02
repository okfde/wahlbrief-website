(function () {
  // Configuration
  const config = {
    selectors: {
      input: "#zipcode",
      button: "#submit-btn",
      suggestions: "#autocomplete-list",
      footer: "#footer",
    },
    classes: {
      active: "autocomplete-active",
      valid: "is-valid",
      invalid: "is-invalid",
    },
    urls: {
      data: "/assets/plz.json",
    },
  };

  // State
  const state = {
    zips: [],
    lastEmail: null,
    activeSuggestion: -1,
  };

  // DOM Elements
  const dom = {
    input: document.querySelector(config.selectors.input),
    button: document.querySelector(config.selectors.button),
    suggestions: document.querySelector(config.selectors.suggestions),
    footer: document.querySelector(config.selectors.footer),
  };

  // Validation
  function validateInput(zip, city) {
    const isValid = state.zips.some(
      (item) =>
        item.PLZ.toString() === zip &&
        item.ORT.toString() === city &&
        (!state.lastEmail || item["E-Mail"] === state.lastEmail)
    );

    dom.input.setAttribute("data-valid", isValid);
    dom.button.disabled = !isValid;
    return isValid;
  }

  // Autocomplete
  function createSuggestionElement(place) {
    const element = document.createElement("div");
    element.textContent = `${place.PLZ} ${place.ORT}`;
    element.role = "option";
    element.className = "autocomplete-option";

    element.addEventListener("click", () => {
      dom.input.value = `${place.PLZ} ${place.ORT}`;
      dom.suggestions.innerHTML = "";
      validateInput(place.PLZ, place.ORT);
    });

    return element;
  }

  function updateAutocompleteSuggestions(value) {
    dom.suggestions.innerHTML = "";

    if (!value) return;

    const matches = state.zips.filter((place) =>
      place.PLZ.toString().startsWith(value)
    );

    if (matches.length === 0) {
      const error = document.createElement("div");
      error.className = "error";
      error.setAttribute("role", "alert");
      error.textContent = "Ungültige Postleitzahl";
      dom.suggestions.appendChild(error);
      return;
    }

    dom.suggestions.append(...matches.map(createSuggestionElement));
  }

  // Event Handlers
  function handleInput(e) {
    const value = e.target.value.replace(/[^0-9 ]/g, "");
    dom.input.value = value;
    const zip = value.split(" ")[0];
    updateAutocompleteSuggestions(zip);
  }

  function handleKeydown(e) {
    const options = dom.suggestions.children;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        state.activeSuggestion = Math.min(
          state.activeSuggestion + 1,
          options.length - 1
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        state.activeSuggestion = Math.max(state.activeSuggestion - 1, -1);
        break;
      case "Enter":
        e.preventDefault();
        if (state.activeSuggestion >= 0 && options[state.activeSuggestion]) {
          options[state.activeSuggestion].click();
        }
        dom.button.click();
        break;
      case "Escape":
        dom.suggestions.innerHTML = "";
        state.activeSuggestion = -1;
        break;
      default:
        return;
    }

    Array.from(options).forEach((opt, index) =>
      opt.classList.toggle(
        config.classes.active,
        index === state.activeSuggestion
      )
    );
  }

  async function handleSubmit() {
    const inputParts = dom.input.value.split(" ");
    const zip = inputParts.shift();
    const city = inputParts.join(" ");

    if (!validateInput(zip, city)) return;

    const url = new URL("https://wahlbrief.de/");
    url.searchParams.set("zip", zip);
    url.searchParams.set("city", city);
    window.open(url);
  }

  // Initialization
  async function initialize() {
    try {
      const response = await fetch(config.urls.data);
      if (!response.ok) throw new Error("Failed to load ZIP data");
      const data = await response.json();

      state.zips = data.sort(
        (a, b) => a.PLZ - b.PLZ || a.ORT.localeCompare(b.ORT)
      );

      // Event Listeners
      dom.input.addEventListener("input", handleInput);
      dom.input.addEventListener("keydown", handleKeydown);
      dom.button.addEventListener("click", handleSubmit);

      // Accessibility
      dom.input.setAttribute("aria-expanded", "false");
      dom.suggestions.setAttribute("aria-live", "polite");
    } catch (error) {
      console.error("Initialization error:", error);
      dom.suggestions.innerHTML =
        '<div class="error" role="alert">Daten konnten nicht geladen werden</div>';
    }
  }

  // Start the application
  initialize();
})();
