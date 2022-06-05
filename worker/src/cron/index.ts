import {Env} from "../types";

export const cronTrigger = async function cronTrigger(
  event: ScheduledEvent,
  env: Env,
  ctx: EventContext<Env, "", "">
) {
  ctx.waitUntil(
    (async () => {
      while (true) {
        const previews = await env.B_PREVIEWS.list({limit: 10000});
        const images = await env.B_GALLERY.list({limit: 10000});
      }
    })()
  );
};
