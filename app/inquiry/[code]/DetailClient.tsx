"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchInquiryView, type InquiryLookup } from "@/lib/inquiry-board";
import { InquiryView } from "../InquiryView";
import { UnlockForm } from "./UnlockForm";

const msg = (text: string) => <p className="m-0 text-center text-ink-sub">{text}</p>;

/** 문의 하나: 로그인한 본인 글이면 바로 보여주고, 아니면 비밀번호 잠금 화면. 브라우저에서 바로 읽는다. */
export function DetailClient() {
  const code = String(useParams<{ code: string }>().code ?? "").toUpperCase();
  const valid = /^[0-9A-F]{8}$/.test(code);
  const [found, setFound] = useState<{ code: string; r: InquiryLookup } | null>(null);

  useEffect(() => {
    if (!valid) return;
    let alive = true;
    fetchInquiryView(code).then((r) => alive && setFound({ code, r }));
    return () => {
      alive = false;
    };
  }, [code, valid]);

  if (!valid) return msg("문의를 찾지 못했어요.");
  const r = found?.code === code ? found.r : null;
  if (!r) return msg("불러오는 중…");
  if (r.kind === "own") return <InquiryView q={r.inquiry} />;
  if (r.kind === "missing") return msg("문의를 찾지 못했어요.");
  if (r.kind === "error") return msg("문의를 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.");
  return <UnlockForm code={code} category={r.category} date={r.createdAt.slice(0, 10).replaceAll("-", ".")} />;
}
