# Medical AI 강의 슬라이드 — GitHub Pages 배포

AI SaMD 의료기기 인허가 및 임상 강의자료 (인터랙티브 HTML 슬라이드, 34장).

## 바로 열기
`index.html`을 브라우저로 열면 됩니다. ←/→·스페이스로 슬라이드 이동, 좌측 썸네일 클릭으로 점프.

## GitHub Pages에 올리기

### 방법 A — 웹에서 (가장 쉬움)
1. github.com → **New repository** → 이름 입력(예: `medical-ai-lecture`) → **Create**
2. 새 레포 화면에서 **uploading an existing file** 클릭
3. 이 폴더 안의 파일 전부(`index.html`, `styles.css`, `app.js`, `bg.js`, `deck-stage.js`, `image-slot.js`)를 드래그해서 올리고 **Commit changes**
4. 레포 → **Settings** → **Pages** → Source를 **Deploy from a branch**, Branch를 **main / (root)** 선택 → **Save**
5. 1~2분 뒤 `https://<아이디>.github.io/medical-ai-lecture/` 로 접속

### 방법 B — 커맨드라인
```bash
cd site
git init
git add .
git commit -m "Medical AI lecture deck"
git branch -M main
git remote add origin https://github.com/<아이디>/medical-ai-lecture.git
git push -u origin main
```
이후 Settings → Pages 에서 위 4~5단계 동일.

## 참고
- 폰트(Space Grotesk, Pretendard)는 CDN에서 불러오므로 온라인에서 정상 표시됩니다.
- 이미지 슬라이드(7·11~14·18·21·22·24·30·33)는 보는 사람이 직접 사진을 끌어다 넣는 슬롯입니다. 사진을 미리 고정해 넣으려면 알려주세요.
