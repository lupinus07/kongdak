/**
 * 카카오톡 공유(카카오 JavaScript SDK). 카카오 개발자 센터의 JavaScript 키를 NEXT_PUBLIC_KAKAO_JS_KEY에 넣고,
 * 같은 앱의 [플랫폼 > Web]에 사이트 도메인을 등록해야 동작한다. 키가 없거나 SDK를 못 불러오면 null.
 * JavaScript 키는 원래 브라우저에 공개되는 키라 NEXT_PUBLIC_으로 둬도 된다 (REST·Admin 키와 다름).
 */

const SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";

type KakaoLink = { mobileWebUrl: string; webUrl: string };
export type KakaoFeed = {
  objectType: "feed";
  content: { title: string; description: string; imageUrl: string; imageWidth?: number; imageHeight?: number; link: KakaoLink };
  buttons?: { title: string; link: KakaoLink }[];
};
type KakaoSDK = {
  init(key: string): void;
  isInitialized(): boolean;
  Share: { sendDefault(feed: KakaoFeed): void };
};

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

let loading: Promise<KakaoSDK | null> | null = null;
let loaded: KakaoSDK | null = null;

function ready(kakao: KakaoSDK, key: string) {
  if (!kakao.isInitialized()) kakao.init(key);
  loaded = kakao;
  return kakao;
}

/** 이미 불러온 SDK. 버튼을 누른 순간 바로 보내야 해서(팝업 차단 방지) 기다리지 않고 꺼내 쓴다. */
export function getKakao() {
  return loaded;
}

/** SDK를 한 번만 불러온다. 공유 창을 열 때 미리 불러 두면, 버튼을 누르는 즉시 보낼 수 있다. */
export function loadKakao(): Promise<KakaoSDK | null> {
  const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!key) return Promise.resolve(null);
  loading ??= new Promise((resolve) => {
    if (window.Kakao) return resolve(ready(window.Kakao, key));
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve(window.Kakao ? ready(window.Kakao, key) : null);
    script.onerror = () => {
      loading = null; // 다음에 다시 시도
      resolve(null);
    };
    document.head.appendChild(script);
  });
  return loading;
}
