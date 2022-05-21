import "@kit/styles";

// javascript is supported
import "./App.css";

import {useSharedStateValue} from "statedrive";

import {render} from "@hydrophobefireman/ui-lib";

import {Router} from "./_router";
import {DelayedRender} from "./components/DelayedRender";
import {useCachedAuth} from "./hooks/use-cached-auth";
import {timeError} from "./store/time-error";
import {sw} from "./sw";

import("./ext/trix.css");
import("./ext/trix");
sw();

function AppLoader() {
  const [, , synced] = useCachedAuth();
  if (synced) return <App />;
  return <DelayedRender time={1000}>Loading...</DelayedRender>;
}
function App() {
  const hasError = useSharedStateValue(timeError);
  if (hasError) {
    return (
      <div>
        Your device time is out of sync. Please fix the time and reload the page
      </div>
    );
  }
  return (
    <main>
      <Router />
    </main>
  );
}

render(<AppLoader />, document.getElementById("app-mount"));
