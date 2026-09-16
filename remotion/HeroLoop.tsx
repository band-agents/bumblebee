/**
 * HeroLoop — the landing page's product film.
 *
 * Real Bumblebee screens (captured from the running demo into public/landing/)
 * glide past inside a browser frame, each with a one-line caption, on the
 * warm-paper canvas. Loops seamlessly: the last scene hands back to the first.
 */

import {
  AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Sequence, Easing,
} from "remotion";

const PAPER = "#F7F4EC";
const INK = "#2B2317";
const HONEY = "#F4D56E";
const HONEY_INK = "#7A6224";

type Scene = { img: string; kicker: string; title: string };

const SCENES: Scene[] = [
  { img: "landing/production.png", kicker: "Production", title: "Every order, every stage, live." },
  { img: "landing/products.png", kicker: "Products", title: "Sizes, colours, fabric, cost per piece." },
  { img: "landing/production-exec.png", kicker: "Overview", title: "From pattern to packed carton." },
  { img: "landing/inventory.png", kicker: "Inventory", title: "Imported fabric and trims, tracked." },
  { img: "landing/dashboard.png", kicker: "Dashboard", title: "The whole business on one screen." },
];

const SCENE_LEN = 96; // 3.2s
const OVERLAP = 18;
export const HERO_DURATION = SCENES.length * (SCENE_LEN - OVERLAP);

function SceneView({ scene }: { scene: Scene }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const exit = interpolate(frame, [SCENE_LEN - OVERLAP, SCENE_LEN], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = Math.min(enter, exit);

  // Slow Ken Burns drift down the screen so the capture feels in use.
  const drift = interpolate(frame, [0, SCENE_LEN], [0, -60], { easing: Easing.inOut(Easing.cubic) });
  const scale = interpolate(frame, [0, SCENE_LEN], [1.02, 1.07]);
  const lift = interpolate(enter, [0, 1], [40, 0]);

  const captionIn = spring({ frame: frame - 8, fps, config: { damping: 18, stiffness: 120 } });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* browser frame */}
      <div style={{
        position: "absolute", left: 120, right: 120, top: 150 + lift, bottom: 40,
        borderRadius: 22, overflow: "hidden", background: "#fff",
        boxShadow: "0 50px 90px -40px rgba(43,35,23,.45), 0 0 0 1px rgba(43,35,23,.08)",
      }}>
        <div style={{ height: 38, background: "#EFEAE0", display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
          {["#E8B4A0", "#EFD38A", "#B9D3A6"].map((c) => <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
          <span style={{ marginLeft: 16, flex: 1, height: 20, borderRadius: 10, background: "#fff", opacity: 0.8 }} />
        </div>
        <div style={{ position: "absolute", top: 38, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
          <Img src={staticFile(scene.img)} style={{ width: "100%", transform: `translateY(${drift}px) scale(${scale})`, transformOrigin: "top center" }} />
        </div>
      </div>

      {/* caption */}
      <div style={{
        position: "absolute", left: 120, top: 44, display: "flex", alignItems: "baseline", gap: 18,
        opacity: captionIn, transform: `translateY(${interpolate(captionIn, [0, 1], [18, 0])}px)`,
        fontFamily: "Fredoka, 'Segoe UI', system-ui, sans-serif",
      }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: HONEY_INK, background: "#FCF1CC", padding: "6px 16px", borderRadius: 999 }}>
          {scene.kicker}
        </span>
        <span style={{ fontSize: 50, fontWeight: 600, color: INK, letterSpacing: "-0.02em" }}>{scene.title}</span>
      </div>
    </AbsoluteFill>
  );
}

export function HeroLoop() {
  const frame = useCurrentFrame();
  // A slow honey glow that breathes behind the frames.
  const glow = interpolate(Math.sin((frame / HERO_DURATION) * Math.PI * 2), [-1, 1], [0.35, 0.6]);

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <AbsoluteFill style={{
        background: `radial-gradient(60% 55% at 70% 65%, rgba(244,213,110,${glow}) 0%, rgba(239,198,58,0) 70%)`,
      }} />
      {SCENES.map((scene, i) => (
        <Sequence key={scene.img} from={i * (SCENE_LEN - OVERLAP)} durationInFrames={SCENE_LEN}>
          <SceneView scene={scene} />
        </Sequence>
      ))}
      {/* First scene fades back in over the tail so the loop has no seam. */}
      <Sequence from={HERO_DURATION - OVERLAP} durationInFrames={OVERLAP}>
        <SceneView scene={SCENES[0]} />
      </Sequence>
      <div style={{ position: "absolute", right: 36, bottom: 14, width: 10, height: 10, borderRadius: 5, background: HONEY }} />
    </AbsoluteFill>
  );
}
