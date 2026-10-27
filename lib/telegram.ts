/**
 * 새 문의가 오면 운영자 텔레그램으로 알린다. TELEGRAM_BOT_TOKEN·TELEGRAM_CHAT_ID(서버 전용, NEXT_PUBLIC_ 금지)가 없으면 건너뛴다.
 * 문의 내용·연락처는 보내지 않는다(텔레그램 서버로 개인정보가 나가지 않게). 내용은 관리자 화면에서 본다.
 */
export async function notifyTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!res.ok) console.error("텔레그램 알림 실패", res.status);
  } catch (e) {
    console.error("텔레그램 알림 실패", e instanceof Error ? e.message : e);
  }
}
