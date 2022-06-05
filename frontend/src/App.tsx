import "@kit/styles";

// javascript is supported
import "./App.css";
import "./init-spinner";

import {get, set} from "@hydrophobefireman/flask-jwt-jskit";
import {useMount} from "@hydrophobefireman/kit/hooks";
import {render, useState} from "@hydrophobefireman/ui-lib";

import {Router} from "./_router";
import {DelayedRender} from "./components/DelayedRender";
import {
  ACCOUNT_SESSION_STORAGE_KEY,
  accountKeyStore,
} from "./store/account-key-store";
import {client} from "./util/bridge";

function AppLoader() {
  const [synced, setSynced] = useState(false);
  useMount(async () => {
    await client.syncWithServer();
    set(accountKeyStore, (await get(ACCOUNT_SESSION_STORAGE_KEY)) || null);
    setSynced(true);
  });
  if (synced) return <App />;
  return <DelayedRender time={1000}>Loading...</DelayedRender>;
}
function App() {
  return (
    <main>
      <Router />
    </main>
  );
}

render(<AppLoader />, document.getElementById("app-mount"));
