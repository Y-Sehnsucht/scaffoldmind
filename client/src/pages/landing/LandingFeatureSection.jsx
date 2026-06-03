import { useState } from 'react';

const SERVICES = [
  {
    tag: 'Context Stacking',
    title: '前置认知连接',
    desc: '输入未学课程，AI 主动为你生成预习路线图、课堂验证清单与可能考法，实现超前理解。',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4',
  },
  {
    tag: 'Feynman Paradox',
    title: '动态纠错演练',
    desc: '身份互换，由你对 AI 进行知识讲授。智能体通过多轮交互和文本追问，实时捕获并纠正你的思维偏误。',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4',
  },
];

export function LandingFeatureSection() {
  return (
    <section id="services" className="bg-black px-4 pb-28 pt-16 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-white/42">Services</p>
            <h2 className="mt-4 font-serif-display text-5xl font-normal text-white md:text-7xl">Core modes.</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/48">不做登录、不做云同步、不解析图片文字。明序只把注意力放回学习闭环本身。</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {SERVICES.map((service) => (
            <ServiceCard key={service.tag} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service }) {
  const [failed, setFailed] = useState(false);

  return (
    <article className="overflow-hidden rounded-[2rem] bg-neutral-950">
      <div className="relative aspect-video bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.16),transparent_36%),linear-gradient(135deg,#161616,#030303)]">
        {!failed && (
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-72"
            src={service.video}
            muted
            autoPlay
            playsInline
            loop
            preload="auto"
            onError={() => setFailed(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/8 to-transparent" />
      </div>
      <div className="liquid-glass m-3 -mt-24 min-h-[190px] rounded-[1.75rem] p-6">
        <p className="text-xs uppercase tracking-[0.26em] text-white/42">{service.tag}</p>
        <h3 className="mt-4 font-serif-display text-4xl font-normal text-white">{service.title}</h3>
        <p className="mt-4 text-sm leading-7 text-white/62">{service.desc}</p>
      </div>
    </article>
  );
}
