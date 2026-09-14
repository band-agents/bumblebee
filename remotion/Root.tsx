import { Composition } from "remotion";
import { HeroLoop, HERO_DURATION } from "./HeroLoop";

export function Root() {
  return (
    <Composition
      id="HeroLoop"
      component={HeroLoop}
      durationInFrames={HERO_DURATION}
      fps={30}
      width={1600}
      height={1000}
    />
  );
}
