import {css} from "catom";

import {revokeIntegrityToken} from "@/handlers/auth";
import {client} from "@/util/bridge";
import {TextButton} from "@hydrophobefireman/kit/button";
import {useClickAway, useToggleState} from "@hydrophobefireman/kit/hooks";
import {useRef, useState} from "@hydrophobefireman/ui-lib";
import {Dropdown} from "@kit/dropdown";
import {LogoutIcon, TrashIcon, UserCircleIcon} from "@kit/icons";
import {Transition} from "@kit/transition";

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
const dropdownCls = css({transform: "translateX(2rem)", opacity: "0"});
const actionButtonCls = css({
  pseudo: {
    " span": {marginLeft: ".25rem", marginRight: ".25rem"},
    ":hover": {
      background: "var(--kit-shade-2)",
    },
    ".kit-button": {borderWidth: "0"},
  },
});
export function Nav() {
  const navRef = useRef<HTMLElement>();
  const buttonRef = useRef<HTMLButtonElement>();
  const {active, toggle, setActive} = useToggleState(false);
  const dropdownRef = useRef<HTMLDivElement>();
  const [dropdownEl, setDropdownEl] = useState<HTMLDivElement>(null);

  useClickAway((e: any) => {
    let __path: EventTarget[];
    const $path = e.composedPath
      ? e.composedPath()
      : (__path = (e as any).path) && __path.length
      ? __path
      : [];
    if (!$path.includes(buttonRef.current)) {
      setActive(false);
    }
  }, dropdownEl);
  async function handleAction(e: JSX.TargetedMouseEvent<HTMLButtonElement>) {
    const {currentTarget} = e;
    const {dataset} = currentTarget;
    switch (dataset.action) {
      case "logout":
        client.logout();
        break;
      case "logout:all":
        {
          revokeIntegrityToken();
          client.logout();
        }
        break;
      default:
        break;
    }
  }
  return (
    <nav class={navClass} ref={navRef}>
      <button
        onClick={toggle}
        ref={buttonRef}
        class={btnCls}
        label="My Account"
      >
        <UserCircleIcon size={"2rem"} />
      </button>

      <Dropdown
        class={[
          css({overflowX: "hidden"}),
          !active && css({zIndex: "0!important"}),
        ].join(" ")}
        parent={navRef}
        sibling={buttonRef}
      >
        <Transition
          transitionHook={() => {
            setDropdownEl(dropdownRef.current);
          }}
          class={css({
            transformOrigin: "right",
            transition: "var(--kit-transition)",
            marginRight: "1.5rem",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          })}
          enterClass={dropdownCls}
          leaveClass={dropdownCls}
          visible={active}
          id={active && "dropdown-menu-profile"}
          render={
            active && (
              <div
                ref={dropdownRef}
                aria-role="dropdown"
                class={css({
                  display: "inline-flex",
                })}
              >
                <div
                  class={css({
                    display: "flex",
                    flexDirection: "column",
                    padding: ".5rem",
                    borderRadius: "var(--kit-radius)",
                    background: "var(--kit-background)",
                    boxShadow: "var(--shadow-elevation-medium)",
                    marginTop: ".5rem",
                  })}
                >
                  <TextButton
                    prefix={<TrashIcon />}
                    class={actionButtonCls}
                    mode="secondary"
                    variant="custom"
                    data-action="logout:all"
                    onClick={handleAction}
                  >
                    Log out of all devices
                  </TextButton>
                  <TextButton
                    data-action="logout"
                    onClick={handleAction}
                    prefix={<LogoutIcon />}
                    class={actionButtonCls}
                    mode="secondary"
                    variant="custom"
                  >
                    Log out
                  </TextButton>
                </div>
              </div>
            )
          }
        />
      </Dropdown>
    </nav>
  );
}
