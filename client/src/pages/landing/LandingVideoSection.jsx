import { useState } from 'react';
import { handleRouteClick, routeHref } from '../../routes/navigation.js';

const FEATURED_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4';

export function LandingVideoSection() {
  const [failed, setFailed] = useState(false);

  return (
    <section id="methodology" className="relative bg-black px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-neutral-950">
          <div className="aspect-video bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.12),transparent_42%),linear-gradient(135deg,#111_0%,#030303_100%)]" />
          {!failed && (
            <video
              className="absolute inset-0 h-full w-full object-cover opacity-76"
              src={FEATURED_VIDEO}
              muted
              autoPlay
              playsInline
              loop
              preload="auto"
              onError={() => setFailed(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
          <div className="liquid-glass absolute bottom-5 left-5 max-w-xl rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.26em] text-white/45">Methodology</p>
            <p className="mt-4 text-lg leading-8 text-white/76">
              我们坚信，被动输入不是学习。明序内置默认知识解析、Context Stacking 超前学习与费曼反讲三大范式，用主动高频交互逼近认知的本质。
            </p>
          </div>
          <a
            className="absolute bottom-5 right-5 hidden rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-neutral-200 md:inline-flex"
            href={routeHref('/chat')}
            onClick={(event) => handleRouteClick(event, '/chat')}
          >
            探索明序核心模式
          </a>
        </div>
      </div>
    </section>
  );
}
