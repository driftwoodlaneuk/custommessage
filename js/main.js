const DEFAULT_MESSAGE = 'I love you lots, but';
const DEFAULT_IMAGE = 'middle-finger-svgrepo-com';
const DEFAULT_MESSAGE_TRANSITION = '2';
const DEFAULT_IMAGE_TRANSITION = '1';
const INITIAL_DELAY_MS = 3000;
const SCENE_DURATION_MS = 2200;

const ALLOWED_IMAGES = {
  'middle-finger-svgrepo-com': 'img/middle-finger-svgrepo-com.svg',
  circle: 'img/circle.svg',
  square: 'img/square.svg',
  triangle: 'img/triangle.svg',
  heart: 'img/heart.svg'
};

const MESSAGE_TRANSITIONS = new Set(['1', '2', '3', '4']);
const IMAGE_TRANSITIONS = new Set(['1', '2', '3', '4', '5']);

function normaliseSearch(search) {
  return search.replace(/^\?/, '').replace(/,\s*(?=[a-z]+\d*=)/gi, '&');
}

function cleanText(value) {
  if (!value) {
    return '';
  }

  let text = value.trim();

  if (
    (text.startsWith("'") && text.endsWith("'")) ||
    (text.startsWith('"') && text.endsWith('"'))
  ) {
    text = text.slice(1, -1).trim();
  }

  return text;
}

function buildScenes() {
  const params = new URLSearchParams(normaliseSearch(window.location.search));
  const indexSet = new Set();

  for (const key of params.keys()) {
    const match = key.match(/^(msg|msgt|img|imgt)(\d+)$/i);
    if (match) {
      indexSet.add(Number.parseInt(match[2], 10));
    }
  }

  const sortedIndexes = [...indexSet].sort((a, b) => a - b);

  if (!sortedIndexes.length) {
    return [
      {
        message: cleanText(params.get('message')) || DEFAULT_MESSAGE,
        msgTransition: DEFAULT_MESSAGE_TRANSITION,
        image: DEFAULT_IMAGE,
        imgTransition: DEFAULT_IMAGE_TRANSITION
      }
    ];
  }

  const scenes = [];

  for (const index of sortedIndexes) {
    const message = cleanText(params.get(`msg${index}`));
    const msgTransition = params.get(`msgt${index}`) || DEFAULT_MESSAGE_TRANSITION;
    const image = cleanText(params.get(`img${index}`));
    const imgTransition = params.get(`imgt${index}`) || DEFAULT_IMAGE_TRANSITION;

    if (!message && !image) {
      continue;
    }

    scenes.push({
      message,
      msgTransition: MESSAGE_TRANSITIONS.has(msgTransition) ? msgTransition : DEFAULT_MESSAGE_TRANSITION,
      image: ALLOWED_IMAGES[image] ? image : '',
      imgTransition: IMAGE_TRANSITIONS.has(imgTransition) ? imgTransition : DEFAULT_IMAGE_TRANSITION
    });
  }

  return scenes.length
    ? scenes
    : [{
        message: DEFAULT_MESSAGE,
        msgTransition: DEFAULT_MESSAGE_TRANSITION,
        image: DEFAULT_IMAGE,
        imgTransition: DEFAULT_IMAGE_TRANSITION
      }];
}

function resetScene(sceneElement, targetElement) {
  sceneElement.className = sceneElement.className.replace(/\bis-active\b/g, '').trim();
  targetElement.className = targetElement.className
    .replace(/\btransition-(msg|img)-\d+\b/g, '')
    .replace(/\bmotion-target\b/g, '')
    .trim();

  // Force reflow so the same animation can replay on the next scene.
  void sceneElement.offsetWidth;
}

function playScene(scene, messageScene, messageElement, imageScene, imageElement, index, total) {
  const hasMessage = Boolean(scene.message);
  const hasImage = Boolean(scene.image && ALLOWED_IMAGES[scene.image]);

  resetScene(messageScene, messageElement);
  resetScene(imageScene, imageElement);

  if (hasMessage) {
    messageElement.textContent = scene.message;
    messageElement.classList.add('motion-target', `transition-msg-${scene.msgTransition}`);
    messageScene.classList.add('is-active');
    document.title = scene.message;
  }

  if (hasImage) {
    imageElement.src = ALLOWED_IMAGES[scene.image];
    imageElement.alt = `${scene.image} SVG artwork`;
    imageElement.classList.add('motion-target', `transition-img-${scene.imgTransition}`);
    imageScene.classList.add('is-active');
  }

  if (!hasMessage && !hasImage) {
    return;
  }

  const isLastScene = index === total - 1;

  if (isLastScene) {
    window.setTimeout(() => {
      if (hasMessage) {
        messageScene.style.opacity = '1';
        messageScene.style.visibility = 'visible';
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'none';
      }

      if (hasImage) {
        imageScene.style.opacity = '1';
        imageScene.style.visibility = 'visible';
        imageElement.style.opacity = '1';
        imageElement.style.transform = 'none';
      }
    }, SCENE_DURATION_MS);
  }
}

window.addEventListener('load', () => {
  const messageScene = document.getElementById('message-scene');
  const imageScene = document.getElementById('image-scene');
  const messageElement = document.getElementById('page-message');
  const imageElement = document.getElementById('hero-image');
  const scenes = buildScenes();

  document.documentElement.style.setProperty('--scene-duration', `${SCENE_DURATION_MS}ms`);

  window.setTimeout(() => {
    scenes.forEach((scene, index) => {
      window.setTimeout(() => {
        playScene(scene, messageScene, messageElement, imageScene, imageElement, index, scenes.length);
      }, index * SCENE_DURATION_MS);
    });
  }, INITIAL_DELAY_MS);
});
