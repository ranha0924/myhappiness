// ===== DATA =====
var moments = [
  { emoji: '🌅', title: '이른 아침, 아무도 없는 거리를 혼자 걷는다', desc: '세상이 아직 조용한 시간' },
  { emoji: '🍚', title: '점심시간, 혼자 밥을 먹는다', desc: '주변은 시끄럽고 나만 조용하다' },
  { emoji: '📞', title: '오랜 친구에게 갑자기 전화가 온다', desc: '별 이유 없이 네 생각이 났다고 한다' },
  { emoji: '💻', title: '밤새 작업한 프로젝트가 드디어 완성됐다', desc: '모니터에 결과물이 떠오르는 순간' },
  { emoji: '🌧️', title: '비 오는 날 창가에 앉아 빗소리를 듣는다', desc: '아무것도 하지 않아도 되는 시간' },
  { emoji: '🧪', title: '시험 전날, 밤새 책상 앞에 앉아 있다', desc: '눈이 감기지만 포기하고 싶지 않다' },
  { emoji: '📖', title: '책에서 내 마음을 정확히 표현한 문장을 발견한다', desc: '이걸 쓴 사람도 나와 같은 생각이었구나' },
  { emoji: '🤝', title: '크게 싸운 사람과 어색하게 화해한다', desc: '아직 마음이 풀리진 않았지만 먼저 손을 내밀었다' },
  { emoji: '💔', title: '실패한 뒤, 다시 처음부터 시작하기로 한다', desc: '막막하지만 멈추고 싶지는 않다' },
  { emoji: '🛋️', title: '아무 약속 없는 주말, 이불 속에서 뒹군다', desc: '죄책감 없이 쉬는 하루' },
  { emoji: '🎵', title: '좋아하는 노래를 이어폰으로 크게 듣는다', desc: '세상과 잠시 단절된 나만의 시간' },
  { emoji: '🌙', title: '하루를 마치고 침대에 누워 오늘을 돌아본다', desc: '나쁘지 않은 하루였다고 느끼는 순간' },
];

// Colors for "not happy" orbs when they return (diverse colors)
var returnColors = [
  0x7B68EE, // medium slate blue
  0x6495ED, // cornflower blue
  0x9370DB, // medium purple
  0x87CEEB, // sky blue
  0xDDA0DD, // plum
  0x48D1CC, // medium turquoise
  0xBA55D3, // medium orchid
  0x00CED1, // dark turquoise
  0xB0C4DE, // light steel blue
  0x8FBC8F, // dark sea green
  0xF0E68C, // khaki
  0xE6E6FA, // lavender
];

// ===== STATE =====
var currentIndex = 0;
var choices = [];
var isTransitioning = false;
var currentPhase = 'intro';
var orbs = [];

// ===== THREE.JS GLOBALS =====
var scene, camera, renderer, starField, pointLight;
var clock = new THREE.Clock();

// ===== THREE.JS SETUP =====
function initThree() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 30);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  document.body.insertBefore(renderer.domElement, document.body.firstChild);

  var ambientLight = new THREE.AmbientLight(0x404060, 0.5);
  scene.add(ambientLight);

  pointLight = new THREE.PointLight(0xFFD700, 1.5, 100);
  pointLight.position.set(0, 5, 15);
  scene.add(pointLight);

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===== STAR PARTICLE SYSTEM =====
function createStars() {
  var count = 1500;
  var geometry = new THREE.BufferGeometry();
  var positions = new Float32Array(count * 3);
  var colors = new Float32Array(count * 3);

  for (var i = 0; i < count; i++) {
    var r = 200 * Math.cbrt(Math.random());
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    var brightness = 0.3 + Math.random() * 0.7;
    colors[i * 3] = brightness;
    colors[i * 3 + 1] = brightness;
    colors[i * 3 + 2] = brightness;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Create soft circle texture
  var canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  var ctx = canvas.getContext('2d');
  var gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  var starTexture = new THREE.CanvasTexture(canvas);

  var material = new THREE.PointsMaterial({
    size: 1.5,
    map: starTexture,
    transparent: true,
    vertexColors: true,
    sizeAttenuation: true,
    depthWrite: false
  });

  starField = new THREE.Points(geometry, material);
  scene.add(starField);
}

// ===== ORB SYSTEM (star-like sprites) =====
var orbTexture = null;

function createOrbTexture(color, size) {
  var canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  var ctx = canvas.getContext('2d');
  var half = size / 2;

  // Outer glow
  var g1 = ctx.createRadialGradient(half, half, 0, half, half, half);
  g1.addColorStop(0, 'rgba(255,255,255,1)');
  g1.addColorStop(0.15, 'rgba(255,255,255,0.8)');
  g1.addColorStop(0.4, 'rgba(255,255,255,0.3)');
  g1.addColorStop(0.7, 'rgba(255,255,255,0.08)');
  g1.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

function createOrbs() {
  orbTexture = createOrbTexture(0xFFFFFF, 128);

  for (var i = 0; i < moments.length; i++) {
    var mat = new THREE.SpriteMaterial({
      map: orbTexture,
      color: 0xFFFFFF,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.setScalar(1.5);

    // Random initial position for intro
    var angle = (i / moments.length) * Math.PI * 2;
    var radius = 6 + Math.random() * 6;
    var x = Math.cos(angle) * radius;
    var y = (Math.random() - 0.5) * 8;
    var z = Math.sin(angle) * radius * 0.5;

    sprite.position.set(x, y, z);
    scene.add(sprite);

    orbs.push({
      index: i,
      mesh: sprite,
      state: 'intro',
      position: sprite.position.clone(),
      targetPosition: sprite.position.clone(),
      opacity: 1.0,
      targetOpacity: 1.0,
      scale: 1.5,
      targetScale: 1.5,
      orbitAngle: angle,
      orbitRadius: 5 + Math.random() * 2,
      orbitSpeed: 0.3 + Math.random() * 0.2,
      bobOffset: Math.random() * Math.PI * 2
    });
  }
}

// ===== ORB ANIMATION =====
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function updateOrbs(elapsed) {
  var factor = 0.03;

  for (var i = 0; i < orbs.length; i++) {
    var orb = orbs[i];

    // Lerp toward targets
    orb.position.x = lerp(orb.position.x, orb.targetPosition.x, factor);
    orb.position.y = lerp(orb.position.y, orb.targetPosition.y, factor);
    orb.position.z = lerp(orb.position.z, orb.targetPosition.z, factor);
    orb.opacity = lerp(orb.opacity, orb.targetOpacity, factor);
    orb.scale = lerp(orb.scale, orb.targetScale, factor);

    // Bobbing for intro and orbiting states
    if (orb.state === 'intro') {
      orb.mesh.position.set(
        orb.position.x,
        orb.position.y + Math.sin(elapsed * 0.8 + orb.bobOffset) * 0.5,
        orb.position.z
      );
    } else if (orb.state === 'happy') {
      // Orbit around center in upper area
      orb.orbitAngle += orb.orbitSpeed * 0.01;
      var ox = Math.cos(orb.orbitAngle) * orb.orbitRadius;
      var oz = Math.sin(orb.orbitAngle) * orb.orbitRadius * 0.4;
      orb.targetPosition.x = ox;
      orb.targetPosition.z = oz;
      orb.mesh.position.set(
        orb.position.x,
        orb.position.y + Math.sin(elapsed + orb.bobOffset) * 0.2,
        orb.position.z
      );
    } else if (orb.state === 'result1-circle' || orb.state === 'result2-heart') {
      orb.mesh.position.set(
        orb.position.x,
        orb.position.y + Math.sin(elapsed * 0.5 + orb.bobOffset) * 0.15,
        orb.position.z
      );
    } else {
      orb.mesh.position.copy(orb.position);
    }

    // Apply scale and opacity
    orb.mesh.scale.setScalar(orb.scale);
    orb.mesh.material.opacity = orb.opacity;

    // Pulse for result states
    if (orb.state === 'result1-circle') {
      var pulse = 1 + Math.sin(elapsed * 2 + orb.bobOffset) * 0.08;
      orb.mesh.scale.setScalar(orb.scale * pulse);
    }
  }
}

// ===== ARRANGEMENT FUNCTIONS =====
function arrangeOrbsCircle(orbList, radius, centerY) {
  for (var i = 0; i < orbList.length; i++) {
    var angle = (i / orbList.length) * Math.PI * 2 - Math.PI / 2;
    orbList[i].targetPosition.set(
      Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius * 0.6,
      0
    );
    orbList[i].targetScale = 1.5;
    orbList[i].targetOpacity = 1.0;
  }
}

function arrangeOrbsHeart(orbList) {
  for (var i = 0; i < orbList.length; i++) {
    var t = (i / orbList.length) * Math.PI * 2;
    var hx = 16 * Math.pow(Math.sin(t), 3);
    var hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    orbList[i].targetPosition.set(hx * 0.25, hy * 0.25, 0);
    orbList[i].targetScale = 1.5;
    orbList[i].targetOpacity = 1.0;
  }
}

// ===== DOM REFERENCES =====
var sceneIntro = document.getElementById('scene-intro');
var sceneCards = document.getElementById('scene-cards');
var sceneResult = document.getElementById('scene-result');

var btnStart = document.getElementById('btn-start');
var btnYes = document.getElementById('btn-yes');
var btnNo = document.getElementById('btn-no');
var btnReveal = document.getElementById('btn-reveal');
var btnFinal = document.getElementById('btn-final');
var btnRestart = document.getElementById('btn-restart');

var cardTitle = document.getElementById('card-title');
var cardDesc = document.getElementById('card-desc');
var momentCard = document.getElementById('moment-card');
var orbCountEl = document.getElementById('orb-count');
var bridgeTextEl = document.getElementById('bridge-text');
var resultStat = document.getElementById('result-stat');

var step1 = document.getElementById('result-step1');
var step2 = document.getElementById('result-step2');
var step3 = document.getElementById('result-step3');

// ===== SCENE SWITCHING =====
function switchScene(from, to) {
  from.classList.remove('active');
  to.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ===== PHASE: INTRO =====
function setupIntro() {
  currentPhase = 'intro';
  for (var i = 0; i < orbs.length; i++) {
    orbs[i].state = 'intro';
    orbs[i].targetOpacity = 1.0;
    orbs[i].targetScale = 1.5;
  }
}

function startFromIntro() {
  // Scatter orbs outward
  for (var i = 0; i < orbs.length; i++) {
    var angle = Math.random() * Math.PI * 2;
    var dist = 40 + Math.random() * 30;
    orbs[i].targetPosition.set(
      Math.cos(angle) * dist,
      (Math.random() - 0.5) * 40,
      Math.sin(angle) * dist * 0.3
    );
    orbs[i].targetOpacity = 0;
    orbs[i].targetScale = 0.5;
    orbs[i].state = 'hidden';
  }

  setTimeout(function () {
    switchScene(sceneIntro, sceneCards);
    currentPhase = 'card';
    currentIndex = 0;
    showMoment(0);
  }, 800);
}

// ===== PHASE: CARDS =====
function showMoment(index) {
  var m = moments[index];
  cardTitle.textContent = m.title;
  cardDesc.textContent = m.desc;

  var happyCount = choices.filter(function (c) { return c; }).length;
  orbCountEl.textContent = happyCount > 0 ? (happyCount + '개의 행복') : '';

  // Bring the orb to center
  var orb = orbs[index];
  orb.state = 'active';
  orb.targetPosition.set(0, 3, 10);
  orb.targetScale = 2.5;
  orb.targetOpacity = 1.0;
  orb.mesh.material.color.setHex(0xFFFFFF);

  momentCard.classList.remove('card-exit', 'card-enter');
  momentCard.classList.add('card-enter');
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      momentCard.classList.remove('card-enter');
    });
  });
}

function handleChoice(isHappy) {
  if (isTransitioning) return;
  isTransitioning = true;

  choices.push(isHappy);
  var orb = orbs[currentIndex];

  if (isHappy) {
    // Fly to orbit zone
    orb.state = 'happy';
    orb.targetPosition.set(0, 10, 0);
    orb.targetScale = 1.2;
    orb.targetOpacity = 1.0;
  } else {
    // Dim and push far away
    orb.state = 'notHappy';
    var angle = Math.random() * Math.PI * 2;
    orb.targetPosition.set(
      Math.cos(angle) * 50,
      (Math.random() - 0.5) * 30,
      Math.sin(angle) * 20
    );
    orb.targetScale = 0.8;
    orb.targetOpacity = 0.15;
    orb.mesh.material.color.setHex(0xFFFFFF);
  }

  momentCard.classList.add('card-exit');

  currentIndex++;

  // Check for bridge text
  var showBridge = (currentIndex === 4 || currentIndex === 8) && currentIndex < moments.length;

  setTimeout(function () {
    if (currentIndex >= moments.length) {
      isTransitioning = false;
      showResult();
    } else if (showBridge) {
      showBridgeTextFn(currentIndex === 4 ? '작은 순간들이 모여...' : '행복은 어떤 모양일까요...');
      setTimeout(function () {
        hideBridgeText();
        setTimeout(function () {
          showMoment(currentIndex);
          isTransitioning = false;
        }, 400);
      }, 2500);
    } else {
      showMoment(currentIndex);
      isTransitioning = false;
    }
  }, 500);
}

function showBridgeTextFn(text) {
  bridgeTextEl.innerHTML = '<p>' + text + '</p>';
  bridgeTextEl.classList.add('active');
}

function hideBridgeText() {
  bridgeTextEl.classList.remove('active');
  bridgeTextEl.innerHTML = '';
}

// ===== PHASE: RESULTS =====
function showResult() {
  currentPhase = 'result1';
  switchScene(sceneCards, sceneResult);

  var happyOrbs = [];
  var unhappyOrbs = [];
  for (var i = 0; i < orbs.length; i++) {
    if (choices[i]) {
      happyOrbs.push(orbs[i]);
    } else {
      unhappyOrbs.push(orbs[i]);
    }
  }

  // Arrange happy orbs in circle at center
  for (var j = 0; j < happyOrbs.length; j++) {
    happyOrbs[j].state = 'result1-circle';
  }
  arrangeOrbsCircle(happyOrbs, 4, 0);

  // Keep unhappy orbs dim and far
  for (var k = 0; k < unhappyOrbs.length; k++) {
    unhappyOrbs[k].targetOpacity = 0.12;
    unhappyOrbs[k].targetScale = 0.6;
  }

  var happyCount = happyOrbs.length;
  resultStat.textContent = happyCount + ' / 12개의 순간을 행복이라 답했어요';
}

function showStep2() {
  currentPhase = 'result2';
  step1.style.display = 'none';
  step2.style.display = 'block';
  step2.style.opacity = '0';
  requestAnimationFrame(function () {
    step2.style.transition = 'opacity 0.5s ease';
    step2.style.opacity = '1';
  });

  // Reveal text lines sequentially (2 lines now)
  var lines = [
    document.getElementById('reveal-line-1'),
    document.getElementById('reveal-line-2'),
  ];
  lines.forEach(function (line, i) {
    setTimeout(function () {
      line.classList.add('show');
    }, 400 + i * 600);
  });

  // After text, bring back unhappy orbs with diverse colors
  var unhappyOrbs = [];
  for (var i = 0; i < orbs.length; i++) {
    if (!choices[i]) {
      unhappyOrbs.push(orbs[i]);
    }
  }

  var baseDelay = 400 + lines.length * 600 + 600;

  unhappyOrbs.forEach(function (orb, idx) {
    setTimeout(function () {
      // Set diverse return color (blue/purple tones)
      orb.mesh.material.color.setHex(0xFFFFFF);

      orb.state = 'result2-heart';
      orb.targetOpacity = 1.0;
      orb.targetScale = 1.5;
    }, baseDelay + idx * 300);
  });

  // After all return, form heart with ALL orbs
  var heartDelay = baseDelay + unhappyOrbs.length * 300 + 500;
  setTimeout(function () {
    for (var i = 0; i < orbs.length; i++) {
      orbs[i].state = 'result2-heart';
    }
    arrangeOrbsHeart(orbs);
  }, heartDelay);

  // Show body text
  var revealBody = step2.querySelector('.reveal-body');
  setTimeout(function () {
    revealBody.classList.add('show');
  }, heartDelay + 800);
}

function showStep3() {
  currentPhase = 'result3';
  step2.style.display = 'none';
  step3.style.display = 'block';
  step3.style.opacity = '0';
  requestAnimationFrame(function () {
    step3.style.transition = 'opacity 0.5s ease';
    step3.style.opacity = '1';
  });

  // Keep heart rotating
  // (handled in animate loop)

  var essayLines = step3.querySelectorAll('.essay-line');
  essayLines.forEach(function (line, i) {
    setTimeout(function () {
      line.classList.add('show');
    }, 400 + i * 500);
  });

  var signature = step3.querySelector('.signature');
  setTimeout(function () {
    signature.classList.add('show');
  }, 400 + essayLines.length * 500 + 300);

  setTimeout(function () {
    btnRestart.classList.add('show');
  }, 400 + essayLines.length * 500 + 600);
}

// ===== RESET =====
function resetAll() {
  currentIndex = 0;
  choices = [];
  isTransitioning = false;
  currentPhase = 'intro';

  // Reset HTML states
  step1.style.display = 'block';
  step2.style.display = 'none';
  step3.style.display = 'none';
  orbCountEl.textContent = '';
  hideBridgeText();

  // Remove animation classes
  step2.querySelectorAll('.show').forEach(function (el) { el.classList.remove('show'); });
  step3.querySelectorAll('.show').forEach(function (el) { el.classList.remove('show'); });
  btnRestart.classList.remove('show');
  var sig = step3.querySelector('.signature');
  if (sig) sig.classList.remove('show');

  // Reset orbs
  for (var i = 0; i < orbs.length; i++) {
    var orb = orbs[i];
    var angle = (i / moments.length) * Math.PI * 2;
    var radius = 6 + Math.random() * 6;

    orb.state = 'intro';
    orb.targetPosition.set(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 8,
      Math.sin(angle) * radius * 0.5
    );
    orb.targetScale = 1.5;
    orb.targetOpacity = 1.0;
    orb.scale = 0.3;
    orb.opacity = 0;

    orb.mesh.material.color.setHex(0xFFFFFF);
  }

  switchScene(sceneResult, sceneIntro);
}

// ===== ANIMATION LOOP =====
var heartRotation = 0;

function animate() {
  requestAnimationFrame(animate);
  var elapsed = clock.getElapsedTime();

  // Stars
  if (starField) {
    starField.rotation.y += 0.0001;
    starField.rotation.x += 0.00005;
  }

  // Orbs
  updateOrbs(elapsed);

  // Heart rotation in result3
  if (currentPhase === 'result3' || currentPhase === 'result2') {
    heartRotation += 0.003;
    for (var i = 0; i < orbs.length; i++) {
      if (orbs[i].state === 'result2-heart') {
        // Rotate around Y axis
        var tx = orbs[i].targetPosition.x;
        var tz = orbs[i].targetPosition.z;
        var cos = Math.cos(0.003);
        var sin = Math.sin(0.003);
        orbs[i].targetPosition.x = tx * cos - tz * sin;
        orbs[i].targetPosition.z = tx * sin + tz * cos;
      }
    }
  }

  renderer.render(scene, camera);
}

// ===== EVENT LISTENERS =====
btnStart.addEventListener('click', startFromIntro);
btnYes.addEventListener('click', function () { handleChoice(true); });
btnNo.addEventListener('click', function () { handleChoice(false); });
btnReveal.addEventListener('click', showStep2);
btnFinal.addEventListener('click', showStep3);
btnRestart.addEventListener('click', resetAll);

// ===== INIT =====
initThree();
createStars();
createOrbs();
setupIntro();
animate();
