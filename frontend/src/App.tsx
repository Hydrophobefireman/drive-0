import "@kit/styles";

// javascript is supported
import "./App.css";

import {render, useState} from "@hydrophobefireman/ui-lib";

import {Router} from "./_router";
import {DelayedRender} from "./components/DelayedRender";
import {client} from "./util/bridge";
import {useMount} from "@hydrophobefireman/kit/hooks";

import "./init-spinner";

function AppLoader() {
  const [synced, set] = useState(false);
  useMount(async () => {
    await client.syncWithServer();
    set(true);
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
