import Link from "next/link";
import { HeroSection } from "@/components/hero-section";
import { SectionHeader } from "@/components/section-header";
import { GameCard } from "@/components/game-card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      {/* Intro / Concept Section */}
      <section id="erlebnisse" className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            title="Dein Abenteuer beginnt hier"
            subtitle="Spielnova im West Park Ingolstadt bietet dir die modernste VR-Technologie. Egal ob Einzelspieler oder im Team – wir haben das passende Erlebnis für dich."
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
            {/* Note: We will replace these placeholder images with real assets later or use colored placeholders for now */}
            <div className="col-span-1 md:col-span-3 lg:col-span-2">
              <GameCard
                title="VR Shooter Arena"
                description="Tauche ein in actiongeladene Gefechte. Kämpfe gegen Zombies oder feindliche Roboter in unserer freien Roaming-Arena."
                imageSrc="/Shooter_games.jpg"
                duration="30-60 Min"
                players="2-4 Spieler"
                difficulty="Mittel - Schwer"
                category="Beliebt"
                href="/shooter_games"
              />
            </div>
            <div className="col-span-1 md:col-span-3 lg:col-span-2">
              <GameCard
                title="VR Adventure and escape rooms"
                description="Löse knifflige Rätsel in fantastischen Welten. Arbeitet als Team zusammen, um aus Pyramiden oder Raumstationen zu entkommen."
                imageSrc="/adventure1.jpg"
                duration="60 Min"
                players="2-4 Spieler"
                difficulty="Leicht - Schwer"
                href="/escaperooms"
              />
            </div>
            <div className="col-span-1 md:col-span-3 lg:col-span-2">
              <GameCard
                title="VR Simulatoren"
                description="Erlebe das Gefühl des Fliegens mit unserem Paraglider oder steuere einen Kampfjet im 360-Grad-Simulator."
                imageSrc="/Paraglider.jpg"
                duration="5-10 Min"
                players="1 Spieler"
                href="/simulators"
                buttonText="Details"
              />
            </div>
            <div className="col-span-1 md:col-span-3 lg:col-span-2">
              <GameCard
                title="Arcade Games"
                description="Klassischer Spielspaß mit Air Hockey, Basketball-Automaten und Racing-Simulatoren für zwischendurch."
                imageSrc="/Arcade_Games.jpg"
                duration="Variabel"
                players="1-2 Spieler"
                href="/arcade"
                buttonText="Details"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Booking CTA Teaser */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 z-0"></div>
        <div className="container mx-auto relative z-10 px-4 md:px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Bereit für die nächste Dimension?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">Sichere dir jetzt deinen Slot in unseren VR Arenen. Perfekt für Geburtstage, Teamevents oder einen actionreichen Nachmittag.</p>
          <Button asChild size="lg" className="h-16 px-10 text-xl font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)] animate-pulse hover:animate-none">
            <Link href="/buchen">Jetzt Termin Buchen</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
