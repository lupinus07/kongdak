"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackPath } from "@/lib/nav-history";

/** 페이지 이동을 기록한다(lib/nav-history.ts). 화면에는 아무것도 그리지 않는다. */
export function NavTracker() {
  const pathname = usePathname();
  useEffect(() => {
    trackPath(pathname);
  }, [pathname]);
  return null;
}
