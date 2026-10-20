import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { LovePreview } from "./LovePreview";

export const metadata = { title: "나의 연애운 - 콩닥" };

export default function LovePreviewPage() {
  return (
    <PhoneFrame stickyCta>
      <BackHeader title="나의 연애운" href="/love" />
      <LovePreview />
    </PhoneFrame>
  );
}
