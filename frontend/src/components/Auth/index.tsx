import {css} from "catom";

import {register} from "@/handlers/auth";
import {client, useIsLoggedIn} from "@/util/bridge";
import {Box} from "@hydrophobefireman/kit/container";
import {Input} from "@hydrophobefireman/kit/input";
import {redirect, useEffect, useRef, useState} from "@hydrophobefireman/ui-lib";
import {useAlerts} from "@kit/alerts";
import {Button} from "@kit/button";
import {Modal} from "@kit/modal";
import {Form} from "../Form";
import {Text} from "@hydrophobefireman/kit/text";
import {ClipboardCopyIcon} from "@hydrophobefireman/kit/icons";
import {Collapse} from "@kit/collapse";
import {set} from "statedrive";
import {accountKeyStore} from "@/store/account-key-store";

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
  const [accKey, setKey] = useState("");
  const [formState, setFormState] = useState<"idle" | "pending" | "registered">(
    "idle"
  );
  const {persist, show} = useAlerts();
  const isLoggedIn = useIsLoggedIn();
  const registrationInfo = useRef<{accountKey: string}>(null);
  useEffect(() => {
    if (isLoggedIn) return redirect("/app");
  }, [isLoggedIn]);
  async function handleSubmit() {
    if (formState === "pending") return;
    setFormState("pending");
    if (mode === "register") {
      const {result} = register(user);
      const {error, data} = await result;
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
      const {user_data} = data;
      const {accountKey} = user_data;
      setFormState("registered");
      registrationInfo.current = {accountKey};
    } else {
      login(accKey);
    }
  }
  async function login(key: string) {
    setFormState("pending");
    const {error, data} = await client.login(user, key).result;
    setFormState("idle");
    if (error) {
      return persist({
        content: error,
        cancelText: "Okay",
        actionText: "retry",
        type: "error",
        onActionClick() {
          login(key);
        },
      });
    }
    set(accountKeyStore, key);
    return redirect("/app");
  }

  return (
    <>
      <Modal active={formState === "registered"}>
        <Modal.Body>
          <Modal.Title>Registered</Modal.Title>
          <Text> Thanks for registering!</Text>
          <Text>
            Please save the following account key. It will <strong>NOT</strong>{" "}
            be stored or displayed again{" "}
          </Text>
          <Text
            class={css({
              wordBreak: "break-all",
              background: "var(--kit-shade-2)",
              padding: ".5rem",
              borderRadius: "10px",
            })}
          >
            {registrationInfo.current?.accountKey}
          </Text>
          <Button
            class={css({marginTop: ".5rem", marginBottom: ".5rem"})}
            mode="secondary"
            variant="shadow"
            prefix={<ClipboardCopyIcon />}
            label="Copy"
            onClick={async () => {
              const {accountKey} = registrationInfo.current;
              await navigator.clipboard.writeText(accountKey);
              show({content: "Copied!"});
            }}
          >
            Copy
          </Button>
          <Modal.Actions>
            <Modal.Action
              onClick={async () => {
                const {accountKey} = registrationInfo.current;
                login(accountKey);
              }}
              class={css({
                display: "flex",
                margin: "auto",
                alignItems: "center",
                flexDirection: "column",
              })}
            >
              <Text.span>I've saved it.</Text.span>
              <Text.span> Log me in</Text.span>
            </Modal.Action>
          </Modal.Actions>
        </Modal.Body>
      </Modal>
      <Form onSubmit={handleSubmit}>
        <Box
          class={css({
            marginTop: "2rem",
          })}
        >
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
            required
            setValue={setUser}
            class={css({boxShadow: "var(--kit-shadow)", marginTop: ".75rem"})}
            variant="material"
            label="User"
          />
          <Collapse active={mode === "login"}>
            <Input
              disabled={mode === "register"}
              value={accKey}
              required={mode === "login"}
              setValue={setKey}
              class={css({boxShadow: "var(--kit-shadow)", marginTop: ".75rem"})}
              variant="material"
              label="Account Key"
              type="password"
            />
          </Collapse>
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
    </>
  );
}
