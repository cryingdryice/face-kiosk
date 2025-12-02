// admode.js

// --- 설정값 ---
const API_BASE_URL = "http://localhost:8080/api/ad-videos"; // 백엔드 base path

// --- DOM 요소 ---
const adVideoEl = document.getElementById("ADVideo");

// --- 상태값 ---
let currentAge = 10;             // 현재 연령대 (10, 20, 30, 40, 50 등)
let currentCategory = null;      // 현재 카테고리 (common.js에서 가져옴)
let ageChangeTimerId = null;     // setInterval 아이디

// 백엔드 호출 URL 만들기
function buildVideoUrl(age, category) {
  const params = new URLSearchParams({
    age: age.toString(),
    category: category,
  });

  return `${API_BASE_URL}/video?${params.toString()}`;
}

// 실제로 영상 src 교체해서 재생
function loadVideo() {
  if (!adVideoEl) return;

  const url = buildVideoUrl(currentAge, currentCategory);

  adVideoEl.pause();
  adVideoEl.removeAttribute("src");

  adVideoEl.src = url;

  // 컨트롤 완전 비활성화
  adVideoEl.controls = false;
  adVideoEl.setAttribute("controlsList", "nodownload noplaybackrate nofullscreen");
  adVideoEl.disablePictureInPicture = true;

  adVideoEl.loop = true;
  adVideoEl.load();

  adVideoEl
    .play()
    .catch((err) => {
      console.warn("Video autoplay failed: ", err);
    });
}


// 10초마다 연령대 랜덤 변경 + 영상 다시 로드
function startRandomAgeLoop() {
  if (ageChangeTimerId) {
    clearInterval(ageChangeTimerId);
  }

  ageChangeTimerId = setInterval(() => {
    // 예: 10대, 20대, 30대, 40대, 50+
    const AGE_OPTIONS = [10, 20, 30, 40, 50];

    const nextAge =
      AGE_OPTIONS[Math.floor(Math.random() * AGE_OPTIONS.length)];

    currentAge = nextAge;
    console.log("[AdMode] 연령대 변경:", currentAge, "대");

    loadVideo();
  }, 10_000); // 10초
}

// --- 실제 얼굴 연령 인식이 호출할 수 있는 함수 ---
// 예: 얼굴 인식 모듈에서 window.setDetectedAgeGroup(20) 호출
window.setDetectedAgeGroup = function (age) {
  currentAge = age;
  console.log("[AdMode] 감지된 연령대 적용:", currentAge, "대");
  loadVideo();
};

// --- 초기 진입 시 실행 ---
window.addEventListener("DOMContentLoaded", () => {
  // common.js 에서 제공하는 카테고리 사용
  if (typeof getCurrentCategory === "function") {
    currentCategory = getCurrentCategory();
  } else {
    // 방어 코드: 혹시 common.js 로드 실패 시 기본값
    currentCategory = "CLOTHES";
  }

  console.log("[AdMode] 카테고리:", currentCategory);

  // 첫 영상 로드
  loadVideo();

  // 임시: 10초마다 랜덤 연령대 변경
  startRandomAgeLoop();
});

// ------------ 길게 누르면 뒤로가기 오버레이 표시 ------------

const LONG_PRESS_DURATION = 1000; // 3초
let pressTimer = null;

const overlayEl = document.getElementById("exitOverlay");
const backBtnEl = document.getElementById("backButton");

// 오버레이 보이기 / 숨기기
function showExitOverlay() {
  if (!overlayEl) return;
  overlayEl.classList.add("visible");
}

function hideExitOverlay() {
  if (!overlayEl) return;
  overlayEl.classList.remove("visible");
}

function startPressTimer(e) {
  // 기본 동작(재생바 표시 등) 막기
  if (e.cancelable) {
    e.preventDefault();
  }
  e.stopPropagation();

  // 오른쪽 클릭은 무시
  if (e.type === "mousedown" && e.button !== 0) return;

  if (pressTimer != null) return;

  pressTimer = setTimeout(() => {
    showExitOverlay();
    pressTimer = null;
  }, LONG_PRESS_DURATION);
}


// 손/마우스 뗄 때 취소
function cancelPressTimer() {
  if (pressTimer != null) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
}

// 뒤로가기 버튼 클릭 시 동작
if (backBtnEl) {
  backBtnEl.addEventListener("click", (e) => {
    e.stopPropagation(); // 오버레이 클릭 이벤트로 안 넘어가게
    history.back();
  });
}

// 오버레이 배경 클릭 시 닫기
if (overlayEl) {
  overlayEl.addEventListener("click", (e) => {
    // 배경(overlay) 자체를 눌렀을 때만 닫기
    if (e.target === overlayEl) {
      hideExitOverlay();
    }
  });
}

// 이벤트 등록 (영상 위에서 길게 누르면 실행)
if (adVideoEl) {
  // PC
  adVideoEl.addEventListener("mousedown", startPressTimer);
  window.addEventListener("mouseup", cancelPressTimer);
  adVideoEl.addEventListener("mouseleave", cancelPressTimer);

  // 터치
  adVideoEl.addEventListener("touchstart", startPressTimer);
  adVideoEl.addEventListener("touchend", cancelPressTimer);
  adVideoEl.addEventListener("touchcancel", cancelPressTimer);
  adVideoEl.addEventListener("touchmove", cancelPressTimer);
}
