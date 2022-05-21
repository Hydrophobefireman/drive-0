import {User} from "@/api-types/user";
import {Bridge} from "@hydrophobefireman/flask-jwt-jskit";
import {redirect} from "@hydrophobefireman/ui-lib";

import {initialAuthCheckRoute, loginRoute, refreshTokenRoute} from "./routes";

const client = new Bridge<User>(null);

// change these according to your backend
client.setRoutes({
  loginRoute,
  refreshTokenRoute,
  initialAuthCheckRoute,
});
client.onLogout(() => redirect("/login"));

const {useAuthState, useIsLoggedIn} = client.getHooks();

const requests = client.getHttpClient();

export {useAuthState, useIsLoggedIn, requests, client};
