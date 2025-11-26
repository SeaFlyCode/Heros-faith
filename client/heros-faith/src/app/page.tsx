import Prism from "@/components/Prism";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0.08}
          glow={0.8}
        />
        {/* Overlay noir pour renforcer le fond noir */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none z-10" />
      </div>
      <main className="relative min-h-screen flex items-center justify-center z-10 pt-[100px]">
        <h1 className="font-bruno text-[6vw] text-white text-center select-none tracking-wide drop-shadow-lg">
          HERO&apos;S FAITH
        </h1>
      </main>
    </div>
  );
}
