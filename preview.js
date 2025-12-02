// preview.js
document.addEventListener("DOMContentLoaded", () => {
  const videoEl = document.getElementById("previewVideo");
  if (!videoEl) return;

  const params = new URLSearchParams(window.location.search);
  // const age = params.get("age");           // 예: "10"
  // const category = params.get("category"); // 예: "CLOTHES"
  const id = params.get("id"); // 예: "CLOTHES"

  if (!id) {
    alert("영상 정보를 불러올 수 없습니다.");
    window.history.back();
    return;
  }

  const src = `http://${API_BASE_URL}/api/ad-videos/${id}/video`;

  videoEl.src = src;

  videoEl.play().catch((err) => {
    console.warn("자동 재생이 차단되었습니다. 사용자가 직접 재생해야 합니다.", err);
  });
});
