// Content Library 페이지용 스크립트
document.addEventListener("DOMContentLoaded", () => {
  const contentList = document.getElementById("content-list");
  if (!contentList) return; // 이 페이지가 아니면 종료

  // 로그인한 카테고리 기반으로 기본값 설정
  const DEFAULT_CATEGORY = getCurrentCategory();
  let currentCategory = DEFAULT_CATEGORY;

  // ---- 백엔드에서 받은 ageGroup(숫자) -> 사람이 읽기 좋은 문자열 ----
  const AGE_LABEL = {
    10: "10대",
    20: "20대",
    30: "30대",
    40: "40대",
    50: "50+",
  };

  // 서버에서 내려주는 AdVideoListItemResponse -> 화면 표시용 오브젝트로 매핑
  function mapFromServer(item) {
    return {
      id: item.id,
      title: item.originalFileName || item.fileName || "광고 영상",
      category: item.category,           // "CLOTHES"
      age: item.ageGroup,               // 10, 20, 30...
      ages: AGE_LABEL[item.ageGroup] || `${item.ageGroup}대`,
      uploadDate: item.createdAt ? item.createdAt.slice(0, 10) : "",
      thumbnail: item.thumbnailUrl || "images/sample-jacket.png",
    };
  }

  // ---- 리스트 렌더링 ----
  function renderContentList(items) {
    contentList.innerHTML = "";

    if (!items || items.length === 0) {
      contentList.innerHTML = `<p>등록된 광고 영상이 없습니다.</p>`;
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "content-card";

      card.innerHTML = `
        <div class="content-card-header">
          <img src="${item.thumbnail}" alt="thumbnail" class="content-thumbnail" />
          <div class="content-info">
            <div class="file-name">${item.title}</div>
            <div class="meta">Age Groups: ${item.ages}</div>
            <div class="meta">Upload Date: ${item.uploadDate}</div>
          </div>
        </div>
        <div class="content-card-actions">
          <button class="library-btn preview">Preview</button>
          <button class="library-btn delete">Delete</button>
        </div>
      `;

      // 📌 Preview 버튼 클릭 → preview.html 이동 (age + category 넘김)
      card.querySelector(".preview").addEventListener("click", () => {
        const id = item.id;

        window.location.href = `preview.html?id=${id}`;
      });

      // 📌 Delete 버튼 클릭 → DELETE /api/ad-videos/{id} 후 목록 새로고침
      card.querySelector(".delete").addEventListener("click", async () => {
        const ok = confirm("정말 이 광고 영상을 삭제하시겠습니까?");
        if (!ok) return;

        try {
          const res = await fetch(
            `http://${API_BASE_URL}/api/ad-videos/${item.id}`,
            { method: "DELETE" }
          );

          if (!res.ok) {
            alert("삭제 중 오류가 발생했습니다.");
            return;
          }

          alert("삭제되었습니다!");

          // 삭제 후 현재 카테고리 그대로 다시 로딩
          await loadContents(currentCategory);
        } catch (e) {
          console.error(e);
          alert("삭제 요청 중 네트워크 오류가 발생했습니다.");
        }
      });

      contentList.appendChild(card);
    });
  }

  // ---- 서버에서 목록 불러오기 ----
  async function loadContents(category) {
    // category가 안 들어오면, 마지막 선택된 category 사용
    if (!category) {
      category = currentCategory;
    } else {
      currentCategory = category;
    }

    try {
      const res = await fetch(
        `http://${API_BASE_URL}/api/ad-videos/by-category?category=${category}`
      );

      if (!res.ok) {
        throw new Error("목록 조회 실패");
      }

      const data = await res.json();
      const items = data.map(mapFromServer);
      renderContentList(items);
    } catch (e) {
      console.error(e);
      contentList.innerHTML =
        "<p>광고 영상 목록을 불러오는 중 오류가 발생했습니다.</p>";
    }
  }

  // ✅ 최초 로딩 시 CLOTHES 카테고리로 호출
  loadContents(DEFAULT_CATEGORY);
});
