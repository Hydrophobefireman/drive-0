import {dynamic} from "@kit/router";
export default {
  "/": dynamic(() => import("@/pages/Landing")),
  "/app": dynamic(() => import("@/pages/App")),
  "/viewer": dynamic(() => import("@/pages/Viewer")),
};
