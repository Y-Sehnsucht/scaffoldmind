import { useState } from 'react';
import { RippleButton } from '../../components/ui/ripple-button.jsx';
import { handleRouteClick, routeHref } from '../../routes/navigation.js';

const HERO_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4';

export function LandingHero() {
  const [draft, setDraft] = useState('');
  const [videoFailed, setVideoFailed] = useState(false);

  function handleStart(event) {
    if (draft.trim()) {
      window.localStorage.setItem('scaffoldmind.agent.draft', draft.trim());
    }
    handleRouteClick(event, '/chat');
  }

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-black px-4 py-4 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.14),transparent_34%),linear-gradient(180deg,#020304_0%,#050607_55%,#000_100%)]" />
      {!videoFailed && (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-42 mix-blend-screen"
          src={HERO_VIDEO}
          muted
          autoPlay
          playsInline
          loop
          preload="auto"
          onError={() => setVideoFailed(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/58 to-black" />

      <header className="liquid-glass relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between rounded-full px-4 py-3 text-sm">
        <a className="flex items-center gap-2 text-white" href={routeHref('/landing')} onClick={(event) => handleRouteClick(event, '/landing')}>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-950">◎</span>
          <span className="font-medium">ScaffoldMind</span>
        </a>
        <nav className="hidden items-center gap-7 text-white/62 md:flex">
          <a href="#cognition">Cognition</a>
          <a href="#methodology">Scaffolding</a>
          <a href="#services">Methodology</a>
        </nav>
        <RippleButton as="a" className="rounded-full bg-white px-4 py-2 font-medium text-slate-950" href={routeHref('/chat')} onClick={(event) => handleRouteClick(event, '/chat')}>
          开始学习
        </RippleButton>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center pb-12 pt-14">
        <p className="text-sm uppercase tracking-[0.34em] text-white/52">ScaffoldMind 明序</p>
        <h1 className="mt-8 max-w-6xl font-serif-display text-7xl font-normal leading-[0.9] tracking-normal text-white md:text-8xl lg:text-9xl">
          Structure it then <em className="font-serif-display italic text-white/72">master it</em>.
        </h1>
        <p className="mt-8 max-w-3xl text-lg leading-8 text-white/66">
          明序：突破无序碎片的认知墙垒。将复杂的长篇材料与零散知识，重构为高度动态的个人思维脚手架。
        </p>

        <form className="liquid-glass mt-10 flex w-full max-w-3xl items-center gap-3 rounded-full p-2" onSubmit={handleStart}>
          <input
            className="min-w-0 flex-1 bg-transparent px-5 py-4 text-base text-white outline-none placeholder:text-white/38"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="输入你当前正在攻克的复杂课题..."
          />
          <RippleButton className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-xl font-semibold text-slate-950 transition hover:bg-neutral-200" type="submit" aria-label="进入对话">
            →
          </RippleButton>
        </form>

        <a className="mt-6 inline-flex w-fit rounded-full border border-white/14 px-5 py-2.5 text-sm text-white/72 transition hover:bg-white/8 hover:text-white" href="#cognition">
          阅读明序认知宣言
        </a>
      </div>
    </section>
  );
}
