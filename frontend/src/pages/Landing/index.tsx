import {css} from "catom";

import {Auth} from "@/components/Auth";
import {Box} from "@kit/container";
import {Text} from "@kit/text";

/** Exported routes need to be default exports */
export default function Landing() {
  return (
    <Box class={css({marginTop: "2rem"})}>
      <Text.h1
        class={css({
          fontSize: "max(5vw,45px)",
          fontWeight: "bold",
          textTransform: "capitalize",
        })}
      >
        Drive
      </Text.h1>
      <Text.p class={css({fontSize: "1.25rem"})}>
        Encrypted Storage Network
      </Text.p>
      <Auth />
    </Box>
  );
}
