import {css} from "catom";

import {button, buttonCustom, buttonSecondary, ripple} from "@kit/classnames";

export const gridRoot = css({
  display: "grid",
  padding: ".5rem",
  gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
});
export const menuButton = css({
  transition: "var(--kit-transition)",
  background: "#00000078",
  padding: ".25rem",
  borderRadius: "20px",
  display: "flex",
  pseudo: {
    ":focus-visible": {
      opacity: 1,
    },
  },
  media: {
    "(min-width:600px)": {
      opacity: "0",
    },
  },
});
export const gridEl = css({
  margin: ".25rem",
  border: "2px solid var(--kit-shade-2)",
  borderRadius: "var(--kit-radius)",
  paddingTop: ".5rem",
  paddingBottom: ".5rem",
  boxShadow: "var(--kit-shadow)",
  cursor: "pointer",
  transition: "var(--kit-transition)",
  userSelect: "none",
  position: "relative",
  outline: "3px dotted  transparent",
  minHeight: "200px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  pseudo: {
    "[data-selected]": {outline: "3px dotted"},
    ":hover": {
      boxShadow: "var(--shadow-elevation-low)",
    },
    ":hover button": {opacity: "1"},
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

export const imgPreview = css({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundSize: "cover",
  backgroundPosition: "center",
  borderRadius: "var(--kit-radius)",
  zIndex: "-1",
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
    ":focus-visible": {
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
