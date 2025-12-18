// README Prompt Builder (Bootstrap UI)
// ----- storage -----
const STORAGE_KEY = "readmePromptBuilder.v3";

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
    // ignore storage errors
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { }
}

// ----- text helpers -----
function oneLine(s) {
  return String(s || "").trim().replace(/\s+/g, " ");
}

function getRadioValue(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : null;
}

// ----- defaults -----
const baseDefault =
  "Can you write me a GitHub README for the {CODE_SOURCE} with a TOC and allow me to download it as `PROJECT-NAME.md`? Write it in a clear, developer-friendly tone aimed at someone learning the codebase, and base all descriptions directly on the provided code rather than generic assumptions. For all directory structures, use a tree-style ASCII layout with `├──` and `└──` characters instead of a flat list.";

// Section sets (radio buttons)
const sectionSets = {
  quick: "Please include: Overview, Project Structure, and How to Run.",
  standard: "Please include at minimum: Overview, Project Structure, Setup/Run Instructions, and Notes or Limitations.",
  full: "Please include at minimum: Overview, Features/What it does, Project Structure, Setup/Run Instructions, Configuration (if any), Example Usage, Testing, Troubleshooting, and Notes or Limitations.",
  portfolio: "Write it as a small portfolio or learning project README: include a short elevator pitch, what it demonstrates, key features, tech stack, project structure, and how to run it locally."
};

// Checkbox add-ons (still useful for extra sections or constraints)
const addOns = [
  {
    id: "includeUsage",
    label: "Add a 'Usage' section with example commands and expected output notes",
    text: "Also include a Usage section with a couple example run commands and a short note about what output the user should expect to see."
  },
  {
    id: "includeConfig",
    label: "Add a 'Configuration' section (env vars, config files)",
    text: "Also include a Configuration section describing any environment variables or config files used (and note if none exist)."
  },
  {
    id: "includeTroubleshooting",
    label: "Add a 'Troubleshooting' section with common issues",
    text: "Also include a Troubleshooting section with a few likely gotchas and how to fix them."
  },
  {
    id: "includeTesting",
    label: "Add a 'Testing' section (even if none yet)",
    text: "Also include a Testing section describing how to run tests, and if none exist, say so and suggest where they would go."
  },
  {
    id: "includeContributing",
    label: "Add a basic 'Contributing' section",
    text: "Also include a short Contributing section with basic steps (fork, branch, PR)."
  }
];

// ----- elements -----
const filenameEl = document.getElementById("filename");
const projectNameEl = document.getElementById("projectName");
const basePromptEl = document.getElementById("basePrompt");
const extraNotesEl = document.getElementById("extraNotes");
const optionsEl = document.getElementById("options");
const previewEl = document.getElementById("preview");

const avoidBadgesEl = document.getElementById("avoidBadges");
const avoidScreenshotsEl = document.getElementById("avoidScreenshots");
const avoidLinksEl = document.getElementById("avoidLinks");

// build checkbox list
for (const opt of addOns) {
  const wrap = document.createElement("div");
  wrap.className = "form-check";

  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.className = "form-check-input";
  cb.id = opt.id;

  const lab = document.createElement("label");
  lab.className = "form-check-label";
  lab.htmlFor = opt.id;
  lab.textContent = opt.label;

  cb.addEventListener("change", () => { rebuild(); persist(); });

  wrap.appendChild(cb);
  wrap.appendChild(lab);
  optionsEl.appendChild(wrap);
}

// ----- compose prompt -----
function buildCodeSourceText() {
  const v = getRadioValue("codeSource") || "below";
  return v === "attached" ? "the code in the attached file(s)" : "the code provided below";
}

function buildRulesText() {
  const rules = [];
  if (avoidBadgesEl.checked) rules.push("Avoid badges unless explicitly requested.");
  if (avoidScreenshotsEl.checked) rules.push("Avoid screenshots unless explicitly requested.");
  if (avoidLinksEl.checked) rules.push("Avoid external links unless explicitly requested.");
  return rules;
}

function rebuild() {
  const filename = filenameEl.value.trim() || "PROJECT-NAME.md";
  const projectName = projectNameEl.value.trim();

  const codeSourceText = buildCodeSourceText();
  const sectionKey = getRadioValue("sectionSet") || "standard";
  const sectionText = sectionSets[sectionKey] || sectionSets.standard;

  // Base prompt supports a placeholder {CODE_SOURCE}
  let prompt = (basePromptEl.value || baseDefault)
    .replaceAll("PROJECT-NAME.md", filename)
    .replaceAll("{CODE_SOURCE}", codeSourceText);

  if (projectName) {
    prompt = `Project: ${projectName}\n\n` + prompt;
  }

  // Always add the selected section set guidance (radio)
  prompt += `\n\n${sectionText}`;

  // Optional additions (checkboxes)
  const selectedAddOns = addOns
    .filter(o => document.getElementById(o.id).checked)
    .map(o => o.text);

  const rules = buildRulesText();
  const extraNotes = oneLine(extraNotesEl.value);

  const extraBits = [];
  if (selectedAddOns.length) extraBits.push(...selectedAddOns);
  if (rules.length) extraBits.push(...rules);
  if (extraNotes) extraBits.push(`Extra custom notes: ${extraNotes}`);

  if (extraBits.length) {
    prompt += "\n\nOptional additions:\n- " + extraBits.join("\n- ");
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

    codeSource: getRadioValue("codeSource") || "below",
    sectionSet: getRadioValue("sectionSet") || "standard",

    rules: {
      avoidBadges: avoidBadgesEl.checked,
      avoidScreenshots: avoidScreenshotsEl.checked,
      avoidLinks: avoidLinksEl.checked
    },

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

  // radios
  if (state.codeSource) {
    const el = document.querySelector(`input[name="codeSource"][value="${state.codeSource}"]`);
    if (el) el.checked = true;
  }
  if (state.sectionSet) {
    const el = document.querySelector(`input[name="sectionSet"][value="${state.sectionSet}"]`);
    if (el) el.checked = true;
  }

  // rules checkboxes
  if (state.rules) {
    if (typeof state.rules.avoidBadges === "boolean") avoidBadgesEl.checked = state.rules.avoidBadges;
    if (typeof state.rules.avoidScreenshots === "boolean") avoidScreenshotsEl.checked = state.rules.avoidScreenshots;
    if (typeof state.rules.avoidLinks === "boolean") avoidLinksEl.checked = state.rules.avoidLinks;
  }

  // addOn checkboxes
  if (state.checks && typeof state.checks === "object") {
    for (const opt of addOns) {
      if (opt.id in state.checks) {
        document.getElementById(opt.id).checked = !!state.checks[opt.id];
      }
    }
  }
}

function resetToDefaults() {
  filenameEl.value = "PROJECT-NAME.md";
  projectNameEl.value = "";
  basePromptEl.value = baseDefault;
  extraNotesEl.value = "";

  // radios default
  document.querySelector(`#codeBelow`).checked = true;
  document.querySelector(`#sectionsStandard`).checked = true;

  // default rules on
  avoidBadgesEl.checked = true;
  avoidScreenshotsEl.checked = true;
  avoidLinksEl.checked = true;

  // addOns off
  for (const opt of addOns) document.getElementById(opt.id).checked = false;

  clearState();
  rebuild();
  persist();
}

// ----- wire events -----
function hookAuto(id, evt = "input") {
  const el = document.getElementById(id);
  el.addEventListener(evt, () => { rebuild(); persist(); });
}

hookAuto("filename");
hookAuto("projectName");
hookAuto("basePrompt");
hookAuto("extraNotes");

avoidBadgesEl.addEventListener("change", () => { rebuild(); persist(); });
avoidScreenshotsEl.addEventListener("change", () => { rebuild(); persist(); });
avoidLinksEl.addEventListener("change", () => { rebuild(); persist(); });

// radio groups
document.querySelectorAll(`input[name="codeSource"]`).forEach(el => {
  el.addEventListener("change", () => { rebuild(); persist(); });
});
document.querySelectorAll(`input[name="sectionSet"]`).forEach(el => {
  el.addEventListener("change", () => { rebuild(); persist(); });
});

// buttons
document.getElementById("rebuildBtn").addEventListener("click", () => { rebuild(); persist(); });

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
  const url = `https://chatgpt.com/?q=${q}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

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
