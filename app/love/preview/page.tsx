import { BackHeader } from "@/components/BackHeader";
import { PhoneFrame } from "@/components/PhoneFrame";
import { LovePreview } from "./LovePreview";
import { privateMetadata } from "@/lib/site";

export const metadata = privateMetadata("나의 사주 원국");

export default function LovePreviewPage() {
  return (
    <PhoneFrame stickyCta>
      <BackHeader title="나의 연애운" href="/love" />
      <LovePreview />
    </PhoneFrame>
  );
}
