import Link from "next/link";
import { Article, LegalPage, Ol, P, Rows, Ul } from "@/components/legal";
import { COMPANY } from "@/lib/legal";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "환불정책",
  description: "콩닥 유료 풀이 청약철회·환불 안내",
  path: "/refund",
});

/** 환불정책. 이용약관 제9조와 같은 내용을 풀어 쓴 것이라, 한쪽을 바꾸면 다른 쪽도 함께 바꾼다. */
export default function RefundPage() {
  return (
    <LegalPage
      title="환불정책"
      intro={
        <P>
          콩닥의 유료 풀이(둘의 궁합, 나의 연애운)는 결제 후 결과 화면을 처음 열 때 풀이가 만들어져 제공돼요. 그래서
          풀이를 열기 전과 연 뒤의 환불 기준이 달라요. 결제 전에 꼭 한 번 읽어 주세요.
        </P>
      }
    >
      <Article title="한눈에 보기">
        <Rows
          rows={[
            ["풀이 열기 전", "결제일로부터 7일 이내 전액 환불"],
            ["풀이 연 뒤", "서비스 오류가 아니면 환불 불가"],
            ["서비스 오류", "풀이가 제공되지 않았거나 안내와 크게 다르면 환불"],
            ["처리 기간", "요청일로부터 3영업일 이내 결제 취소"],
          ]}
        />
      </Article>

      <Article title="1. 풀이를 열기 전">
        <P>
          결제 후 결과를 아직 열어보지 않았다면, 결제일로부터 7일 이내에 청약을 철회하고 결제 금액 전액을 환불받을 수
          있어요. 이유를 말하지 않아도 괜찮아요.
        </P>
        <P>
          &lsquo;내 주문&rsquo; 화면에서 환불 가능한 마감일을 확인할 수 있어요.
        </P>
      </Article>

      <Article title="2. 풀이를 연 뒤">
        <P>
          결과 화면을 열면 풀이가 만들어져 제공되기 시작해요. 이렇게 제공이 시작된 디지털 콘텐츠는 「전자상거래 등에서의
          소비자보호에 관한 법률」 제17조 제2항 제5호에 따라 청약철회가 제한돼요.
        </P>
        <P>
          결제 전에 <Link href="/love/sample" className="text-brand">샘플 풀이</Link>와 사주 원국 무료 미리보기로 내용을
          미리 확인해 볼 수 있어요.
        </P>
      </Article>

      <Article title="3. 풀이를 연 뒤에도 환불되는 경우">
        <Ul
          items={[
            "서비스 오류로 풀이가 제대로 만들어지지 않았거나 화면에 표시되지 않은 경우",
            "제공된 내용이 표시·광고된 내용과 현저히 다른 경우",
            "같은 주문이 중복으로 결제된 경우",
          ]}
        />
        <P>단순 변심이나 풀이 내용에 대한 기대와의 차이는 환불 사유가 되지 않아요.</P>
      </Article>

      <Article title="4. 환불 요청 방법">
        <Ol
          items={[
            `사이트 하단의 ‘문의하기’에서 문의 종류를 ‘환불’로 골라 요청해 주세요. 이메일(${COMPANY.email})로 보내셔도 돼요.`,
            "주문번호를 함께 적어 주세요. 주문번호는 결제 완료 화면과 ‘내 주문’에서 볼 수 있어요. 로그인 없이 결제했다면 ‘주문 찾기’에서 주문번호와 휴대폰 뒷자리 4자리로 확인할 수 있어요.",
            "요청을 받은 날부터 3영업일 이내에 결제를 취소하거나 환급해요.",
          ]}
        />
      </Article>

      <Article title="5. 환불 시기">
        <P>
          결제 취소는 요청 후 3영업일 이내에 진행하지만, 카드사·간편결제사에 따라 실제로 금액이 돌아오기까지 며칠 더
          걸릴 수 있어요. 자세한 반영 시점은 이용하신 결제수단 회사에 문의해 주세요.
        </P>
      </Article>

      <Article title="6. 사업자 정보">
        <Rows
          rows={[
            ["상호", COMPANY.name],
            ["이메일", COMPANY.email],
            ["전화", COMPANY.phone],
          ]}
        />
        <P>
          자세한 내용은 <Link href="/terms" className="text-brand">이용약관</Link> 제9조에서도 볼 수 있어요.
        </P>
      </Article>
    </LegalPage>
  );
}
