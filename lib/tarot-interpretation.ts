import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { TarotTopicId } from "./tarot";

export type TarotInterpretation = {
  headline: string;
  keywords: string[];
  meaning: string;
  topicReading: string;
  advice: string;
};

type Row = {
  headline: string;
  message: string;
  advice: string;
  tarot_cards: { keywords_up: string[]; keywords_rev: string[]; meaning_up: string; meaning_rev: string } | null;
};

/**
 * 카드 × 정/역 × 고민 카테고리 풀이를 tarot_interpretations에서 읽는다 (카드 키워드·기본 의미는 tarot_cards).
 * 두 테이블 모두 누구나 조회 가능(RLS select 허용)이라 비회원도 브라우저에서 바로 읽는다.
 * 서버(공유 페이지 등)에서는 createPublicClient()를 넘겨 쓴다.
 * 데이터: design/tarot_seed.sql. 못 찾거나 실패하면 null.
 */
export async function fetchInterpretation(
  card: number,
  reversed: boolean,
  topic: TarotTopicId,
  client: SupabaseClient = createClient(),
): Promise<TarotInterpretation | null> {
  const { data, error } = await client
    .from("tarot_interpretations")
    .select("headline, message, advice, tarot_cards(keywords_up, keywords_rev, meaning_up, meaning_rev)")
    .eq("card_id", card)
    .eq("topic_code", topic)
    .eq("is_reversed", reversed)
    .maybeSingle<Row>();
  if (error || !data?.tarot_cards) return null;
  const c = data.tarot_cards;
  return {
    headline: data.headline,
    keywords: reversed ? c.keywords_rev : c.keywords_up,
    meaning: reversed ? c.meaning_rev : c.meaning_up,
    topicReading: data.message,
    advice: data.advice,
  };
}
