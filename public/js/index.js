// public/js/index.js

const STORAGE_KEY = "readmePromptBuilder.noDirs.v1";

const baseDefault =
  "Can you write me a GitHub README for the {CODE_SOURCE} with a TOC and allow me to download it as `PROJECT-NAME.md`? Write it in a clear, developer-friendly tone aimed at someone learning the codebase, and base all descriptions directly on the provided code rather than generic assumptions. Please include at minimum an Overview, Project Structure, Setup/Run Instructions, and Notes or Limitations section. For all directory structures, use a tree-style ASCII layout with `├──` and `└──` characters instead of a flat list.";

const presetQuick =
  "Can you write me a GitHub README for the {CODE_SOURCE} with a TOC and allow me to download it as `PROJECT-NAME.md`? Keep it concise but complete: Overview, Project Structure, and How to Run. Base all descriptions directly on the provided code. For all directory structures, use a tree-style ASCII layout with `├──` and `└──` characters instead of a flat list.";

const presetFull =
  "Can you write me a GitHub README for the {CODE_SOURCE} with a TOC and allow me to download it as `PROJECT-NAME.md`? Write it in a clear, developer-friendly tone aimed at someone learning the codebase, and base all descriptions directly on the provided code rather than generic assumptions. Please include at minimum: Overview, Features/What it does, Project Structure, Setup/Run Instructions, Configuration (if any), Example Usage, Testing, Troubleshooting, and Notes or Limitations. For all directory structures, use a tree-style ASCII layout with `├──` and `└──` characters instead of a flat list.";

const presetPortfolio =
  "Can you write me a GitHub README for the {CODE_SOURCE} with a TOC and allow me to download it as `PROJECT-NAME.md`? Write it as a small portfolio or learning project README: include a short elevator pitch, what it demonstrates, key features, tech stack, project structure, and how to run it locally. Base all descriptions directly on the provided code. For all directory structures, use a tree-style ASCII layout with `├──` and `└──` characters instead of a flat list.";

const sectionSets = {
  quick: "Please include: Overview, Project Structure, and How to Run.",
  standard: "Please include at minimum: Overview, Project Structure, Setup/Run Instructions, and Notes or Limitations.",
  full: "Please include at minimum: Overview, Features/What it does, Project Structure, Setup/Run Instructions, Configuration (if any), Example Usage, Testing, Troubleshooting, and Notes or Limitations.",
  portfolio: "Write it as a small portfolio or learning project README: include a short elevator pitch, what it demonstrates, key features, tech stack, project structure, and how to run it locally."
};

const addOns = [
  {
    id: "includeUsage", label: "Add a 'Usage' section with example commands/output notes",
    text: "Also include a Usage section with a couple example run commands and a short note about what output the user should expect to see."
  },
  {
    id: "includeConfig", label: "Add a 'Configuration' section (env vars/config files)",
    text: "Also include a Configuration section describing any environment variables or config files used (and note if none exist)."
  },
  {
    id: "includeTroubleshooting", label: "Add a 'Troubleshooting' section",
    text: "Also include a Troubleshooting section with a few likely gotchas and how to fix them."
  },
  {
    id: "includeTesting", label: "Add a 'Testing' section",
    text: "Also include a Testing section describing how to run tests, and if none exist, say so and suggest where they would go."
  },
  {
    id: "includeContributing", label: "Add a basic 'Contributing' section",
    text: "Also include a short Contributing section with basic steps (fork, branch, PR)."
  }
];

const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => [...document.querySelectorAll(sel)];
const oneLine = (s) => String(s || "").trim().replace(/\s+/g, " ");

function getRadioValue(name) {
  const el = qs(`input[name="${name}"]:checked`);
  return el ? el.value : null;
}

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
  catch { return null; }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { }
}

function clearState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { }
}

// elements
const filenamePresetEl = qs("#filenamePreset");
const filenameEl = qs("#filename");
const projectNameEl = qs("#projectName");
const basePromptEl = qs("#basePrompt");
const extraNotesEl = qs("#extraNotes");
const previewEl = qs("#preview");

const avoidBadgesEl = qs("#avoidBadges");
const avoidScreenshotsEl = qs("#avoidScreenshots");
const avoidLinksEl = qs("#avoidLinks");

const optionsEl = qs("#options");

// build addons
for (const opt of addOns) {
  const wrap = document.createElement("div");
  wrap.className = "form-check";

  const cb = document.createElement("input");
  cb.className = "form-check-input";
  cb.type = "checkbox";
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

function buildCodeSourceText() {
  return (getRadioValue("codeSource") === "attached")
    ? "the code in the attached file(s)"
    : "the code provided below";
}

function buildRules() {
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

  let prompt = (basePromptEl.value || baseDefault)
    .replaceAll("PROJECT-NAME.md", filename)
    .replaceAll("{CODE_SOURCE}", codeSourceText);

  if (projectName) prompt = `Project: ${projectName}\n\n` + prompt;

  prompt += `\n\n${sectionSets[sectionKey] || sectionSets.standard}`;

  const selectedAddOns = addOns
    .filter(o => qs(`#${o.id}`).checked)
    .map(o => o.text);

  const rules = buildRules();
  const extraNotes = oneLine(extraNotesEl.value);

  const extras = [];
  if (selectedAddOns.length) extras.push(...selectedAddOns);
  if (rules.length) extras.push(...rules);
  if (extraNotes) extras.push(`Extra custom notes: ${extraNotes}`);

  if (extras.length) {
    prompt += "\n\nOptional additions:\n- " + extras.join("\n- ");
  }

  previewEl.value = prompt;
}

function persist() {
  const state = {
    filenamePreset: filenamePresetEl.value,
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
    addOnChecks: Object.fromEntries(addOns.map(o => [o.id, qs(`#${o.id}`).checked]))
  };

  saveState(state);
}

function applyState(state) {
  if (!state) return;

  if (typeof state.filenamePreset === "string") filenamePresetEl.value = state.filenamePreset;
  if (typeof state.filename === "string") filenameEl.value = state.filename;
  if (typeof state.projectName === "string") projectNameEl.value = state.projectName;
  if (typeof state.basePrompt === "string") basePromptEl.value = state.basePrompt;
  if (typeof state.extraNotes === "string") extraNotesEl.value = state.extraNotes;

  if (state.codeSource) {
    const el = qs(`input[name="codeSource"][value="${state.codeSource}"]`);
    if (el) el.checked = true;
  }
  if (state.sectionSet) {
    const el = qs(`input[name="sectionSet"][value="${state.sectionSet}"]`);
    if (el) el.checked = true;
  }

  if (state.rules) {
    if (typeof state.rules.avoidBadges === "boolean") avoidBadgesEl.checked = state.rules.avoidBadges;
    if (typeof state.rules.avoidScreenshots === "boolean") avoidScreenshotsEl.checked = state.rules.avoidScreenshots;
    if (typeof state.rules.avoidLinks === "boolean") avoidLinksEl.checked = state.rules.avoidLinks;
  }

  if (state.addOnChecks) {
    for (const o of addOns) {
      if (o.id in state.addOnChecks) qs(`#${o.id}`).checked = !!state.addOnChecks[o.id];
    }
  }
}

function resetToDefaults() {
  filenamePresetEl.value = "";
  filenameEl.value = "PROJECT-NAME.md";
  projectNameEl.value = "";
  basePromptEl.value = baseDefault;
  extraNotesEl.value = "";

  qs("#codeBelow").checked = true;
  qs("#sectionsStandard").checked = true;

  avoidBadgesEl.checked = true;
  avoidScreenshotsEl.checked = true;
  avoidLinksEl.checked = true;

  for (const o of addOns) qs(`#${o.id}`).checked = false;

  clearState();
  rebuild();
  persist();
}

// wiring
qs("#rebuildBtn").addEventListener("click", () => { rebuild(); persist(); });

qs("#copyBtn").addEventListener("click", async () => {
  rebuild();
  try {
    await navigator.clipboard.writeText(previewEl.value);
    alert("Copied to clipboard.");
  } catch {
    alert("Clipboard copy failed. Try selecting the preview text and copying manually.");
  }
});

qs("#openBtn").addEventListener("click", () => {
  rebuild();
  const q = encodeURIComponent(previewEl.value);
  window.open(`https://chatgpt.com/?q=${q}`, "_blank", "noopener,noreferrer");
});

qs("#resetBtn").addEventListener("click", () => {
  if (confirm("Reset everything to defaults?")) resetToDefaults();
});

filenamePresetEl.addEventListener("change", () => {
  if (filenamePresetEl.value) filenameEl.value = filenamePresetEl.value;
  rebuild(); persist();
});

["filename", "projectName", "basePrompt", "extraNotes"].forEach(id => {
  qs(`#${id}`).addEventListener("input", () => { rebuild(); persist(); });
});

["avoidBadges", "avoidScreenshots", "avoidLinks"].forEach(id => {
  qs(`#${id}`).addEventListener("change", () => { rebuild(); persist(); });
});

qsa(`input[name="codeSource"]`).forEach(el => el.addEventListener("change", () => { rebuild(); persist(); }));
qsa(`input[name="sectionSet"]`).forEach(el => el.addEventListener("change", () => { rebuild(); persist(); }));

qs("#presetQuick").addEventListener("click", () => { basePromptEl.value = presetQuick; rebuild(); persist(); });
qs("#presetFull").addEventListener("click", () => { basePromptEl.value = presetFull; rebuild(); persist(); });
qs("#presetPortfolio").addEventListener("click", () => { basePromptEl.value = presetPortfolio; rebuild(); persist(); });

(function init() {
  const saved = loadState();
  if (saved) applyState(saved);
  if (!basePromptEl.value) basePromptEl.value = baseDefault;
  rebuild();
  persist();
})();
