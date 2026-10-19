import { PhoneFrame } from "@/components/PhoneFrame";
import { PaymentClient } from "./PaymentClient";

export const metadata = { title: "결제하기 - 콩닥" };

export default function PaymentPage() {
  return (
    <PhoneFrame>
      <PaymentClient />
    </PhoneFrame>
  );
}
