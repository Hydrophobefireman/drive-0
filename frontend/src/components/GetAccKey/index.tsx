import {css} from "catom";

import {ACCOUNT_SESSION_STORAGE_KEY} from "@/store/account-key-store";
import {set} from "@hydrophobefireman/flask-jwt-jskit";
import {TextButton} from "@hydrophobefireman/kit/button";
import {Checkbox, Input, useCheckbox} from "@hydrophobefireman/kit/input";
import {Modal} from "@hydrophobefireman/kit/modal";
import {Text} from "@hydrophobefireman/kit/text";
import {useState} from "@hydrophobefireman/ui-lib";

import {Form} from "../Form";

export function GetAccKey({setKey}: {setKey(k: string): void}) {
  const [localKey, _setKey] = useState("");
  const {checked, toggle} = useCheckbox(false);

  return (
    <Modal active={true}>
      <Modal.Body>
        <Modal.Title>Enter Account Key</Modal.Title>
        <Text>
          Your account key is needed to encrypt and decrypt your files
        </Text>
        <Form
          onSubmit={() => {
            setKey(localKey);
            if (checked) {
              set(ACCOUNT_SESSION_STORAGE_KEY, localKey);
            }
          }}
        >
          <Input
            value={localKey}
            required
            setValue={_setKey}
            class={css({
              boxShadow: "var(--kit-shadow)",
              marginTop: ".75rem",
            })}
            variant="material"
            label="Account Key"
            type="password"
          />
          <Checkbox onCheck={toggle} checked={checked}>
            Save my key
          </Checkbox>
          <TextButton
            class={css({
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: ".5rem",
            })}
            variant="shadow"
            mode="secondary"
          >
            Submit
          </TextButton>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
