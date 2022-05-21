import {useIsLoggedIn} from "@/util/bridge";
import {redirect, useEffect} from "@hydrophobefireman/ui-lib";

import {useIsCachedLoggedIn} from "./use-cached-auth";

function _useAuthGuard(cached: boolean, next: string) {
  const isLoggedIn = cached ? useIsCachedLoggedIn() : useIsLoggedIn();
  useEffect(() => {
    if (!isLoggedIn) {
      return redirect(`/?next=${next}`);
    }
  }, [isLoggedIn]);
}
export function useAuthGuard(next: string = "/") {
  _useAuthGuard(false, next);
}
useAuthGuard.cached = function useAuthGuard(next: string = "/") {
  _useAuthGuard(true, next);
};
