import {useIsLoggedIn} from "@/util/bridge";
import {redirect, useEffect} from "@hydrophobefireman/ui-lib";

function _useAuthGuard(next: string) {
  const isLoggedIn = useIsLoggedIn();
  useEffect(() => {
    if (!isLoggedIn) {
      return redirect(`/?next=${next}`);
    }
  }, [isLoggedIn]);
  return isLoggedIn;
}
export function useAuthGuard(next: string = "/") {
  return _useAuthGuard(next);
}
