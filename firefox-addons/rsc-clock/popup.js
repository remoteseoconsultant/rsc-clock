/*
 * Author: Md. Istiqur Rahman
 * Remote SEO Consultant (SaaS & eCommerce) | Remote GTM Manager for Solopreneurs & Entrepreneurs
 * Expert in Organic SEO, AI/LLM Search Optimization (AIO, AEO, GEO) | Full Stack Marketer
 * Practicing since 2008.
 *
 * "Most businesses spend on marketing that fails to convert. They get either no traffic
 * or spam traffic. I fix that by building precise SEO and digital marketing systems that
 * turn visitors into loyal customers."
 *
 * Website: https://remoteseoconsultant.com
 * Contact: contact@remoteseoconsultant.com
 */

const DEFAULTS = {
  hour12: true,
  showSeconds: true,
  themeMode: "auto",
  bgColor: "",
  clockColor: "",
  font: "system",
  tz1: "",
  tz2: "",
  activePage: "digital"
};

const TIMEZONES = [
  ["", "Select timezone…"],
  ["America/New_York", "New York (ET)"],
  ["America/Chicago", "Chicago (CT)"],
  ["America/Denver", "Denver (MT)"],
  ["America/Los_Angeles", "Los Angeles (PT)"],
  ["America/Sao_Paulo", "São Paulo"],
  ["Europe/London", "London"],
  ["Europe/Paris", "Paris"],
  ["Europe/Berlin", "Berlin"],
  ["Europe/Moscow", "Moscow"],
  ["Africa/Cairo", "Cairo"],
  ["Asia/Dubai", "Dubai"],
  ["Asia/Kolkata", "India (IST)"],
  ["Asia/Dhaka", "Dhaka"],
  ["Asia/Bangkok", "Bangkok"],
  ["Asia/Singapore", "Singapore"],
  ["Asia/Shanghai", "China (CST)"],
  ["Asia/Tokyo", "Tokyo"],
  ["Asia/Seoul", "Seoul"],
  ["Australia/Sydney", "Sydney"],
  ["Pacific/Auckland", "Auckland"],
  ["UTC", "UTC"]
];

const TZ_LABELS = Object.fromEntries(TIMEZONES);

const BG_SWATCHES = ["#fbfbfb", "#1a1428", "#6f2dbd", "#a663cc", "#171123"];
const CLOCK_SWATCHES = ["#6f2dbd", "#a663cc", "#171123", "#ffffff", "#f9a825"];

const ANALOG_CLOCKS = [
  { id: "local", tzKey: null },
  { id: "tz1", tzKey: "tz1" },
  { id: "tz2", tzKey: "tz2" }
];

const els = {
  clockLocal: document.getElementById("clock-local"),
  clockTz1: document.getElementById("clock-tz1"),
  clockTz2: document.getElementById("clock-tz2"),
  tz1: document.getElementById("tz1"),
  tz2: document.getElementById("tz2"),
  settingsToggle: document.getElementById("settings-toggle"),
  settingsPanel: document.getElementById("settings-panel"),
  hour12: document.getElementById("hour12"),
  showSeconds: document.getElementById("showSeconds"),
  themeMode: document.getElementById("themeMode"),
  bgColorSwatches: document.getElementById("bgColorSwatches"),
  clockColorSwatches: document.getElementById("clockColorSwatches"),
  font: document.getElementById("font"),
  tabs: document.querySelectorAll(".tab"),
  pages: document.querySelectorAll(".page"),
  analogPage: document.getElementById("analog-page")
};

let settings = { ...DEFAULTS };

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function formatTime(date, timeZone) {
  const opts = {
    hour: "numeric",
    minute: "2-digit",
    hour12: settings.hour12
  };
  if (settings.showSeconds) opts.second = "2-digit";
  if (timeZone) opts.timeZone = timeZone;
  return new Intl.DateTimeFormat(undefined, opts).format(date);
}

function getTimeParts(date, timeZone) {
  const opts = { hourCycle: "h23", hour: "2-digit", minute: "2-digit", second: "2-digit" };
  if (timeZone) opts.timeZone = timeZone;
  const parts = new Intl.DateTimeFormat("en-US", opts).formatToParts(date);
  const map = {};
  parts.forEach((p) => (map[p.type] = p.value));
  return { h: Number(map.hour), m: Number(map.minute), s: Number(map.second) };
}

function populateTzSelects() {
  [els.tz1, els.tz2].forEach((select) => {
    select.replaceChildren();
    TIMEZONES.forEach(([value, label]) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = label;
      select.appendChild(opt);
    });
  });
  els.tz1.value = settings.tz1;
  els.tz2.value = settings.tz2;
}

function buildSwatches(container, colors, settingKey) {
  container.replaceChildren();
  colors.forEach((color) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "swatch";
    btn.style.backgroundColor = color;
    btn.title = color;
    btn.dataset.color = color;
    if (settings[settingKey] === color) btn.classList.add("selected");
    btn.addEventListener("click", () => {
      save({ [settingKey]: color });
      markSelectedSwatch(container, color);
    });
    container.appendChild(btn);
  });
}

function markSelectedSwatch(container, color) {
  container.querySelectorAll(".swatch").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.color === color);
  });
}

function applyFontClass() {
  const fontClass = settings.font !== "system" ? `font-${settings.font}` : "";
  [els.clockLocal, els.clockTz1, els.clockTz2].forEach((el) => {
    el.className = "clock-time" + (fontClass ? ` ${fontClass}` : "");
  });
}

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

// Builds one analog clock face with all 12 numbers shown, via safe DOM APIs.
function buildAnalogClockSVG(id) {
  const cx = 50, cy = 50, r = 42, numberRadius = 34;
  const svg = svgEl("svg", { viewBox: "0 0 100 100", width: "104", height: "104", "data-clock": id });

  svg.appendChild(svgEl("circle", { cx, cy, r, class: "analog-face" }));

  for (let n = 1; n <= 12; n++) {
    const angle = (n * 30 * Math.PI) / 180;
    const x = (cx + numberRadius * Math.sin(angle)).toFixed(2);
    const y = (cy - numberRadius * Math.cos(angle)).toFixed(2);
    const text = svgEl("text", {
      x, y,
      class: "analog-number",
      "text-anchor": "middle",
      "dominant-baseline": "middle"
    });
    text.textContent = String(n);
    svg.appendChild(text);
  }

  const hands = [
    ["hand-hour", `hour-${id}`, 20],
    ["hand-minute", `minute-${id}`, 30],
    ["hand-second", `second-${id}`, 34]
  ];
  hands.forEach(([cls, dataHand, length]) => {
    svg.appendChild(
      svgEl("line", {
        x1: cx, y1: cy, x2: cx, y2: cy - length,
        class: `analog-hand ${cls}`,
        "data-hand": dataHand
      })
    );
  });

  svg.appendChild(svgEl("circle", { cx, cy, r: 2.5, class: "analog-center" }));

  return svg;
}

function buildAnalogPage() {
  const wrapper = document.createElement("div");
  wrapper.className = "analog-clocks";
  ANALOG_CLOCKS.forEach(({ id }) => {
    const clockDiv = document.createElement("div");
    clockDiv.className = "analog-clock";
    const label = document.createElement("div");
    label.className = "clock-label";
    label.dataset.analogLabel = id;
    clockDiv.appendChild(label);
    clockDiv.appendChild(buildAnalogClockSVG(id));
    wrapper.appendChild(clockDiv);
  });
  els.analogPage.replaceChildren(wrapper);
}

function updateAnalogLabels() {
  ANALOG_CLOCKS.forEach(({ id, tzKey }) => {
    const label = els.analogPage.querySelector(`[data-analog-label="${id}"]`);
    if (!label) return;
    if (!tzKey) {
      label.textContent = "Local";
    } else {
      const tzValue = settings[tzKey];
      label.textContent = tzValue ? TZ_LABELS[tzValue] : "Select timezone…";
    }
  });
}

function updateAnalogHands(now) {
  ANALOG_CLOCKS.forEach(({ id, tzKey }) => {
    const timeZone = tzKey ? settings[tzKey] : undefined;
    const { h, m, s } = getTimeParts(now, timeZone);

    const hourAngle = ((h % 12) + m / 60) * 30;
    const minuteAngle = (m + s / 60) * 6;
    const secondAngle = s * 6;

    const hourHand = els.analogPage.querySelector(`[data-hand="hour-${id}"]`);
    const minuteHand = els.analogPage.querySelector(`[data-hand="minute-${id}"]`);
    const secondHand = els.analogPage.querySelector(`[data-hand="second-${id}"]`);

    if (hourHand) hourHand.setAttribute("transform", `rotate(${hourAngle} 50 50)`);
    if (minuteHand) minuteHand.setAttribute("transform", `rotate(${minuteAngle} 50 50)`);
    if (secondHand) {
      secondHand.style.display = settings.showSeconds ? "" : "none";
      secondHand.setAttribute("transform", `rotate(${secondAngle} 50 50)`);
    }
  });
}

function applyDisplay() {
  const now = new Date();
  els.clockLocal.textContent = formatTime(now);
  els.clockTz1.textContent = settings.tz1 ? formatTime(now, settings.tz1) : "—";
  els.clockTz2.textContent = settings.tz2 ? formatTime(now, settings.tz2) : "—";

  applyFontClass();
  updateAnalogHands(now);

  let mode = settings.themeMode;
  if (mode === "auto") mode = systemPrefersDark() ? "dark" : "light";
  const themeBg = mode === "dark" ? "#1a1428" : "#fbfbfb";
  const themeText = mode === "dark" ? "#f4f2f8" : "#6f2dbd";

  const bg = settings.bgColor || themeBg;
  const text = settings.clockColor || themeText;

  document.body.style.backgroundColor = bg;
  document.body.style.color = text;
  document.documentElement.style.setProperty("--clock-text", text);
  [els.clockLocal, els.clockTz1, els.clockTz2].forEach((el) => {
    el.style.color = text;
  });
}

function populateForm() {
  els.hour12.checked = settings.hour12;
  els.showSeconds.checked = settings.showSeconds;
  els.themeMode.value = settings.themeMode;
  els.font.value = settings.font;
  populateTzSelects();
  buildSwatches(els.bgColorSwatches, BG_SWATCHES, "bgColor");
  buildSwatches(els.clockColorSwatches, CLOCK_SWATCHES, "clockColor");
  updateAnalogLabels();
}

function save(partial) {
  settings = { ...settings, ...partial };
  chrome.storage.sync.set(partial);
  if ("tz1" in partial || "tz2" in partial) updateAnalogLabels();
  applyDisplay();
}

function switchPage(page) {
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.page === page));
  els.pages.forEach((p) => p.classList.toggle("hidden", p.dataset.page !== page));
}

els.hour12.addEventListener("change", (e) => save({ hour12: e.target.checked }));
els.showSeconds.addEventListener("change", (e) => save({ showSeconds: e.target.checked }));
els.themeMode.addEventListener("change", (e) => save({ themeMode: e.target.value }));
els.font.addEventListener("change", (e) => save({ font: e.target.value }));
els.tz1.addEventListener("change", (e) => save({ tz1: e.target.value }));
els.tz2.addEventListener("change", (e) => save({ tz2: e.target.value }));

document.querySelectorAll("button.reset").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    save({ [target]: "" });
    const container = target === "bgColor" ? els.bgColorSwatches : els.clockColorSwatches;
    markSelectedSwatch(container, "");
  });
});

els.settingsToggle.addEventListener("click", () => {
  els.settingsPanel.classList.toggle("hidden");
});

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    save({ activePage: tab.dataset.page });
    switchPage(tab.dataset.page);
  });
});

chrome.storage.sync.get(DEFAULTS, (stored) => {
  settings = stored;
  buildAnalogPage();
  populateForm();
  switchPage(settings.activePage);
  applyDisplay();
  setInterval(applyDisplay, 1000);
});
