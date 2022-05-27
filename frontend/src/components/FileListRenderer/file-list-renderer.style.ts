import {css} from "catom";

import {button, buttonCustom, buttonSecondary, ripple} from "@kit/classnames";

export const gridRoot = css({
  display: "grid",
  padding: ".5rem",
  gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
});
export const gridEl = css({
  margin: ".25rem",
  border: "2px solid var(--kit-shade-2)",
  borderRadius: "var(--kit-radius)",
  padding: ".5rem",
  boxShadow: "var(--kit-shadow)",
  cursor: "pointer",
  transition: "var(--kit-transition)",
  userSelect: "none",
  position: "relative",
  outline: "3px dotted  transparent",
  pseudo: {
    "[data-selected]": {outline: "3px dotted"},
    ":hover": {
      transition: "var(--kit-transition)",
      backgroundColor: "var(--kit-shade-1)",
      boxShadow: "var(--shadow-elevation-low)",
    },
  },
});
export const gridElLoader = [gridEl, css({minHeight: "150px"})].join();
export const menuActive = css({
  position: "absolute",
  right: ".5rem",
  top: "2.5rem",
  padding: ".5rem",
  background: "var(--kit-background)",
  boxShadow: "var(--shadow-elevation-medium)",
  transition: "var(--kit-transition)",
  transformOrigin: "top right",
  borderRadius: "var(--kit-radius)",
});
export const menuInactive = [
  menuActive,
  css({transform: "scale(0)", opacity: "0"}),
].join(" ");
export const actionButton = css({
  pseudo: {
    ".kit-button": {border: "none", width: "100%"},
    ":hover": {
      background: "var(--kit-shade-2)",
    },
  },
});
export const gridElDeleteState = [
  gridEl,
  css({opacity: ".5", filter: "blur(2px)", pointerEvents: "none"}),
];
export const buttonWrapperCls = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "80%",
  margin: "auto",
});

export const openLinkButton = [
  actionButton,
  ripple,
  button,
  buttonCustom,
  buttonSecondary,
  css({
    textDecoration: "none",
    borderRadius: "var(--kit-radius)",
    color: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
].join(" ");
