// local first version of useAuthState

import {authStateKey} from "@/caching/keys";
import {client, useAuthState} from "@/util/bridge";
import {isOnline} from "@/util/is-online";
import {get, set} from "@hydrophobefireman/flask-jwt-jskit";
import {useMount} from "@hydrophobefireman/kit/hooks";
import {useEffect, useState} from "@hydrophobefireman/ui-lib";

export const useCachedAuth = () => {
  const [v, setV] = useAuthState();
  const [isSynced, setSynced] = useState(false);
  useMount(async () => {
    if ((await isOnline()) && !v) {
      await client.syncWithServer();
      setSynced(true);
    } else {
      const info = await get(authStateKey);
      if (info) setV(info as any);
      setSynced(true);
    }
  });
  useEffect(() => {
    if (isSynced) set(authStateKey, v);
  }, [v, isSynced]);
  return [v, setV, isSynced] as const;
};

export const useIsCachedLoggedIn = () => {
  return !!useCachedAuth()[0];
};
