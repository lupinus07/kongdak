import Link from "next/link";
import { BackHeader } from "@/components/BackHeader";

export default async function PaymentFailPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  return (
    <>
      <BackHeader title="결제하기" href="/payment" />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-[22px] text-center">
        <p className="m-0 font-title text-xl">결제가 완료되지 않았어요</p>
        <p className="m-0 text-ink-sub">{message ?? "잠시 후 다시 시도해 주세요."}</p>
        <Link href="/payment" className="rounded-[28px] bg-brand px-6 py-3 font-title text-white no-underline">
          다시 결제하기
        </Link>
      </main>
    </>
  );
}
