import {css} from "catom";

import {savePwd} from "@/crypto/util";
import {register} from "@/handlers/auth";
import {useIsCachedLoggedIn} from "@/hooks/use-cached-auth";
import {client} from "@/util/bridge";
import {Box} from "@hydrophobefireman/kit/container";
import {Input} from "@hydrophobefireman/kit/input";
import {redirect, useEffect, useState} from "@hydrophobefireman/ui-lib";
import {useAlerts} from "@kit/alerts";
import {Button} from "@kit/button";
import {Collapse} from "@kit/collapse";

import {Form} from "../Form";

const authButton = css({
  padding: ".5rem",
  transition: "var(--kit-transition)",
  pseudo: {
    "[data-active]": {
      background: "var(--kit-success-lightest)",
      borderRadius: "30px",
    },
  },
});
export function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState("");
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [formState, setFormState] = useState<"idle" | "pending">("idle");
  const {persist, show} = useAlerts();
  const isLoggedIn = useIsCachedLoggedIn();

  useEffect(() => {
    if (isLoggedIn) return redirect("/app");
  }, [isLoggedIn]);
  async function handleSubmit() {
    if (formState === "pending") return;
    setFormState("pending");
    if (mode === "register") {
      const {result} = register(user, name, pass);
      const {error} = await result;
      if (error) {
        setFormState("idle");
        return persist({
          content: error,
          cancelText: "Okay",
          actionText: "retry",
          type: "error",
          onActionClick() {
            handleSubmit();
          },
        });
      }
    }
    const {error} = await client.login(user, pass).result;
    if (error) {
      setFormState("idle");
      return persist({
        content: error,
        cancelText: "Okay",
        actionText: "retry",
        type: "error",
        onActionClick() {
          handleSubmit();
        },
      });
    }
    show({
      content:
        "You have been logged in. Your password will be saved in the browser for on-device encryption",
    });
    savePwd(pass);
  }
  return (
    <Form onSubmit={handleSubmit}>
      <Box class={css({marginTop: "2rem"})}>
        <div
          class={css({
            width: "80%",
            display: "grid",
            alignItems: "center",
            justifyContent: "center",
            gridTemplateColumns: "1fr 1fr",
            border: "2px solid var(--kit-shade-2)",
            borderRadius: "30px",
            marginBottom: "1.25rem",
          })}
        >
          <button
            type="button"
            class={authButton}
            data-active={mode === "login"}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            class={authButton}
            data-active={mode === "register"}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>
        <Input
          value={user}
          setValue={setUser}
          class={css({boxShadow: "var(--kit-shadow)", marginTop: ".75rem"})}
          variant="material"
          label="user"
        />
        <Collapse active={mode == "register"}>
          <Input
            value={name}
            setValue={setName}
            class={css({boxShadow: "var(--kit-shadow)", marginTop: ".75rem"})}
            disabled={mode == "login"}
            variant="material"
            label="name"
          />
        </Collapse>
        <Input
          value={pass}
          setValue={setPass}
          class={css({boxShadow: "var(--kit-shadow)", marginTop: ".75rem"})}
          variant="material"
          label="password"
          type="password"
        />
        <Button
          class={css({
            width: "100px",
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
          })}
          label="submit"
          variant="shadow"
          mode="secondary"
          disabled={formState === "pending"}
        >
          {formState === "pending" ? "Loading..." : "Submit"}
        </Button>
      </Box>
    </Form>
  );
}
