// Sciesmic Labs kit: shared shell for every lab.
// Provides language (EN/ES), translated strings, tap-to-define key terms,
// a Key Terms drawer, a standards bar, "Check your thinking" questions, and
// the teacher-resources link. Each lab supplies a content object (content.js).

const STORAGE_KEY = "sciesmic-labs-lang";
let content = null;
let lang = "en";
const listeners = new Set();

const KIT_STRINGS = {
  en: {
    brand: "Sciesmic Labs",
    allLabs: "All science simulations",
    aboutLab: "About this simulation & standards",
    keyTerms: "Key terms",
    close: "Close",
    teacher: "Teacher resources",
    teacherNote: "Worksheets, answer keys and lesson plans are in the Sciesmic members area.",
    language: "Language",
    standards: "Standards",
    check: "Check answer",
    tryAgain: "Try again",
    correct: "Correct.",
    notQuite: "Not quite.",
    score: "{n} of {total} correct",
    checksIntro: "Answer each question, then read the feedback. You can try again.",
    defineTerm: "Define {term}",
  },
  es: {
    brand: "Sciesmic Labs",
    allLabs: "Todas las simulaciones de ciencias",
    aboutLab: "Acerca de esta simulación y sus estándares",
    keyTerms: "Términos clave",
    close: "Cerrar",
    teacher: "Recursos para docentes",
    teacherNote: "Las hojas de trabajo, claves de respuestas y planes de lección están en el área de miembros de Sciesmic.",
    language: "Idioma",
    standards: "Estándares",
    check: "Comprobar",
    tryAgain: "Intentar de nuevo",
    correct: "¡Correcto!",
    notQuite: "Todavía no.",
    score: "{n} de {total} correctas",
    checksIntro: "Responde cada pregunta y luego lee la retroalimentación. Puedes intentarlo de nuevo.",
    defineTerm: "Definir {term}",
  },
};

export function getLang() { return lang; }
export function onLangChange(fn) { listeners.add(fn); }

/** Translate a key from the lab's strings (falls back to kit strings, then English). */
export function t(key, vars = {}) {
  const pick = (table) => table?.[lang]?.[key] ?? table?.en?.[key];
  let value = pick(content?.strings) ?? pick(KIT_STRINGS) ?? key;
  for (const [name, replacement] of Object.entries(vars)) value = value.replaceAll(`{${name}}`, replacement);
  return value;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

/** Turn "[[termId|shown text]]" tokens into tap-to-define buttons. Everything else is escaped. */
export function renderRich(text) {
  return escapeHtml(text).replace(/\[\[([a-z0-9-]+)\|([^\]]+)\]\]/g, (_, id, shown) =>
    `<button type="button" class="lk-term" data-term="${id}" aria-haspopup="dialog">${shown}</button>`);
}

function termEntry(id) {
  const entry = content.vocab.find((item) => item.id === id);
  return entry ? (entry[lang] ?? entry.en) : null;
}

function readStoredLang() {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (fromUrl === "en" || fromUrl === "es") return fromUrl;
  try { const stored = localStorage.getItem(STORAGE_KEY); if (stored === "en" || stored === "es") return stored; } catch { /* storage optional */ }
  return (navigator.language || "en").toLowerCase().startsWith("es") ? "es" : "en";
}

export function setLang(next) {
  lang = next === "es" ? "es" : "en";
  document.documentElement.lang = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* storage optional */ }
  applyStatic();
  renderShell();
  renderChecks();
  listeners.forEach((fn) => fn(lang));
}

/** Fill every element marked data-i18n (plain text) or data-i18n-rich (term tokens allowed). */
function applyStatic() {
  document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll("[data-i18n-rich]").forEach((node) => { node.innerHTML = renderRich(t(node.dataset.i18nRich)); });
  document.querySelectorAll("[data-i18n-attr]").forEach((node) => {
    node.dataset.i18nAttr.split(";").forEach((pair) => { const [attr, key] = pair.split(":"); node.setAttribute(attr, t(key)); });
  });
  document.title = `${t("title")} | ${t("brand")}`;
}

/* ---------- top bar: brand, standards, terms, teacher link, language ---------- */
function renderShell() {
  let bar = document.querySelector(".lk-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.className = "lk-bar";
    document.body.prepend(bar);
  }
  const chips = content.standards.map((s) =>
    `<a class="lk-chip" href="${s.url}" target="_blank" rel="noopener" title="${escapeHtml(s[lang] ?? s.en)}">${escapeHtml(s.code)}</a>`).join("");
  bar.innerHTML = `
    <div class="lk-bar-inner">
      <a class="lk-brand" href="../" aria-label="${t("brand")}"><img src="../kit/brand/sciesmic-logo.png" alt="Sciesmic" width="600" height="173"><span>LABS</span></a>
      <div class="lk-standards" aria-label="${t("standards")}">${chips}</div>
      <div class="lk-actions">
        <button type="button" class="lk-btn" id="lk-terms-open">${t("keyTerms")}</button>
        <a class="lk-btn" href="${content.teacherPackUrl}" target="_blank" rel="noopener" title="${escapeHtml(t("teacherNote"))}">${t("teacher")}</a>
        <div class="lk-lang" role="group" aria-label="${t("language")}">
          <button type="button" data-lang="en" aria-pressed="${lang === "en"}">EN</button>
          <button type="button" data-lang="es" aria-pressed="${lang === "es"}">ES</button>
        </div>
      </div>
    </div>`;
  bar.querySelectorAll("[data-lang]").forEach((button) => button.addEventListener("click", () => setLang(button.dataset.lang)));
  bar.querySelector("#lk-terms-open").addEventListener("click", openDrawer);
  renderDrawer();
}

/* ---------- Key Terms drawer ---------- */
function renderDrawer() {
  let drawer = document.getElementById("lk-drawer");
  if (!drawer) {
    drawer = document.createElement("dialog");
    drawer.id = "lk-drawer";
    drawer.className = "lk-drawer";
    document.body.append(drawer);
    drawer.addEventListener("click", (event) => { if (event.target === drawer) drawer.close(); });
  }
  const other = lang === "en" ? "es" : "en";
  drawer.setAttribute("aria-label", t("keyTerms"));
  drawer.innerHTML = `
    <div class="lk-drawer-head"><h2>${t("keyTerms")}</h2><button type="button" class="lk-btn" data-close>${t("close")}</button></div>
    <dl>${content.vocab.map((item) => {
      const here = item[lang] ?? item.en, there = item[other];
      return `<div class="lk-def" id="lk-def-${item.id}"><dt>${escapeHtml(here.term)} <span class="lk-alt" lang="${other}">${escapeHtml(there?.term ?? "")}</span></dt><dd>${escapeHtml(here.def)}</dd></div>`;
    }).join("")}</dl>`;
  drawer.querySelector("[data-close]").addEventListener("click", () => drawer.close());
}

function openDrawer(termId) {
  const drawer = document.getElementById("lk-drawer");
  drawer.showModal();
  drawer.querySelectorAll(".lk-def").forEach((node) => node.classList.remove("lk-flash"));
  if (typeof termId === "string") {
    const target = drawer.querySelector(`#lk-def-${termId}`);
    target?.scrollIntoView({ block: "center" });
    target?.classList.add("lk-flash");
  }
}

/* ---------- tap-to-define popover ---------- */
function setupPopover() {
  const pop = document.createElement("div");
  pop.className = "lk-pop";
  pop.setAttribute("role", "dialog");
  pop.hidden = true;
  document.body.append(pop);
  let opener = null;
  const close = () => { pop.hidden = true; opener?.setAttribute("aria-expanded", "false"); opener = null; };
  document.addEventListener("click", (event) => {
    const term = event.target.closest(".lk-term");
    if (term) {
      if (opener === term) { close(); return; }
      close();
      const entry = termEntry(term.dataset.term);
      if (!entry) return;
      opener = term;
      term.setAttribute("aria-expanded", "true");
      pop.setAttribute("aria-label", entry.term);
      pop.innerHTML = `<strong>${escapeHtml(entry.term)}</strong><p>${escapeHtml(entry.def)}</p><button type="button" class="lk-link" data-more="${term.dataset.term}">${t("keyTerms")} →</button>`;
      pop.hidden = false;
      const rect = term.getBoundingClientRect();
      const width = Math.min(300, window.innerWidth - 32);
      pop.style.width = `${width}px`;
      pop.style.left = `${Math.max(16, Math.min(rect.left + window.scrollX, window.scrollX + window.innerWidth - width - 16))}px`;
      pop.style.top = `${rect.bottom + window.scrollY + 8}px`;
      return;
    }
    const more = event.target.closest("[data-more]");
    if (more) { const id = more.dataset.more; close(); openDrawer(id); return; }
    if (!event.target.closest(".lk-pop")) close();
  });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !pop.hidden) { const back = opener; close(); back?.focus(); } });
}

/* ---------- Check your thinking ---------- */
const answers = new Map(); // question id -> { chosen, checked }

function renderChecks() {
  const host = document.getElementById("lk-checks");
  if (!host || !content.checks?.length) return;
  const correctCount = content.checks.filter((q) => answers.get(q.id)?.checked && answers.get(q.id).chosen === q.answer).length;
  host.innerHTML = `
    <p class="lk-checks-intro">${t("checksIntro")}</p>
    <p class="lk-score" aria-live="polite">${t("score", { n: correctCount, total: content.checks.length })}</p>
    <ol class="lk-questions">${content.checks.map((q, index) => {
      const text = q[lang] ?? q.en;
      const state = answers.get(q.id) ?? {};
      const feedback = state.checked ? text.feedback[state.chosen] : "";
      const right = state.checked && state.chosen === q.answer;
      return `<li class="lk-q" data-q="${q.id}">
        <span class="lk-tag">Q${index + 1} · ${escapeHtml(q.standard)}</span>
        <fieldset ${state.checked ? "disabled" : ""}>
          <legend>${renderRich(text.prompt)}</legend>
          ${text.options.map((option, optionIndex) => {
            const letter = "ABCD"[optionIndex];
            return `<label class="lk-option ${state.checked && state.chosen === letter ? (right ? "lk-right" : "lk-wrong") : ""}"><input type="radio" name="lk-${q.id}" value="${letter}" ${state.chosen === letter ? "checked" : ""}/><span><b>${letter}.</b> ${escapeHtml(option)}</span></label>`;
          }).join("")}
        </fieldset>
        <div class="lk-q-actions">
          ${state.checked ? `<button type="button" class="lk-btn" data-retry="${q.id}">${t("tryAgain")}</button>` : `<button type="button" class="lk-btn lk-primary" data-check="${q.id}" ${state.chosen ? "" : "disabled"}>${t("check")}</button>`}
        </div>
        <p class="lk-feedback ${right ? "lk-right" : state.checked ? "lk-wrong" : ""}" aria-live="polite">${state.checked ? `<b>${right ? t("correct") : t("notQuite")}</b> ${escapeHtml(feedback)}` : ""}</p>
      </li>`;
    }).join("")}</ol>`;
  host.querySelectorAll("input[type=radio]").forEach((input) => input.addEventListener("change", () => {
    const id = input.closest(".lk-q").dataset.q;
    answers.set(id, { chosen: input.value, checked: false });
    host.querySelector(`[data-check="${id}"]`).disabled = false;
  }));
  host.querySelectorAll("[data-check]").forEach((button) => button.addEventListener("click", () => {
    const id = button.dataset.check;
    answers.set(id, { ...answers.get(id), checked: true });
    renderChecks();
    host.querySelector(`[data-q="${id}"] .lk-feedback`)?.focus?.();
  }));
  host.querySelectorAll("[data-retry]").forEach((button) => button.addEventListener("click", () => {
    const id = button.dataset.retry;
    answers.delete(id);
    renderChecks();
    host.querySelector(`[data-q="${id}"] input`)?.focus();
  }));
}

/** Start the kit. Call once, before the lab's own first render. */
export function initLab(labContent) {
  content = labContent;
  setupPopover();
  setLang(readStoredLang());
}
