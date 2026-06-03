import { LandingFeatureSection } from './landing/LandingFeatureSection.jsx';
import { LandingHero } from './landing/LandingHero.jsx';
import { LandingPhilosophySection } from './landing/LandingPhilosophySection.jsx';
import { LandingVideoSection } from './landing/LandingVideoSection.jsx';

export function LandingPage() {
  return (
    <div className="landing-page min-h-screen bg-black text-white">
      <LandingHero />
      <LandingVideoSection />
      <LandingPhilosophySection />
      <LandingFeatureSection />
    </div>
  );
}
