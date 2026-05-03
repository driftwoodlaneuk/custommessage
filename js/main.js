const params = new URLSearchParams(window.location.search);

const TIMES = {
  "0": 0,
  "1": 250,
  "2": 500,
  "3": 1000,
  "4": 1500,
  "5": 2000,
  "6": 3000,
  "7": 5000
};

const COLOR_CODES = {
  d: "",
  w: "#ffffff",
  W: "#f8f8f8",
  k: "#000000",
  K: "#222222",
  r: "#ff4d4d",
  R: "#ff0000",
  g: "#4dff88",
  G: "#00cc44",
  b: "#4d94ff",
  B: "#0000ff",
  y: "#ffd24d",
  Y: "#ffff00",
  p: "#ff69b4",
  P: "#ff1493",
  o: "#ffa500",
  O: "#ff7a00",
  c: "#00d9ff",
  C: "#00ffff",
  m: "#c77dff",
  M: "#a020f0"
};

const DEFAULT_SCENE = {
  msg: "I love you lots",
  mt: "1",
  mc: "w",
  img: "heart",
  it: "1",
  ic: "p",
  dly: "6",
  dur: "5"
};

const DEFAULT_BACKGROUND = "#111111";
const FADE_OUT_MS = 500;

const body = document.body;
const messageScene = document.getElementById("message-scene");
const imageScene = document.getElementById("image-scene");
const pageMessage = document.getElementById("page-message");

let heroImage = document.getElementById("hero-image");

// Replace <img> with a div so SVG can be inserted inline
if (heroImage && heroImage.tagName.toLowerCase() === "img") {
  const container = document.createElement("div");
  container.id = "hero-image";
  container.className = "hero-image";
  heroImage.replaceWith(container);
  heroImage = container;
}

function sanitizeImageName(name) {
  return (name || "").replace(/[^a-zA-Z0-9_-]/g, "");
}

function decodeText(value) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getTimeValue(code, fallback = 0) {
  if (Object.prototype.hasOwnProperty.call(TIMES, code)) {
    return TIMES[code];
  }

  const parsed = parseInt(code, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function getColorValue(code) {
  if (!code) return "";

  const trimmed = decodeText(code.trim());

  if (Object.prototype.hasOwnProperty.call(COLOR_CODES, trimmed)) {
    return COLOR_CODES[trimmed];
  }

  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) {
    return trimmed;
  }

  return "";
}

function getBackgroundValue() {
  const raw = params.get("bg");
  if (!raw) return DEFAULT_BACKGROUND;

  return getColorValue(raw) || DEFAULT_BACKGROUND;
}

function getScenes() {
  const packed = params.get("s");

  if (!packed) {
    return [DEFAULT_SCENE];
  }

  const scenes = packed
    .split("~")
    .map(entry => entry.trim())
    .filter(Boolean)
    .map(entry => {
      const p = entry.split(/[;,]/);

      return {
        msg: decodeText((p[0] || "").trim()),
        mt: (p[1] || "1").trim(),
        mc: (p[2] || "d").trim(),
        img: sanitizeImageName((p[3] || "").trim()),
        it: (p[4] || "1").trim(),
        ic: (p[5] || "d").trim(),
        dly: (p[6] || "0").trim(),
        dur: (p[7] || "5").trim()
      };
    })
    .filter(scene => scene.msg || scene.img);

  return scenes.length ? scenes : [DEFAULT_SCENE];
}

function msgClass(type) {
  switch (type) {
    case 1: return "msg-fade";
    case 2: return "msg-zoom";
    case 3: return "msg-slide";
    case 4: return "msg-spin";
    default: return "msg-fade";
  }
}

function imgClass(type) {
  switch (type) {
    case 1: return "img-zoom-in";
    case 2: return "img-zoom-out";
    case 3: return "img-spin-cw";
    case 4: return "img-spin-ccw";
    case 5: return "img-fade";
    default: return "img-zoom-in";
  }
}

function recolourSvgText(svgText, colour) {
  if (!colour) return svgText;

  return svgText
    .replace(/fill:\s*#[0-9a-fA-F]{3,6}/g, `fill:${colour}`)
    .replace(/stroke:\s*#[0-9a-fA-F]{3,6}/g, `stroke:${colour}`)
    .replace(/fill="(?!none)[^"]*"/g, `fill="${colour}"`)
    .replace(/stroke="(?!none)[^"]*"/g, `stroke="${colour}"`);
}

async function loadInlineSvg(imageName, colour) {
  const safeName = sanitizeImageName(imageName);
  if (!safeName) return;

  try {
    const response = await fetch(`img/${safeName}.svg`);

    if (!response.ok) {
      throw new Error(`Could not load img/${safeName}.svg`);
    }

    let svgText = await response.text();
    svgText = recolourSvgText(svgText, colour);

    heroImage.innerHTML = svgText;

    const svg = heroImage.querySelector("svg");
    if (svg) {
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute("aria-label", safeName);
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.display = "block";
    }
  } catch (error) {
    console.error(error);
    heroImage.innerHTML = "";
  }
}

function applyBackground() {
  body.style.background = getBackgroundValue();
}

function reset() {
  messageScene.style.display = "none";
  imageScene.style.display = "none";

  messageScene.className = "scene scene--message";
  imageScene.className = "scene scene--image";

  pageMessage.className = "title";
  heroImage.className = "hero-image";
  heroImage.innerHTML = "";

  pageMessage.style.color = "";
  messageScene.style.opacity = "";
  imageScene.style.opacity = "";
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function play() {
  applyBackground();

  const scenes = getScenes();

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const isLastScene = i === scenes.length - 1;

    reset();

    const delayMs = getTimeValue(scene.dly, 0);
    const durationMs = getTimeValue(scene.dur, 2000);

    if (delayMs > 0) {
      await wait(delayMs);
    }

    let hasMessage = false;
    let hasImage = false;

    if (scene.msg) {
      hasMessage = true;
      messageScene.style.display = "flex";
      pageMessage.textContent = scene.msg;
      pageMessage.classList.add(msgClass(parseInt(scene.mt, 10)));

      const msgColor = getColorValue(scene.mc);
      if (msgColor) {
        pageMessage.style.color = msgColor;
      }
    }

    if (scene.img) {
      hasImage = true;
      imageScene.style.display = "flex";
      heroImage.classList.add(imgClass(parseInt(scene.it, 10)));

      const imgColor = getColorValue(scene.ic);
      await loadInlineSvg(scene.img, imgColor);
    }

    if (!hasMessage && !hasImage) {
      continue;
    }

    if (isLastScene) {
      await wait(durationMs);
      continue;
    }

    const visibleTime = Math.max(0, durationMs - FADE_OUT_MS);
    await wait(visibleTime);

    if (hasMessage) {
      messageScene.classList.add("fade-out");
    }

    if (hasImage) {
      imageScene.classList.add("fade-out");
    }

    await wait(FADE_OUT_MS);
  }
}

window.addEventListener("load", play);
