// ----- storage -----
const STORAGE_KEY = "readmePromptBuilder.v2";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors (private mode, etc.)
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { }
}

// ----- defaults + presets -----
const baseDefault =
  "Can you write me a GitHub README for the code in the attached file(s) or provided below, include a Table of Contents, and allow me to download it as `PROJECT-NAME.md`? Write it in a clear, developer-friendly tone aimed at someone learning the codebase, and base all descriptions directly on the provided code rather than generic assumptions. Please include at minimum an Overview, Project Structure, Setup/Run Instructions, and Notes or Limitations section. For all directory structures, use a tree-style ASCII layout with `├──` and `└──` characters instead of a flat list. Avoid badges, screenshots, or external links unless explicitly requested.";

const presetQuick =
  "Can you write me a GitHub README for the code in the attached file(s) or provided below, include a Table of Contents, and allow me to download it as `PROJECT-NAME.md`? Keep it concise but complete: Overview, Project Structure, and How to Run. Base all descriptions on the provided code. For all directory structures, use a tree-style ASCII layout with `├──` and `└──` characters instead of a flat list.";

const presetFull =
  "Can you write me a GitHub README for the code in the attached file(s) or provided below, include a Table of Contents, and allow me to download it as `PROJECT-NAME.md`? Write it in a clear, developer-friendly tone aimed at someone learning the codebase, and base all descriptions directly on the provided code rather than generic assumptions. Please include at minimum: Overview, Features/What it does, Project Structure, Setup/Run Instructions, Configuration (if any), Example Usage, and Notes or Limitations. For all directory structures, use a tree-style ASCII layout with `├──` and `└──` characters instead of a flat list. Avoid badges, screenshots, or external links unless explicitly requested.";

const presetPortfolio =
  "Can you write me a GitHub README for the code in the attached file(s) or provided below, include a Table of Contents, and allow me to download it as `PROJECT-NAME.md`? Write it as a small portfolio or learning project README: include a short elevator pitch, what problem it solves or what it demonstrates, key features, tech stack, project structure, and how to run it locally. Base all descriptions on the provided code (no generic assumptions). For all directory structures, use a tree-style ASCII layout with `├──` and `└──` characters instead of a flat list. Avoid badges, screenshots, or external links unless explicitly requested.";

const addOns = [
  {
    id: "includeUsage",
    label: "Add a 'Usage' section with example commands and expected output notes",
    text:
      "Also include a Usage section with a couple example run commands and a short note about what output the user should expect to see."
  },
  {
    id: "includeConfig",
    label: "Add a 'Configuration' section (env vars, config files)",
    text:
      "Also include a Configuration section describing any environment variables or config files used (and note if none exist)."
  },
  {
    id: "includeTroubleshooting",
    label: "Add a 'Troubleshooting' section with common issues",
    text:
      "Also include a Troubleshooting section with a few likely gotchas and how to fix them."
  },
  {
    id: "includeTesting",
    label: "Add a 'Testing' section (even if none yet)",
    text:
      "Also include a Testing section describing how to run tests, and if none exist, say so and suggest where they would go."
  },
  {
    id: "includeContributing",
    label: "Add a basic 'Contributing' section",
    text:
      "Also include a short Contributing section with basic steps (fork, branch, PR)."
  }
];

// ----- elements -----
const filenameEl = document.getElementById("filename");
const projectNameEl = document.getElementById("projectName");
const basePromptEl = document.getElementById("basePrompt");
const extraNotesEl = document.getElementById("extraNotes");
const optionsEl = document.getElementById("options");
const previewEl = document.getElementById("preview");

// build checkboxes
for (const opt of addOns) {
  const wrap = document.createElement("label");
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.id = opt.id;
  cb.addEventListener("change", () => { rebuild(); persist(); });
  wrap.appendChild(cb);
  wrap.appendChild(document.createTextNode(opt.label));
  optionsEl.appendChild(wrap);
}

// ----- compose -----
function rebuild() {
  const filename = filenameEl.value.trim() || "PROJECT-NAME.md";
  const projectName = projectNameEl.value.trim();

  let prompt = (basePromptEl.value || "").replaceAll("PROJECT-NAME.md", filename);

  if (projectName) {
    prompt = `Project: ${projectName}\n\n` + prompt;
  }

  const selected = addOns
    .filter(o => document.getElementById(o.id).checked)
    .map(o => o.text);

  const extraNotes = (extraNotesEl.value || "").trim();

  if (selected.length || extraNotes) {
    prompt += "\n\nOptional additions:";
  }

  if (selected.length) {
    prompt += "\n- " + selected.join("\n- ");
  }

  if (extraNotes) {
    // keep it readable and clearly separated
    prompt += `\n- Extra custom notes: ${extraNotes.replace(/\s+/g, " ").trim()}`;
  }

  previewEl.value = prompt;
}

// ----- persistence -----
function persist() {
  const state = {
    filename: filenameEl.value,
    projectName: projectNameEl.value,
    basePrompt: basePromptEl.value,
    extraNotes: extraNotesEl.value,
    checks: Object.fromEntries(addOns.map(o => [o.id, document.getElementById(o.id).checked]))
  };
  saveState(state);
}

function applyState(state) {
  if (!state) return;

  if (typeof state.filename === "string") filenameEl.value = state.filename;
  if (typeof state.projectName === "string") projectNameEl.value = state.projectName;
  if (typeof state.basePrompt === "string") basePromptEl.value = state.basePrompt;
  if (typeof state.extraNotes === "string") extraNotesEl.value = state.extraNotes;

  if (state.checks && typeof state.checks === "object") {
    for (const opt of addOns) {
      if (opt.id in state.checks) {
        document.getElementById(opt.id).checked = !!state.checks[opt.id];
      }
    }
  }
}

function setPreset(text) {
  basePromptEl.value = text;
  rebuild();
  persist();
}

function resetToDefaults() {
  filenameEl.value = "PROJECT-NAME.md";
  projectNameEl.value = "";
  basePromptEl.value = baseDefault;
  extraNotesEl.value = "";
  for (const opt of addOns) document.getElementById(opt.id).checked = false;

  clearState();
  rebuild();
  persist();
}

// ----- events -----
document.getElementById("rebuildBtn").addEventListener("click", () => { rebuild(); persist(); });

filenameEl.addEventListener("input", () => { rebuild(); persist(); });
projectNameEl.addEventListener("input", () => { rebuild(); persist(); });
basePromptEl.addEventListener("input", () => { rebuild(); persist(); });
extraNotesEl.addEventListener("input", () => { rebuild(); persist(); });

document.getElementById("copyBtn").addEventListener("click", async () => {
  rebuild();
  try {
    await navigator.clipboard.writeText(previewEl.value);
    alert("Copied to clipboard.");
  } catch {
    alert("Clipboard copy failed. Try selecting the preview text and copying manually.");
  }
});

document.getElementById("openBtn").addEventListener("click", () => {
  rebuild();
  const q = encodeURIComponent(previewEl.value);

  // Prefill prompt in ChatGPT (may not auto-send)
  const url = `https://chatgpt.com/?q=${q}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

document.getElementById("presetQuick").addEventListener("click", () => setPreset(presetQuick));
document.getElementById("presetFull").addEventListener("click", () => setPreset(presetFull));
document.getElementById("presetPortfolio").addEventListener("click", () => setPreset(presetPortfolio));

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Reset everything to defaults?")) resetToDefaults();
});

// ----- init -----
const saved = loadState();
if (saved) {
  applyState(saved);
  if (!basePromptEl.value) basePromptEl.value = baseDefault;
} else {
  basePromptEl.value = baseDefault;
}

rebuild();
persist();
