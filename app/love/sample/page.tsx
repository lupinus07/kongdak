import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Chap, Disclaimer, H, Li, P, Sec } from "@/components/report";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "연애운 샘플 풀이 - 사주 연애운 미리 보기",
  description:
    "콩닥 사주 연애운 풀이가 어떻게 나오는지 샘플로 먼저 확인해 보세요. 연애 DNA, 이성 인연, 잘 맞는 사람, 1년 월별 연애 흐름까지 담겨 있어요.",
  path: "/love/sample",
});

type Element = "wood" | "fire" | "earth" | "metal" | "water";

const ELEMENT_STYLE: Record<Element, string> = {
  wood: "bg-[#E3F4E1] text-[#2B6B2A]",
  fire: "bg-[#FFE4D6] text-[#B23A07]",
  earth: "bg-[#F7EDCF] text-[#7A5E0A]",
  metal: "bg-[#ECEEF1] text-[#495057]",
  water: "bg-[#DDEBFB] text-[#1B4F8C]",
};

const PILLARS: {
  title: string;
  top: string;
  stem: [string, string, Element];
  branch: [string, string, Element];
  bottom: string;
  me?: boolean;
}[] = [
  { title: "시주", top: "식신", stem: ["戊", "무토", "earth"], branch: ["子", "자수", "water"], bottom: "정관" },
  { title: "일주 · 나", top: "일간", stem: ["丙", "병화", "fire"], branch: ["申", "신금", "metal"], bottom: "편재", me: true },
  { title: "월주", top: "정관", stem: ["癸", "계수", "water"], branch: ["亥", "해수", "water"], bottom: "편관" },
  { title: "년주", top: "식신", stem: ["戊", "무토", "earth"], branch: ["辰", "진토", "earth"], bottom: "식신" },
];

const BALANCE = [
  { name: "水 물", width: 100, color: "#4D94E0", count: "3+" },
  { name: "土 흙", width: 88, color: "#D4AF37", count: "3" },
  { name: "火 불", width: 30, color: "#F76707", count: "1" },
  { name: "金 쇠", width: 30, color: "#ADB5BD", count: "1" },
  { name: "木 나무", width: 0, color: "transparent", count: "0" },
];

type Tone = "normal" | "warn" | "best";
const MONTH_BG: Record<Tone, string> = { normal: "bg-[#FFF8FA]", warn: "bg-[#FFF4E5]", best: "bg-[#FFE3EC]" };

const MONTHS: { ym: string; mark: string; text: string; tone: Tone }[] = [
  { ym: "26.11", mark: "♥♥", text: "己亥월 · 새로운 만남이 들어와요", tone: "normal" },
  { ym: "26.12", mark: "⚠", text: "庚子월 · 子午충, 오해 조심", tone: "warn" },
  { ym: "27.1", mark: "♥♥", text: "辛丑월 · 丙辛합, 설레는 끌림", tone: "normal" },
  { ym: "27.2", mark: "♥♥♥", text: "壬寅월 · 인연과 木이 함께, 최고의 달", tone: "best" },
  { ym: "27.3", mark: "♥♥♥", text: "癸卯월 · 진지한 관계로 발전", tone: "best" },
  { ym: "27.4", mark: "♥♥", text: "甲辰월 · 수국이 다시 모여 인연이 이어져요", tone: "normal" },
  { ym: "27.5", mark: "♥♥", text: "乙巳월 · 巳申합, 배우자 자리가 따뜻해져요", tone: "normal" },
  { ym: "27.6", mark: "⚠", text: "丙午월 · 경쟁자·질투 조심", tone: "warn" },
  { ym: "27.7", mark: "⚠", text: "丁未월 · 상관운, 말 한마디 조심", tone: "warn" },
  { ym: "27.8", mark: "♥", text: "戊申월 · 편하게 즐기는 데이트", tone: "normal" },
  { ym: "27.9", mark: "♥", text: "己酉월 · 현실적인 대화가 필요해요", tone: "normal" },
  { ym: "27.10", mark: "♥", text: "庚戌월 · 함께 쓰는 돈 이야기", tone: "normal" },
];

const stroke = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#C2255C",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  "aria-hidden": true,
};

function Tg({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-[12.5px] text-ink-sub ${className}`}>{children}</span>;
}

function Chip({ glyph, reading, el, ring }: { glyph: string; reading: string; el: Element; ring?: boolean }) {
  return (
    <div
      className={`flex size-[62px] flex-col items-center justify-center rounded-[18px] font-hanja text-[26px] leading-none ${ELEMENT_STYLE[el]} ${
        ring ? "shadow-[0_0_0_2.5px_#FF6B9A]" : ""
      }`}
    >
      {glyph}
      <small className="mt-[3px] font-body text-[11.5px]">{reading}</small>
    </div>
  );
}

function Lucky({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-white px-1.5 py-2.5">
      {children}
      <span className="text-[12.5px] text-ink-sub">{label}</span>
      <b className="font-title text-sm font-normal">{value}</b>
    </div>
  );
}

export default function LoveSamplePage() {
  return (
    <PhoneFrame>
      <BackHeader href="/love" center={<span className="rounded-[14px] bg-badge px-3.5 py-1.5 text-[14px] text-[#5C3D00]">샘플 풀이</span>} />
      <main className="flex flex-1 flex-col gap-3.5 px-[18px] pb-8 pt-2">

        <section className="flex flex-col gap-2 rounded-[30px] bg-brand px-5 py-6 text-white">
          <span className="text-[14px] text-[#FFE3EC]">박윤희 님 · 1988년 12월 7일 자시 (양력)</span>
          <h1 className="m-0 font-title text-[28px] font-normal leading-[1.3]">
            겨울 바다 위에 뜬
            <br />
            따뜻한 태양
          </h1>
          <p className="m-0 text-[15px] leading-[1.7] text-[#FFE3EC]">
            차가운 물 기운 속에서 혼자 반짝이는 불, 그래서 더 눈에 띄고 더 많이 사랑받는 사주예요. 다만 태양이 지치지 않게
            지켜줄 사람이 필요해요.
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {["이성운_강함", "챙겨주는_연애", "내_편이_필요해"].map((t) => (
              <span key={t} className="rounded-xl bg-white/20 px-[11px] py-[5px] text-[13.5px]">
                #{t}
              </span>
            ))}
          </div>
        </section>

        <Sec>
          <Chap>CHAPTER 1</Chap>
          <H>윤희 님의 사주 원국</H>
          <div className="grid grid-cols-4 justify-items-center gap-1.5">
            {PILLARS.map((p) => (
              <div key={p.title} className="flex flex-col items-center gap-1.5">
                <Tg className={p.me ? "!text-brand" : ""}>{p.title}</Tg>
                <Tg>{p.top}</Tg>
                <Chip glyph={p.stem[0]} reading={p.stem[1]} el={p.stem[2]} ring={p.me} />
                <Chip glyph={p.branch[0]} reading={p.branch[1]} el={p.branch[2]} />
                <Tg>{p.bottom}</Tg>
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex flex-col gap-[7px]">
            {BALANCE.map((b) => (
              <div key={b.name} className="grid grid-cols-[44px_1fr_28px] items-center gap-2 text-[14px]">
                <span>{b.name}</span>
                <div className="h-3 overflow-hidden rounded-md bg-bg">
                  <div className="h-full" style={{ width: `${b.width}%`, background: b.color }} />
                </div>
                <span>{b.count}</span>
              </div>
            ))}
          </div>
          <P>
            태양을 뜻하는 <b>병화(丙火)</b>로 태어났는데, 한겨울 해월(亥月)에 물 기운이 가득해요. 게다가 년·일·시의{" "}
            <b>辰·申·子가 모여 큰 물길(申子辰 수국)</b>을 만들어서, 실제로는 물의 힘이 표의 숫자보다 훨씬 커요. 대신 나를 북돋아
            주는 <b>나무(木) 기운이 하나도 없는 것</b>이 이 사주의 가장 큰 특징이에요.
          </P>
        </Sec>

        <Sec>
          <Chap>CHAPTER 2</Chap>
          <H>
            나의 연애 DNA
            <br />
            “마음이 가면 숨기지 못해요”
          </H>
          <P>
            병화는 하늘의 태양처럼 밝고 솔직한 기운이에요. 좋아하는 사람이 생기면 티가 다 나고, 밀당보다는 직진이 편한 타입이에요.
            처음 만난 자리에서도 분위기를 따뜻하게 만드는 힘이 있어서, 본인은 몰라도 윤희 님에게 호감을 느끼는 사람이 생각보다
            많아요.
          </P>
          <P>
            다만 겨울에 뜬 태양이라 겉으로는 환해도 속으로는 쉽게 지쳐요. 사람들 사이에서 에너지를 다 쓰고 나면 혼자 조용히 충전하는
            시간이 꼭 필요한 사람이에요.
          </P>
        </Sec>

        <Sec>
          <Chap>CHAPTER 3</Chap>
          <H>
            연애할 때의 윤희 님
            <br />
            “맛있는 거 먹이는 게 사랑”
          </H>
          <P>
            사주에 <b>식신(食神)이 세 개</b>나 있어요. 식신은 먹을 복, 표현력, 챙겨주는 마음을 뜻해요. 연애할 때 상대의 끼니와
            컨디션을 먼저 살피고, 맛집과 기념일을 꼼꼼하게 챙기는 다정한 연인이 되기 쉬워요.
          </P>
          <Li>말과 행동으로 애정을 표현해서 상대가 “사랑받고 있다”는 걸 확실히 느껴요.</Li>
          <Li>함께 웃고 먹고 노는 시간이 쌓일수록 관계가 단단해지는 스타일이에요.</Li>
          <Li>
            식신이 강한 사람은 까다로운 상대도 부드럽게 다루는 재주가 있어요. 어려운 관계일수록 오히려 윤희 님이 중심을 잡아요.
          </Li>
        </Sec>

        <Sec>
          <Chap>CHAPTER 4</Chap>
          <H>
            이성 인연
            <br />
            “인연이 끊이지 않는 사주”
          </H>
          <P>
            여성의 사주에서 이성 인연을 뜻하는 <b>관성(官星)</b>이 정관 둘, 편관 하나로 아주 강해요. 여기에 申子辰 수국까지 더해져서
            평생 이성의 관심을 받는 쪽이에요. 배우자 자리인 일지(申)가 이 물길에 함께 묶여 있어{" "}
            <b>인연이 깊고 결혼 인연도 분명한 구조</b>예요.
          </P>
          <P>
            다만 정관과 편관이 섞여 있는 <b>관살혼잡</b>이라, 안정적인 사람과 자극적인 사람 사이에서 마음이 오가기 쉬워요.
            “괜찮은 사람”과 “끌리는 사람”이 다를 때 고민이 길어지는 편이에요.
          </P>
        </Sec>

        <Sec>
          <Chap>CHAPTER 5</Chap>
          <H>나와 잘 맞는 사람</H>
          <P>
            윤희 님에게 없는 <b>나무(木)</b>가 곧 행운의 기운이에요. 나무는 물을 빨아들여 불을 키워주는 다리 역할을 해요. 연애로
            옮기면, 윤희 님이 받는 많은 관심과 부담을 차분히 걸러주고 “너는 너대로 괜찮아”라고 말해주는 사람이에요.
          </P>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1 rounded-[18px] bg-[#E3F4E1] p-3">
              <b className="font-title text-[15px] font-normal text-[#2B6B2A]">잘 맞아요</b>
              <span className="text-[14px] leading-[1.55] text-[#335C32]">
                말을 끝까지 들어주는 사람, 공부·성장을 좋아하는 사람, 갑목·을목 일간이나 木 기운이 강한 사람
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-[18px] bg-[#FFF1DE] p-3">
              <b className="font-title text-[15px] font-normal text-[#8A4B00]">한 번 더 생각해요</b>
              <span className="text-[14px] leading-[1.55] text-[#6B4A2B]">
                통제하려는 사람, 감정 기복이 큰 사람, 물 기운이 지나치게 강해 나를 더 지치게 하는 관계
              </span>
            </div>
          </div>
        </Sec>

        <Sec>
          <Chap>CHAPTER 6</Chap>
          <H>연애할 때 조심할 점</H>
          <Li dot="#F59F00">
            <b>맞춰주다 지치기 쉬워요.</b> 일간이 약하고 관성이 강해서 상대 기준에 나를 맞추는 일이 많아요. 서운한 건 쌓아두지 말고
            그때그때 가볍게 말하는 연습이 필요해요.
          </Li>
          <Li dot="#F59F00">
            <b>다 퍼주고 나서 허전해져요.</b> 식신이 많은 사람의 흔한 패턴이에요. 받는 것도 사랑이라는 걸 기억해 주세요.
          </Li>
          <Li dot="#F59F00">
            <b>밤에 내린 결정은 아침에 한 번 더.</b> 자시(子時)생에 물 기운이 강해 밤에 감정이 크게 출렁여요. 중요한 연락이나 결정은
            해가 뜬 뒤에 하는 게 좋아요.
          </Li>
        </Sec>

        <Sec>
          <Chap>CHAPTER 7</Chap>
          <H>다가오는 1년 연애 흐름</H>
          <P className="!text-[14px] text-[#5E3F4C]">절기 기준 · 하트가 많을수록 인연 기운이 강한 달</P>
          <div className="grid grid-cols-3 gap-1.5">
            {MONTHS.map((m) => (
              <div key={m.ym} className={`flex flex-col gap-[3px] rounded-2xl px-2 py-2.5 ${MONTH_BG[m.tone]}`}>
                <b className="font-title text-[15px] font-normal text-ink">
                  {m.ym} {m.mark}
                </b>
                <span className="text-[12.5px] leading-[1.4] text-[#6B4A58]">{m.text}</span>
              </div>
            ))}
          </div>
          <P>
            가장 좋은 때는 <b>2027년 2~3월</b>이에요. 인연을 뜻하는 관성과 윤희 님에게 꼭 필요한 나무 기운이 한꺼번에 들어와서, 새로운
            만남도 기존 관계의 진전도 모두 힘을 받아요. 고백이나 중요한 약속은 이때가 좋아요.
          </P>
        </Sec>

        <Sec className="bg-[#FFF7D6]">
          <Chap className="text-[#8A5A00]">콩닥 한마디</Chap>
          <H className="text-[#5C3D00]">
            사랑받는 건 이미 충분해요.
            <br />
            이제는 쉬어갈 곳을 고르세요.
          </H>
          <div className="grid grid-cols-3 gap-2">
            <Lucky label="행운의 색" value="초록">
              <div className="size-6 rounded-full bg-[#51A84E]" />
            </Lucky>
            <Lucky label="행운의 방향" value="동쪽">
              <svg {...stroke}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7l3 5-3 5-3-5z" fill="#FFE3EC" />
              </svg>
            </Lucky>
            <Lucky label="행운의 시간" value="이른 아침">
              <svg {...stroke}>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
              </svg>
            </Lucky>
          </div>
          <P className="text-[#6B4A2B]">초록 식물을 곁에 두거나 아침 산책을 하는 것처럼, 작은 나무 기운을 일상에 더해 보세요.</P>
        </Sec>

        <Disclaimer>이 풀이는 명리학을 바탕으로 한 재미용 콘텐츠예요.</Disclaimer>

      </main>
    </PhoneFrame>
  );
}
