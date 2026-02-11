import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
export function MarketingPage({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f1217] txt-tone-primary">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(88,175,255,0.25),transparent_48%),radial-gradient(circle_at_80%_10%,rgba(241,87,130,0.20),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(35,197,189,0.22),transparent_44%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_30%)]" />
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
        <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 txt-role-body-sm txt-track-wide text-white/80">
          <Sparkles size={14} /> BUILD DESIGN AGENCY
        </div>
        <h1 className="max-w-4xl txt-role-hero txt-leading-tightest txt-track-tight text-white md:txt-role-hero">
          Keep client delivery sharp from first brief to final handoff.
        </h1>
        <p className="mt-5 max-w-2xl txt-role-body-xl leading-relaxed text-white/70 md:txt-role-panel-title">
          Build Design gives your team one flow for projects, reviews, files,
          and deadlines. Keep focus where execution matters.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          {!isAuthenticated && (
            <>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-[#58AFFF] px-5 py-3 txt-role-body-lg font-semibold txt-tone-inverse transition-colors hover:bg-[#6cb8ff]"
              >
                Create account <ArrowRight size={15} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center rounded-xl border border-white/20 bg-white/[0.03] px-5 py-3 txt-role-body-lg font-medium text-white/90 transition-colors hover:bg-white/[0.08]"
              >
                Sign in
              </Link>
            </>
          )}
          {isAuthenticated && (
            <Link
              to="/tasks"
              className="inline-flex items-center rounded-xl border border-[#58AFFF]/50 bg-[#58AFFF]/10 px-5 py-3 txt-role-body-lg font-medium txt-tone-accent transition-colors hover:bg-[#58AFFF]/20"
            >
              Open dashboard
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
