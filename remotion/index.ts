// Remotion entry — build-time only. Renders public/landing/hero.mp4:
//   npm run video:render
// Nothing here ships in the app bundle.
import { registerRoot } from "remotion";
import { Root } from "./Root";

registerRoot(Root);
