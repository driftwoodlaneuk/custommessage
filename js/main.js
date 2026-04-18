const params = new URLSearchParams(window.location.search);

/*
  Compact scene format:
  ?bg=<colour>&s=msg,mt,mc,img,it,ic,dly,dur~msg,mt,mc,img,it,ic,dly,dur

  Fields:
  msg = message text (URL-encode this in your generator)
  mt  = message transition code
  mc  = message colour code or hex
  img = SVG filename without .svg
  it  = image transition code
  ic  = image colour code or hex
  dly = delay code or raw milliseconds
  dur = duration code or raw milliseconds

  Example:
  ?bg=k&s=I,1,r,heart,5,p,2,4~love,1,B,circle,5,y,1,5
*/

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
  d: "",          // default / no override

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
const heroImage = document.getElementById("hero-image");

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

function normalizeHex(value) {
  if (!value) return "";

  const trimmed = value.trim();

  // Already decoded hex, eg #ff0000 or #f00
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) {
    return trimmed;
  }

  return "";
}

function getColorValue(code) {
  if (!code) return "";

  const trimmed = code.trim();

  if (Object.prototype.hasOwnProperty.call(COLOR_CODES, trimmed)) {
    return COLOR_CODES[trimmed];
  }

  const hex = normalizeHex(trimmed);
  if (hex) {
    return hex;
  }

  return "";
}

function getBackgroundValue() {
  const raw = params.get("bg");
  if (!raw) return DEFAULT_BACKGROUND;

  const decoded = decodeText(raw);
  const color = getColorValue(decoded);

  return color || DEFAULT_BACKGROUND;
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
        mc: decodeText((p[2] || "d").trim()),
        img: sanitizeImageName((p[3] || "").trim()),
        it: (p[4] || "1").trim(),
        ic: decodeText((p[5] || "d").trim()),
        dly: (p[6] || "0").trim(),
        dur: (p[7] || "5").trim()
      };
    })
    .filter(scene => scene.msg || scene.img);

  return scenes.length ? scenes : [DEFAULT_SCENE];
}

function msgClass(type) {
  switch (type) {
    case 1:
      return "msg-fade";
    case 2:
      return "msg-zoom";
    case 3:
      return "msg-slide";
    case 4:
      return "msg-spin";
    default:
      return "msg-fade";
  }
}

function imgClass(type) {
  switch (type) {
    case 1:
      return "img-zoom-in";
    case 2:
      return "img-zoom-out";
    case 3:
      return "img-spin-cw";
    case 4:
      return "img-spin-ccw";
    case 5:
      return "img-fade";
    default:
      return "img-zoom-in";
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

  pageMessage.style.color = "";
  heroImage.style.filter = "";
  heroImage.src = "";
  heroImage.alt = "SVG artwork";

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
      heroImage.src = `img/${scene.img}.svg`;
      heroImage.alt = scene.img;
      heroImage.classList.add(imgClass(parseInt(scene.it, 10)));

      const imgColor = getColorValue(scene.ic);
      if (imgColor) {
        // Works as a simple recolour helper for many SVG/icon cases.
        heroImage.style.filter = `drop-shadow(0 0 0 ${imgColor})`;
      }
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
