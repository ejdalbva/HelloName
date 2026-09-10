// --- Grab references to the elements we'll work with ---
const askView     = document.getElementById("askView");
const greetView   = document.getElementById("greetView");
const nameInput   = document.getElementById("nameInput");
const colorInput  = document.getElementById("colorInput");
const saveBtn     = document.getElementById("saveBtn");
const forgetBtn   = document.getElementById("forgetBtn");
const greetingTxt = document.getElementById("greeting");
const colorTxt    = document.getElementById("color");   // <-- added (see note)

const STORAGE_KEY = "userName";
const COLOR_KEY = "favoriteColor";

// --- Decide which view to show, based on stored data ---
function render() {
  const savedName = localStorage.getItem(STORAGE_KEY);
  const savedColor = localStorage.getItem(COLOR_KEY);
  greetingTxt.textContent = "";
  colorTxt.textContent = "";
  if (savedName || savedColor){
    if (savedName) {
        greetingTxt.textContent = "Hi there, " + savedName + "!";
    }
    if (savedColor) {
        colorTxt.textContent = "Favorite color: " + savedColor;
    }
    askView.classList.add("hidden");
    greetView.classList.remove("hidden");
  } else {
    askView.classList.remove("hidden");
    greetView.classList.add("hidden");
  }
}

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
  render();
});

// --- Forget button: clear the stored name, then re-render ---
forgetBtn.addEventListener("click", function () {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(COLOR_KEY);
  nameInput.value = "";
  colorInput.value = "";
  render();
});

// --- Run once at startup ---
render();


// ---- Register the service worker ----
// Guarded: only run if the browser supports service workers.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((reg) => console.log("[App] SW registered:", reg.scope))
      .catch((err) => console.error("[App] SW registration failed:", err));
  });
}
