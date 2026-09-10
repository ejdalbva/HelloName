// --- Grab references to the elements we'll work with ---
const askView     = document.getElementById("askView");
const greetView   = document.getElementById("greetView");
const nameInput   = document.getElementById("nameInput");
const colorInput  = document.getElementById("colorInput");
const saveBtn     = document.getElementById("saveBtn");
const forgetBtn   = document.getElementById("forgetBtn");
const newColorBtn = document.getElementById("newColorBtn");
const greetingTxt = document.getElementById("greeting");
const colorTxt    = document.getElementById("color");   // <-- added (see note)
const modTimeTxt  = document.getElementById("modtime");

const STORAGE_KEY = "userName";
const COLOR_KEY = "favoriteColor";
const MOD_TIME_KEY = "lastModified";

// --- Decide which view to show, based on stored data ---
function render(showAsk) {
  const savedName = localStorage.getItem(STORAGE_KEY);
  const savedColor = localStorage.getItem(COLOR_KEY);
  const savedTime = localStorage.getItem(MOD_TIME_KEY);
  greetingTxt.textContent = "";
  greetingTxt.style.color = "black";
  colorTxt.textContent = "";
  modTimeTxt.textContent = "";
  if (savedName || savedColor){
    if (savedName) {
        greetingTxt.textContent = "Hi there, " + savedName + "!";
    }
    if (savedColor) {
        colorTxt.textContent = "Favorite color: " + savedColor;
        greetingTxt.style.color = savedColor;
    }
  }
  if (showAsk){
    // make the askView visible _before_ trying to
    // set the focus on one of it's text boxes
    askView.classList.remove("hidden");
    greetView.classList.add("hidden");
    if (!savedName)
    {
      requestAnimationFrame(() => nameInput.focus());
    }
    else if (!savedColor) {
      requestAnimationFrame(() => colorInput.focus());
    }
    console.log("active element is: ", document.activeElement.id ); 
  } else {
    askView.classList.add("hidden");
    greetView.classList.remove("hidden");
    if (savedTime) {
      const when = new Date(savedTime);
      modTimeTxt.textContent = "Last updated: " + when.toLocaleString();
    }
  }
}

// Event handler for text inputs 
// (enter key -> click [Save])
function saveOnEnter(event){
  if (event.key === "Enter"){
    saveBtn.click();
  }
}
nameInput.addEventListener("keydown", saveOnEnter);
colorInput.addEventListener("keydown", saveOnEnter);

// --- Save button: store the name, then re-render ---
saveBtn.addEventListener("click", function () {
  const name = nameInput.value.trim();
  const color = colorInput.value.trim();
  if (name) {
      localStorage.setItem(STORAGE_KEY, name);
  }
  else {
    // storage might have a value from earlier save, 
    // but don't want it to be displayed if we 
    // redisplay the color, so remove it
    localStorage.removeItem(STORAGE_KEY);
  }
  if (color) {
    localStorage.setItem(COLOR_KEY, color);
  }
  else {
    // similarly, remove any previously-stored value
    localStorage.removeItem(COLOR_KEY);
  }

  // Update last-modified time
  if (name || color) {
    localStorage.setItem(MOD_TIME_KEY, new Date().toISOString());
  } else {
    localStorage.removeItem(MOD_TIME_KEY);
  }
  render(false);
});

// --- Forget button: clear only the stored name 
// then re-render ---
forgetBtn.addEventListener("click", function () {
  localStorage.removeItem(STORAGE_KEY);
  nameInput.value = "";
  render(true);
});

// --- New color button: clear only the current color
// then re-render to allow a new color choice
newColorBtn.addEventListener("click", function() {
  localStorage.removeItem(COLOR_KEY);
  colorInput.value = "";
  render(true);
})

// --- Run once at startup ---
render(true);


// ============================================================
//  Service worker registration + update detection
// ============================================================
if ("serviceWorker" in navigator) {
  let refreshing = false;

  // When the new SW takes control, reload once to get fresh assets.
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;   // guard against double-reload
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("./service-worker.js");
      console.log("[App] SW registered:", reg.scope);

      const banner = document.getElementById("updateBanner");
      const refreshBtn = document.getElementById("refreshBtn");

      // Helper: show banner and wire the button to the given waiting SW.
      function promptUserToRefresh(worker) {
        banner.classList.remove("hidden");
        refreshBtn.onclick = () => {
          worker.postMessage({ type: "SKIP_WAITING" });
          // controllerchange (above) will fire and reload the page.
        };
      }

      // Case 1: a new SW is already waiting when the page loads.
      if (reg.waiting) {
        promptUserToRefresh(reg.waiting);
      }

      // Case 2: a new SW is found and installs while the page is open.
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          // "installed" + an existing controller = an update (not first install).
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            promptUserToRefresh(newWorker);
          }
        });
      });
    } catch (err) {
      console.error("[App] SW registration failed:", err);
    }
  });
}
