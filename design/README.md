# 콩닥 디자인 파일

- `index.html` : 화면 목록 (브라우저로 열면 화면끼리 링크로 이동돼요)
- `screens/` : 화면별 HTML (폭 390px 모바일 기준)
- `kongdak_schema.sql` : Supabase 테이블
- `kongdak_icon_*.png` : 앱 아이콘

## 디자인 기준
- 배경 #FFF0F5 / 메인 #C2255C / 포인트 #FF6B9A / 글자 #4A2B38 / 보조 글자 #7A5566
- 강조 배지 #FFD43B
- 제목 폰트 Jua, 본문 폰트 Gowun Dodum (Google Fonts)
- 카드 모서리 20~30px, 버튼 높이 56~58px

## Claude Code에 이렇게 요청하기 (예시)
> design/screens/01-Main4.html 을 참고해서 Next.js App Router + Tailwind로
> app/page.tsx 메인 화면을 만들어줘. 색상과 폰트는 design/README.md 기준으로
> tailwind.config에 등록하고, 하트·캐릭터 SVG는 components/icons로 분리해줘.

화면 하나씩 순서대로 옮기는 걸 추천해요.
