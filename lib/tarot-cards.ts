export type TarotCard = {
  id: number;
  ko: string;
  en: string;
  /** 카드 위쪽에 표시할 번호 (대아르카나는 로마 숫자) */
  numeral: string;
};

const ROMAN = [
  "0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI",
];

const MAJOR: [string, string][] = [
  ["바보", "The Fool"],
  ["마법사", "The Magician"],
  ["여사제", "The High Priestess"],
  ["여황제", "The Empress"],
  ["황제", "The Emperor"],
  ["교황", "The Hierophant"],
  ["연인", "The Lovers"],
  ["전차", "The Chariot"],
  ["힘", "Strength"],
  ["은둔자", "The Hermit"],
  ["운명의 수레바퀴", "Wheel of Fortune"],
  ["정의", "Justice"],
  ["매달린 사람", "The Hanged Man"],
  ["죽음", "Death"],
  ["절제", "Temperance"],
  ["악마", "The Devil"],
  ["탑", "The Tower"],
  ["별", "The Star"],
  ["달", "The Moon"],
  ["태양", "The Sun"],
  ["심판", "Judgement"],
  ["세계", "The World"],
];

const SUITS = [
  { ko: "완드", en: "Wands" },
  { ko: "컵", en: "Cups" },
  { ko: "소드", en: "Swords" },
  { ko: "펜타클", en: "Pentacles" },
];

const RANKS = [
  { ko: "에이스", en: "Ace", numeral: "A" },
  { ko: "2", en: "Two", numeral: "II" },
  { ko: "3", en: "Three", numeral: "III" },
  { ko: "4", en: "Four", numeral: "IV" },
  { ko: "5", en: "Five", numeral: "V" },
  { ko: "6", en: "Six", numeral: "VI" },
  { ko: "7", en: "Seven", numeral: "VII" },
  { ko: "8", en: "Eight", numeral: "VIII" },
  { ko: "9", en: "Nine", numeral: "IX" },
  { ko: "10", en: "Ten", numeral: "X" },
  { ko: "페이지", en: "Page", numeral: "P" },
  { ko: "나이트", en: "Knight", numeral: "Kn" },
  { ko: "퀸", en: "Queen", numeral: "Q" },
  { ko: "킹", en: "King", numeral: "K" },
];

/** 0~21 대아르카나, 22~35 완드, 36~49 컵, 50~63 소드, 64~77 펜타클 */
export const TAROT_CARDS: TarotCard[] = [
  ...MAJOR.map(([ko, en], i) => ({ id: i, ko, en, numeral: ROMAN[i] })),
  ...SUITS.flatMap((suit, s) =>
    RANKS.map((rank, r) => ({
      id: 22 + s * 14 + r,
      ko: `${suit.ko} ${rank.ko}`,
      en: `${rank.en} of ${suit.en}`,
      numeral: rank.numeral,
    })),
  ),
];
