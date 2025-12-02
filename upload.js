const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const previewArea = document.getElementById("previewArea");
const detailsBox = document.getElementById("detailsBox");
const uploadBox = document.getElementById("uploadBox");
const resetBtn = document.getElementById("resetBtn");
const registerBtn = document.getElementById("registerBtn");

let selectedFile = null;   // 업로드할 파일
let selectedAge = null;    // 선택된 연령대 숫자 (10,20,...)

// ✅ 카테고리는 "로그인에서 선택한 업계"를 사용 (localStorage)
function getCategory() {
  const saved = localStorage.getItem("adCategory"); // "CLOTHES" 또는 "TRAVEL"
  return saved || "CLOTHES"; // 로그인 안 했으면 기본값 CLOTHES
}

// 파일 선택 버튼 클릭 → input 열기
uploadBtn.addEventListener("click", () => fileInput.click());

// 파일 선택 시 미리보기 + 상태 변경
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  selectedFile = file;

  const reader = new FileReader();
  reader.onload = function (ev) {
    previewArea.innerHTML = `<video src="${ev.target.result}" class="preview-image" controls/></video>`;
    uploadBtn.textContent = "Change File";
    detailsBox.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

// 리셋 버튼
resetBtn.addEventListener("click", () => {
  fileInput.value = "";
  selectedFile = null;
  selectedAge = null;

  previewArea.innerHTML = `<p>No file selected</p>`;
  uploadBtn.textContent = "Upload File";
  detailsBox.classList.add("hidden");

  document.querySelectorAll(".age-btn").forEach((b) => b.classList.remove("selected"));
});

// 연령대 버튼 선택 토글
document.querySelectorAll(".age-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".age-btn").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    const ageValue = btn.dataset.age; // data-age="10" 이런 식
    selectedAge = ageValue ? parseInt(ageValue, 10) : null;
  });
});

// 실제 업로드 요청
registerBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    alert("먼저 파일을 업로드해주세요.");
    return;
  }

  if (!selectedAge) {
    alert("타겟 연령대를 선택해주세요.");
    return;
  }

  const category = getCategory(); // CLOTHES / TRAVEL 등

  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("category", category); // @RequestParam("category") AdCategory category
  formData.append("age", selectedAge);   // @RequestParam("age") int age

  try {
    const res = await fetch(`http://${API_BASE_URL}/api/ad-videos/upload`, {
      method: "POST",
      body: formData,
      // Content-Type은 브라우저가 자동으로 지정하므로 건드리지 말 것
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("업로드 실패:", errorText);
      alert("업로드에 실패했습니다.\n" + errorText);
      return;
    }

    const data = await res.json();

    alert("영상 업로드가 완료되었습니다!");

    // 업로드 후 현재 페이지 새로고침 or 컨텐츠 라이브러리로 이동
    location.reload();
    // 또는: location.href = "library.html";
  } catch (err) {
    console.error(err);
    alert("서버와 통신 중 오류가 발생했습니다.");
  }
});
