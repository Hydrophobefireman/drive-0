import {css} from "catom";

import {UserCircleIcon} from "@kit/icons";

const btnCls = css({
  padding: "0.5rem",
  borderRadius: "50%",
  height: "3rem",
  width: "3rem",
  transition: "var(--kit-transition)",
  boxShadow: "var(--kit-shadow)",
  pseudo: {
    ":hover": {
      transform: "scale(1.05)",
    },
  },
});
const navClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: ".5rem",
  margin: ".5rem",
});
export function Nav() {
  return (
    <nav class={navClass}>
      <button class={btnCls} label="My Account">
        <UserCircleIcon size={"2rem"} />
      </button>
    </nav>
  );
}
