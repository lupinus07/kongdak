import { ScrollTopButton } from "./ScrollTopButton";

export function PhoneFrame({ children, stickyCta = false }: { children: React.ReactNode; stickyCta?: boolean }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-bg">
      {children}
      <ScrollTopButton raised={stickyCta} />
    </div>
  );
}
