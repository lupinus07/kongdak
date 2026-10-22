/** next/og 미리보기 그림용 Jua 폰트. 그림에 들어가는 글자만 Google Fonts에서 받는다 (한글 전체 폰트는 너무 커서). */
export async function loadJua(text: string) {
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=Jua&text=${encodeURIComponent(text)}`)
  ).text();
  const url = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(css)?.[1];
  if (!url) throw new Error("Jua 폰트를 찾지 못했어요");
  return (await fetch(url)).arrayBuffer();
}
