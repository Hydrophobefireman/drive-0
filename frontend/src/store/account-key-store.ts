import {createState} from "statedrive";
export const ACCOUNT_SESSION_STORAGE_KEY = "auth:account.key";
export const accountKeyStore = createState<string>({
  name: "account-key",
  initialValue: sessionStorage.getItem(ACCOUNT_SESSION_STORAGE_KEY),
});
