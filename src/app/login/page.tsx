import type { Metadata } from "next";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <>
      {/* ══════════════════════════════════════════════
          MOBILE  (< md)
      ══════════════════════════════════════════════ */}
      <div className="flex min-h-screen flex-col bg-[#0f0f0f] md:hidden">

        {/* Hero */}
        <div
          className="relative overflow-hidden"
          style={{
            height: "37vh",
            backgroundImage: "url('/login-left-card.png')",
            backgroundSize: "101%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center 65%",
          }}
        />

        {/* Bottom Sheet */}
        <div
          className="flex-1 rounded-t-[24px] bg-[#0f0f0f] px-6 pb-10"
          style={{ marginTop: "-36px", paddingTop: "28px", position: "relative", zIndex: 1 }}
        >
          <LoginForm variant="mobile" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          DESKTOP  (≥ md)
      ══════════════════════════════════════════════ */}
      <div className="hidden min-h-screen items-center justify-center bg-[#0a0a0a] px-6 md:flex">
        <div className="relative w-full max-w-[1663px]">
          <div className="flex min-h-[877px] w-full overflow-hidden rounded-[20px] bg-[#0f0f0f]">

            {/* ── Coluna esquerda ── */}
            <div className="w-[45%] shrink-0 bg-[#0f0f0f] p-5">
              <div
                className="relative h-full overflow-hidden rounded-[16px] bg-[#0f0f0f]"
                style={{
                  backgroundImage: "url('/login-left-card.png')",
                  backgroundSize: "101%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center 20%",
                }}
              />
            </div>

            {/* ── Coluna direita ── */}
            <div className="flex flex-1 flex-col justify-center px-12 py-10">
              <LoginForm variant="desktop" />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
