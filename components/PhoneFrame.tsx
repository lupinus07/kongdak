import { ScrollTopButton } from "./ScrollTopButton";

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-bg">
      {children}
      <ScrollTopButton />
    </div>
  );
}
