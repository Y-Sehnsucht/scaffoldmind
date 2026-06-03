import { useState } from 'react';

const PHILOSOPHY_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4';

export function LandingPhilosophySection() {
  const [failed, setFailed] = useState(false);

  return (
    <section id="cognition" className="bg-black px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.32em] text-white/42">The Cognitive Scaffolding</p>
        <h2 className="mt-6 max-w-5xl font-serif-display text-5xl font-normal leading-[1.02] text-white md:text-7xl">
          Pioneering structural frameworks for minds that dismantle, rebuild, and master.
        </h2>

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative overflow-hidden rounded-[2rem] bg-neutral-950">
            <div className="aspect-[4/5] bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.14),transparent_38%),linear-gradient(145deg,#151515,#030303)]" />
            {!failed && (
              <video
                className="absolute inset-0 h-full w-full object-cover opacity-72"
                src={PHILOSOPHY_VIDEO}
                muted
                autoPlay
                playsInline
                loop
                preload="auto"
                onError={() => setFailed(true)}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/72 to-transparent" />
          </div>

          <div className="grid content-center gap-6">
            <TextBlock
              title="Evolution"
              body="每一次长文本的挂载，都是在对知识资产进行重组。明序在底层维护动态记忆流，确保 AI 的每一次追问都精确切中你的盲区。"
            />
            <TextBlock
              title="Perspective"
              body="告别没有记忆的 Chat 机器人。系统根据你的点赞、点踩和作答表现，实时校准输出风格，生成只属于你的知识进化网络。"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function TextBlock({ title, body }) {
  return (
    <article className="liquid-glass rounded-[2rem] p-7">
      <h3 className="font-serif-display text-4xl italic text-white">{title}</h3>
      <p className="mt-5 text-base leading-8 text-white/62">{body}</p>
    </article>
  );
}
