// ===== 데이터 =====
const moments = [
  { emoji: '🌅', title: '이른 아침, 아무도 없는 거리를 혼자 걷는다', desc: '세상이 아직 조용한 시간' },
  { emoji: '🍜', title: '오랜만에 좋아하는 음식을 먹는다', desc: '한 입 먹는 순간 기분이 좋아진다' },
  { emoji: '📞', title: '오랜 친구에게 갑자기 전화가 온다', desc: '별 이유 없이 네 생각이 났다고 한다' },
  { emoji: '💻', title: '밤새 작업한 프로젝트가 드디어 완성됐다', desc: '모니터에 결과물이 떠오르는 순간' },
  { emoji: '🌧️', title: '비 오는 날 창가에 앉아 빗소리를 듣는다', desc: '아무것도 하지 않아도 되는 시간' },
  { emoji: '🏃', title: '운동 후 숨을 고르며 하늘을 본다', desc: '온몸이 지쳤지만 이상하게 기분이 좋다' },
  { emoji: '📖', title: '책에서 내 마음을 정확히 표현한 문장을 발견한다', desc: '이걸 쓴 사람도 나와 같은 생각이었구나' },
  { emoji: '🎂', title: '생일에 예상 못 한 서프라이즈를 받는다', desc: '나를 기억하고 준비해준 사람들' },
  { emoji: '🌱', title: '어제는 못 했던 것을 오늘은 해낸다', desc: '작지만 분명한 성장' },
  { emoji: '🛋️', title: '아무 약속 없는 주말, 이불 속에서 뒹군다', desc: '죄책감 없이 쉬는 하루' },
  { emoji: '🎵', title: '좋아하는 노래를 이어폰으로 크게 듣는다', desc: '세상과 잠시 단절된 나만의 시간' },
  { emoji: '🌙', title: '하루를 마치고 침대에 누워 오늘을 돌아본다', desc: '나쁘지 않은 하루였다고 느끼는 순간' },
];

// ===== 상태 =====
let currentIndex = 0;
let choices = []; // true = 행복, false = 아님
let isTransitioning = false;

// ===== DOM =====
const sceneIntro = document.getElementById('scene-intro');
const sceneCards = document.getElementById('scene-cards');
const sceneResult = document.getElementById('scene-result');

const btnStart = document.getElementById('btn-start');
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const btnReveal = document.getElementById('btn-reveal');
const btnFinal = document.getElementById('btn-final');
const btnRestart = document.getElementById('btn-restart');

const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const cardEmoji = document.getElementById('card-emoji');
const cardTitle = document.getElementById('card-title');
const cardDesc = document.getElementById('card-desc');
const momentCard = document.getElementById('moment-card');
const collectedEmojis = document.getElementById('collected-emojis');

const mosaicGrid = document.getElementById('mosaic-grid');
const mosaicGridFull = document.getElementById('mosaic-grid-full');
const resultStat = document.getElementById('result-stat');

const step1 = document.getElementById('result-step1');
const step2 = document.getElementById('result-step2');
const step3 = document.getElementById('result-step3');

// ===== 씬 전환 =====
function switchScene(from, to) {
  from.classList.remove('active');
  to.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ===== 카드 렌더링 =====
function renderCard(index) {
  const m = moments[index];
  cardEmoji.textContent = m.emoji;
  cardTitle.textContent = m.title;
  cardDesc.textContent = m.desc;
  progressFill.style.width = ((index + 1) / moments.length * 100) + '%';
  progressText.textContent = (index + 1) + ' / ' + moments.length;
}

// ===== 카드 전환 애니메이션 =====
function transitionCard(nextIndex) {
  if (isTransitioning) return;
  isTransitioning = true;

  momentCard.classList.add('card-exit');

  setTimeout(function () {
    renderCard(nextIndex);
    momentCard.classList.remove('card-exit');
    momentCard.classList.add('card-enter');

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        momentCard.classList.remove('card-enter');
        isTransitioning = false;
      });
    });
  }, 400);
}

// ===== 선택 처리 =====
function handleChoice(isHappy) {
  if (isTransitioning) return;

  choices.push(isHappy);

  if (isHappy) {
    var span = document.createElement('span');
    span.className = 'collected-emoji';
    span.textContent = moments[currentIndex].emoji;
    collectedEmojis.appendChild(span);
  }

  currentIndex++;

  if (currentIndex >= moments.length) {
    setTimeout(function () {
      showResult();
    }, 300);
  } else {
    transitionCard(currentIndex);
  }
}

// ===== 결과 표시 =====
function showResult() {
  switchScene(sceneCards, sceneResult);
  buildMosaicStep1();
}

function buildMosaicStep1() {
  mosaicGrid.innerHTML = '';
  var happyCount = 0;

  moments.forEach(function (m, i) {
    var div = document.createElement('div');
    div.className = 'mosaic-item';

    if (choices[i]) {
      div.classList.add('filled');
      div.textContent = m.emoji;
      happyCount++;
    } else {
      div.classList.add('empty');
    }

    mosaicGrid.appendChild(div);
  });

  resultStat.textContent = happyCount + ' / 12개의 순간을 행복이라 답했어요';
}

// ===== 반전 (스텝 2) =====
function showStep2() {
  step1.style.display = 'none';
  step2.style.display = 'block';
  step2.style.opacity = '0';

  requestAnimationFrame(function () {
    step2.style.transition = 'opacity 0.5s ease';
    step2.style.opacity = '1';
  });

  // 반전 텍스트 순차 등장
  var lines = [
    document.getElementById('reveal-line-1'),
    document.getElementById('reveal-line-2'),
    document.getElementById('reveal-line-3'),
  ];

  lines.forEach(function (line, i) {
    setTimeout(function () {
      line.classList.add('show');
    }, 400 + i * 600);
  });

  // 모자이크 완성
  buildMosaicStep2();

  // 본문 텍스트
  var revealBody = step2.querySelector('.reveal-body');
  setTimeout(function () {
    revealBody.classList.add('show');
  }, 400 + lines.length * 600 + 800);
}

function buildMosaicStep2() {
  mosaicGridFull.innerHTML = '';

  var delayBase = 400 + 3 * 600 + 200;

  moments.forEach(function (m, i) {
    var div = document.createElement('div');
    div.className = 'mosaic-item';

    if (choices[i]) {
      div.classList.add('filled');
      div.textContent = m.emoji;
    } else {
      // 처음에는 빈 칸으로 표시, 후에 채워짐
      div.classList.add('empty');
      div.textContent = '';

      setTimeout(function () {
        div.classList.remove('empty');
        div.classList.add('glow');
        div.textContent = m.emoji;
      }, delayBase + i * 120);
    }

    mosaicGridFull.appendChild(div);
  });
}

// ===== 최종 메시지 (스텝 3) =====
function showStep3() {
  step2.style.display = 'none';
  step3.style.display = 'block';
  step3.style.opacity = '0';

  requestAnimationFrame(function () {
    step3.style.transition = 'opacity 0.5s ease';
    step3.style.opacity = '1';
  });

  // 에세이 단락 순차 등장
  var essayLines = step3.querySelectorAll('.essay-line');
  essayLines.forEach(function (line, i) {
    setTimeout(function () {
      line.classList.add('show');
    }, 400 + i * 500);
  });

  // 서명
  var signature = step3.querySelector('.signature');
  setTimeout(function () {
    signature.classList.add('show');
  }, 400 + essayLines.length * 500 + 300);

  // 다시하기 버튼
  setTimeout(function () {
    btnRestart.classList.add('show');
  }, 400 + essayLines.length * 500 + 600);
}

// ===== 초기화 =====
function resetAll() {
  currentIndex = 0;
  choices = [];
  isTransitioning = false;
  collectedEmojis.innerHTML = '';
  mosaicGrid.innerHTML = '';
  mosaicGridFull.innerHTML = '';

  step1.style.display = 'block';
  step2.style.display = 'none';
  step3.style.display = 'none';

  // 애니메이션 클래스 초기화
  step2.querySelectorAll('.show').forEach(function (el) { el.classList.remove('show'); });
  step3.querySelectorAll('.show').forEach(function (el) { el.classList.remove('show'); });
  btnRestart.classList.remove('show');

  var sig = step3.querySelector('.signature');
  if (sig) sig.classList.remove('show');

  switchScene(sceneResult, sceneIntro);
}

// ===== 이벤트 =====
btnStart.addEventListener('click', function () {
  switchScene(sceneIntro, sceneCards);
  renderCard(0);
});

btnYes.addEventListener('click', function () {
  handleChoice(true);
});

btnNo.addEventListener('click', function () {
  handleChoice(false);
});

btnReveal.addEventListener('click', showStep2);
btnFinal.addEventListener('click', showStep3);
btnRestart.addEventListener('click', resetAll);
