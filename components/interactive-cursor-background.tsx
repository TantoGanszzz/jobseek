export default function InteractiveCursorBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-3xl border-2 border-brand-border bg-white shadow-[0_20px_60px_rgba(11,31,58,0.06)]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_40%,#f4f8ff_100%)]" />
      <div
        className="absolute inset-0 opacity-100"
        style={{
          background:
            "radial-gradient(40rem 26rem at 18% 18%, rgba(214, 235, 255, 1), transparent 44%), radial-gradient(36rem 24rem at 80% 22%, rgba(59, 130, 246, 0.26), transparent 52%), radial-gradient(34rem 22rem at 54% 82%, rgba(234, 244, 255, 0.96), transparent 54%), radial-gradient(28rem 20rem at 50% 52%, rgba(255, 255, 255, 0.9), transparent 58%)",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div
        className="absolute inset-0 mix-blend-screen opacity-[calc(var(--bg-idle, 0.56) * 1.3)]"
        style={{
          background:
            "radial-gradient(32rem 22rem at var(--bg-x) var(--bg-y), rgba(59, 130, 246, 0.34), transparent 54%), radial-gradient(28rem 19rem at var(--bg-x2) var(--bg-y2), rgba(214, 235, 255, 0.94), transparent 56%), radial-gradient(24rem 17rem at var(--bg-x3) var(--bg-y3), rgba(59, 130, 246, 0.18), transparent 62%)",
          filter: "blur(17px)",
          transition: "opacity 240ms ease-out",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.28]"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.96), transparent 0 42%), radial-gradient(circle at 74% 26%, rgba(255,255,255,0.8), transparent 0 34%), radial-gradient(circle at 50% 76%, rgba(214,235,255,0.38), transparent 0 38%)",
          filter: "blur(26px)",
        }}
      />
      <div
        className="absolute left-0 top-0 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.28)_0%,rgba(214,235,255,0.42)_28%,rgba(255,255,255,0)_68%)] blur-3xl"
        style={{
          transform: "translate3d(calc(var(--bg-x2) - 12rem), calc(var(--bg-y2) - 12rem), 0)",
          opacity: "calc(0.52 + var(--bg-soft, 0.65) * 0.32)",
        } as React.CSSProperties}
      />
      <div
        className="absolute left-0 top-0 h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.98)_0%,rgba(214,235,255,0.66)_30%,rgba(59,130,246,0.24)_58%,rgba(255,255,255,0)_72%)] blur-3xl"
        style={{
          transform: "translate3d(calc(var(--bg-x) - 9rem), calc(var(--bg-y) - 9rem), 0)",
          opacity: "calc(0.62 + var(--bg-cursor, 0) * 0.34)",
        } as React.CSSProperties}
      />
      <div
        className="absolute left-0 top-0 h-[16rem] w-[16rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2)_0%,rgba(234,244,255,0.52)_28%,rgba(255,255,255,0)_70%)] blur-3xl"
        style={{
          transform: "translate3d(calc(var(--bg-x3) - 8rem), calc(var(--bg-y3) - 8rem), 0)",
          opacity: "calc(0.38 + var(--bg-idle, 0.5) * 0.24)",
        } as React.CSSProperties}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,transparent_42%,rgba(255,255,255,0.22)_72%,rgba(255,255,255,0.62)_100%)]" />
    </div>
  );
}
