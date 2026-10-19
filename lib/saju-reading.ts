import type { Element, Pillar, Saju } from "./saju";

/** 사주 원국 풀이. 계산된 Saju를 연애 중심 문장으로 옮긴다. AI는 쓰지 않고, 같은 입력이면 항상 같은 문장이 나온다. */

export type ReadingCard = { title: string; body: string; highlight?: boolean };

export const SITUATIONS = ["솔로", "썸", "연애 중", "이별 후"] as const;
export type Situation = (typeof SITUATIONS)[number];

const DAY_MASTER: Record<string, string> = {
  갑목: "곧게 뻗은 큰 나무 같은 사람이에요. 연애에서도 솔직하고 책임감 있게 다가가고, 마음이 정해지면 한결같은 편이에요. 다만 자존심 때문에 먼저 약한 모습을 보이기 어려울 수 있어요.",
  을목: "바람에 휘어도 꺾이지 않는 풀꽃 같은 사람이에요. 상대에게 잘 맞춰주고 배려가 깊은 편이에요. 속마음을 삼키다 혼자 지칠 수 있으니 서운한 건 작게라도 말해 보세요.",
  병화: "하늘 위의 태양처럼 밝고 따뜻한 사람이에요. 사랑 표현이 솔직하고 아낌없이 주는 편이에요. 마음이 빨리 달아오르는 만큼 상대 반응이 늦으면 서운해지기 쉬워요.",
  정화: "어둠을 밝히는 촛불 같은 사람이에요. 섬세하고 다정하며 한 사람에게 깊이 집중하는 편이에요. 감정이 마음속에서 오래 타올라서, 혼자 끌어안지 않고 나누면 한결 가벼워져요.",
  무토: "듬직한 큰 산 같은 사람이에요. 믿음직하고 느긋해서 곁에 있으면 편안함을 줘요. 표현이 서툴러 마음이 덜 전해질 수 있으니, 짧게라도 말로 건네면 좋아요.",
  기토: "곡식을 키우는 논밭 같은 사람이에요. 살뜰하게 챙기고 품어주는 편이에요. 상대를 먼저 챙기다 정작 내 마음은 뒤로 미룰 수 있으니, 나를 돌보는 시간도 꼭 두세요.",
  경금: "단단한 바위나 쇠 같은 사람이에요. 의리 있고 선이 분명해서 믿음을 줘요. 말투가 직선적이라 차갑게 들릴 수 있으니, 같은 말도 한 번 부드럽게 바꿔 보면 좋아요.",
  신금: "잘 다듬어진 보석 같은 사람이에요. 섬세하고 감각이 좋으며 취향이 분명해요. 상처받기 쉬워서 마음을 여는 데 시간이 걸리지만, 한번 열면 깊이 마음을 줘요.",
  임수: "넓게 흐르는 강이나 바다 같은 사람이에요. 자유롭고 포용력이 커요. 한곳에 묶이는 느낌이 들면 답답할 수 있어서, 서로의 시간을 존중하는 관계가 잘 맞아요.",
  계수: "촉촉하게 내리는 이슬비 같은 사람이에요. 감성이 풍부하고 상대의 기분을 잘 읽어요. 생각이 많아 혼자 앓을 때가 있으니, 속마음을 편하게 털어놓을 사람이 있으면 좋아요.",
};

const SPOUSE_PALACE: Record<string, string> = {
  비견: "친구처럼 편하고 대등한 사람과 잘 어울려요. 서로 닮은 점이 많을수록 편안하지만, 주도권을 두고 가볍게 부딪힐 때도 있어요.",
  겁재: "활발하고 승부욕 있는 사람에게 끌리기 쉬워요. 함께 있으면 에너지가 오르지만, 사소한 경쟁심이 생길 수 있어요.",
  식신: "같이 먹고 웃는 시간이 쌓일 때 마음이 깊어지는 편이에요. 정이 많고 여유로운 사람과 잘 맞아요.",
  상관: "말이 잘 통하고 표현이 풍부한 사람에게 끌려요. 자유롭고 재치 있는 관계를 좋아하고, 솔직한 말이 가끔 날카롭게 전해질 수 있어요.",
  편재: "활동적이고 시원시원한 사람과 인연이 닿기 쉬워요. 다양한 사람을 만나며 자유롭게 연애하는 흐름이 있어요.",
  정재: "성실하고 안정적인 사람과 인연이 닿기 쉬워요. 차분하고 현실적인 관계를 천천히 쌓아가는 편이에요.",
  편관: "카리스마 있고 존재감이 강한 사람에게 강하게 끌리는 편이에요. 설렘과 긴장이 함께 있는 관계가 되기 쉬워서, 내 속도를 지키는 게 중요해요.",
  정관: "반듯하고 예의 바른 사람에게 마음이 가요. 믿음직하고 책임감 있는 관계를 원하는 편이에요.",
  편인: "개성이 뚜렷하고 독특한 매력이 있는 사람에게 끌려요. 말 없이도 통하는 정신적인 교감을 중요하게 생각해요.",
  정인: "나를 이해해 주고 보살펴 주는 사람에게 마음이 편해져요. 함께 있으면 안식처 같은 느낌을 주는 관계가 잘 맞아요.",
};

const POSITION: Record<Pillar["key"], string> = {
  year: "멀리서 오거나 어릴 때부터 알던 사람과의 인연",
  month: "학교·직장 같은 사회생활에서 만나는 인연",
  day: "가장 가까운 사이에서 깊어지는 인연",
  hour: "시간이 지나며 천천히 깊어지는 인연",
};

const EXCESS: Record<Element, string> = {
  wood: "나무 기운이 많아 마음이 곧고 주관이 뚜렷해요. 내 방식을 고집하지 않고 상대 이야기를 한 번 더 들으면 관계가 부드러워져요.",
  fire: "불 기운이 많아 감정 표현이 풍부하고 마음이 빨리 달아올라요. 설렘이 큰 만큼 한 박자 쉬어 가면 오래가요.",
  earth: "흙 기운이 많아 신중하고 마음을 쉽게 움직이지 않아요. 믿음직하지만 시작이 느릴 수 있어, 작은 호감 표시를 먼저 해 보면 좋아요.",
  metal: "쇠 기운이 많아 기준이 분명하고 선이 확실해요. 좋고 싫음이 뚜렷한 만큼 상대의 다름도 조금 넉넉하게 봐 주세요.",
  water: "물 기운이 많아 감수성이 깊고 생각이 많아요. 혼자 상상하기보다 마음을 말로 확인하면 훨씬 편해져요.",
};

const LACK: Record<Element, string> = {
  wood: "나무 기운이 적어 새로 시작하거나 먼저 다가가는 힘이 약할 수 있어요. 아주 작은 시도부터 해 보면 좋아요.",
  fire: "불 기운이 적어 표현이 담담한 편이에요. 마음은 깊어도 안 전해질 수 있으니 따뜻한 말을 의식해서 건네 보세요.",
  earth: "흙 기운이 적어 한 사람에게 뿌리내리는 데 시간이 걸릴 수 있어요. 안정감을 주는 일상 루틴이 도움이 돼요.",
  metal: "쇠 기운이 적어 맺고 끊는 힘이 약할 수 있어요. 애매한 관계는 내 기준을 정해 두면 정리하기 쉬워요.",
  water: "물 기운이 적어 감정을 나누거나 유연하게 흘려보내는 게 서툴 수 있어요. 충분히 쉬고 감정을 기록해 보세요.",
};

const ELEMENT_KO: Record<Element, string> = { wood: "나무", fire: "불", earth: "흙", metal: "쇠", water: "물" };

type StarLevel = "none" | "some" | "many";

function partnerStars(saju: Saju, gender: string) {
  const names = gender === "남자" ? ["정재", "편재"] : ["정관", "편관"];
  const hits: { key: Pillar["key"]; ten: string }[] = [];
  for (const p of saju.pillars) {
    if (names.includes(p.ganTen) && p.key !== "day") hits.push({ key: p.key, ten: p.ganTen });
    if (names.includes(p.zhiTen)) hits.push({ key: p.key, ten: p.zhiTen });
  }
  const level: StarLevel = hits.length === 0 ? "none" : hits.length <= 2 ? "some" : "many";
  return { label: gender === "남자" ? "재성(財星)" : "관성(官星)", hits, level };
}

function partnerCard(saju: Saju, gender: string): ReadingCard {
  const { label, hits, level } = partnerStars(saju, gender);
  const title = "이성 인연의 기운";
  if (level === "none") {
    return {
      title,
      body: `사주에 이성 인연을 뜻하는 ${label}이 겉으로 뚜렷하게 보이지 않아요. 인연이 없다는 뜻이 아니라, 가만히 기다리기보다 모임이나 취미처럼 사람을 만날 자리를 만들 때 인연이 열리는 편이에요. 운이 바뀌는 시기에 들어오기도 해요.`,
    };
  }
  const where = [...new Set(hits.map((h) => POSITION[h.key]))].join(", ");
  const kinds = new Set(hits.map((h) => h.ten));
  const mixed = kinds.size > 1 ? " 서로 다른 결의 기운이 함께 있어서, 끌리는 타입이 한 가지로만 정해지지 않을 수 있어요." : "";
  const amount =
    level === "some"
      ? `${label}이 ${hits.length}개 자리해 있어요. 과하지도 부족하지도 않게 인연의 기운이 있는 편이에요.`
      : `${label}이 ${hits.length}개로 많은 편이에요. 호감 가는 사람이 자주 보이는 만큼, 상대에게 나를 맞추다 지치지 않도록 내 기준을 챙겨 두면 좋아요.`;
  return { title, body: `${amount} ${where}에 기운이 놓여 있어요.${mixed}` };
}

function balanceCard(saju: Saju): ReadingCard {
  const els = Object.keys(saju.balance) as Element[];
  const lacking = els.filter((e) => saju.balance[e] === 0);
  const top = els.reduce((a, b) => (saju.balance[b] > saju.balance[a] ? b : a));
  const parts: string[] = [];
  if (saju.balance[top] >= 3) parts.push(EXCESS[top]);
  for (const e of lacking) parts.push(LACK[e]);
  const body = parts.length
    ? parts.join(" ")
    : `${ELEMENT_KO[top]} 기운이 조금 더 도드라지지만 다섯 기운이 고르게 있는 편이에요. 상황에 따라 유연하게 마음을 쓸 수 있어요.`;
  return { title: "오행으로 보는 연애 스타일", body };
}

const SITUATION_CARD: Record<Situation, { title: string; body: Record<StarLevel, string> }> = {
  솔로: {
    title: "솔로인 지금, 인연을 부르는 법",
    body: {
      none: "지금은 인연이 먼저 찾아오기보다 내가 만날 자리를 만들 때 열리는 시기예요. 새로운 모임이나 취미 하나만 더해도 흐름이 달라져요.",
      some: "인연의 기운이 적당히 자리해 있어서 일상 속에서 자연스럽게 만나기 좋아요. 지인 소개나 같은 관심사 모임에서 좋은 소식이 올 수 있어요.",
      many: "호감 가는 사람이 많이 보여서 오히려 고르기 어려울 수 있어요. 꼭 지키고 싶은 기준을 세 가지만 정해 두면 마음이 덜 흔들려요.",
    },
  },
  썸: {
    title: "썸을 연애로 이어가려면",
    body: {
      none: "인연을 끌어당기기보다 지금 그 사람과 천천히 시간을 쌓는 게 잘 맞아요. 서두르지 말고 일상을 자주 나눠 보세요.",
      some: "관계가 무르익기 좋은 균형이에요. 마음을 너무 오래 숨기기보다 가볍게 만날 약속부터 먼저 건네 보세요.",
      many: "주변에 눈길 가는 사람이 많아 마음이 흔들릴 수 있어요. 지금 이 사람이 나를 편하게 해 주는지 천천히 살펴보세요.",
    },
  },
  "연애 중": {
    title: "지금 관계를 오래 이어가려면",
    body: {
      none: "화려한 설렘보다 소소한 일상을 함께하는 시간이 관계를 단단하게 해요. 기념일보다 평범한 날의 안부가 힘이 돼요.",
      some: "서로 맞춰 가기 좋은 균형이에요. 서운한 건 쌓아두지 말고 그날그날 가볍게 이야기하면 오래가요.",
      many: "상대 기준에 맞추다 보면 지칠 수 있어요. 양보와 내 마음 사이의 균형을 살피고, 나를 위한 시간도 꼭 챙기세요.",
    },
  },
  "이별 후": {
    title: "이별 뒤, 마음을 돌보는 시간",
    body: {
      none: "지금은 누군가를 새로 찾기보다 나를 돌보는 시간이 먼저예요. 충분히 쉬고 마음이 가라앉으면 자연스럽게 새 인연의 문이 열려요.",
      some: "지난 인연을 천천히 정리하면서 새 인연을 맞을 준비를 하기 좋아요. 아쉬움이 올라올 때는 연락 대신 감정을 글로 적어 보세요.",
      many: "마음을 둘 곳이 많은 사주라서, 서둘러 누군가로 빈자리를 채우기보다 내가 어떤 관계를 원하는지부터 돌아보면 좋아요. 마음이 단단해지면 더 좋은 사람이 눈에 들어와요.",
    },
  },
};

/** 사주 원국을 연애 중심 카드로 풀어 쓴다. 상황(솔로·썸·연애 중·이별 후)에 따라 마지막 카드가 달라진다. */
export function sajuReading(saju: Saju, opts: { situation?: string; gender?: string }): ReadingCard[] {
  const gender = opts.gender ?? "여자";
  const day = saju.pillars.find((p) => p.key === "day")!;
  const cards: ReadingCard[] = [
    { title: `${day.ganRead} 일간, 나의 연애 성향`, body: DAY_MASTER[day.ganRead] },
    {
      title: "마음이 머무는 자리",
      body: `가장 가까운 사이를 뜻하는 일지의 기운은 ${day.zhiTen}${day.zhiTen.endsWith("재") ? "예요" : "이에요"}. ${SPOUSE_PALACE[day.zhiTen]}`,
    },
    partnerCard(saju, gender),
    balanceCard(saju),
  ];
  const situation = SITUATIONS.find((s) => s === opts.situation);
  if (situation) {
    const s = SITUATION_CARD[situation];
    cards.push({ title: s.title, body: s.body[partnerStars(saju, gender).level], highlight: true });
  }
  return cards;
}
