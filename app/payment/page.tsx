import { PhoneFrame } from "@/components/PhoneFrame";
import { PaymentClient } from "./PaymentClient";
import { privateMetadata } from "@/lib/site";

export const metadata = privateMetadata("결제하기");

export default function PaymentPage() {
  return (
    <PhoneFrame>
      <PaymentClient />
    </PhoneFrame>
  );
}
