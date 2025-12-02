// common.js

// 현재 로그인되어 있는 카테고리 가져오기
function getCurrentCategory() {
  // 로그인 시 저장한 값
  const saved = localStorage.getItem("adCategory");

  // 아무것도 없으면 기본값 CLOTHES
  return saved || "CLOTHES";
}
