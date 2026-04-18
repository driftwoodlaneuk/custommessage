const params = new URLSearchParams(window.location.search);

const COLORS = {
  "0": "",
  "1": "#ffffff",
  "2": "#000000",
  "3": "#ff0000",
  "4": "#0000ff",
  "5": "#00ff00",
  "6": "#ffff00",
  "7": "#ff69b4"
};

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

function sanitizeImageName(name) {
  return (name || "").replace(/[^a-zA-Z0-9_-]/g, "");
}

function getScenes() {
  const packed = params.get("s");
  if (!packed) {
    return [{
      msg: "I love you lots, but",
      mt: "1",
      mc: "0",
      img: "heart",
      it: "1",
      ic: "0",
      dly: "6",
      dur: "5"
    }];
  }

  return packed.split("~").map(entry => {
    const p = entry.split(",");
    return {
      msg: decodeURIComponent(p[0] || ""),
      mt: p[1] || "0",
      mc: p[2] || "0",
      img: sanitizeImageName(p[3] || ""),
      it: p[4] || "0",
      ic: p[5] || "0",
      dly: p[6] || "0",
      dur: p[7] || "5"
    };
  });
}

function msgClass(t){
  return ["","msg-fade","msg-zoom","msg-slide","msg-spin"][t] || "msg-fade";
}
function imgClass(t){
  return ["","img-zoom-in","img-zoom-out","img-spin-cw","img-spin-ccw","img-fade"][t] || "img-zoom-in";
}

const messageScene = document.getElementById("message-scene");
const imageScene = document.getElementById("image-scene");
const pageMessage = document.getElementById("page-message");
const heroImage = document.getElementById("hero-image");

function reset(){
  messageScene.style.display="none";
  imageScene.style.display="none";
  pageMessage.className="title";
  heroImage.className="hero-image";
}

function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function play(){
  const scenes = getScenes();

  for(const s of scenes){
    reset();

    await wait(TIMES[s.dly] ?? 0);

    if(s.msg){
      messageScene.style.display="flex";
      pageMessage.textContent = s.msg;
      pageMessage.classList.add(msgClass(parseInt(s.mt)));
      if(COLORS[s.mc]) pageMessage.style.color = COLORS[s.mc];
    }

    if(s.img){
      imageScene.style.display="flex";
      heroImage.src = "img/" + s.img + ".svg";
      heroImage.classList.add(imgClass(parseInt(s.it)));
      if(COLORS[s.ic]){
        heroImage.style.filter = "drop-shadow(0 0 0 " + COLORS[s.ic] + ")";
      }
    }

    await wait(TIMES[s.dur] ?? 2000);
  }
}

window.addEventListener("load", play);
