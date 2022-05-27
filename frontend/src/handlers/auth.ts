import {User} from "@/api-types/user";
import {requests} from "@/util/bridge";
import {registerRoute, revokeTokenRoute} from "@/util/routes";

export function register(username: string) {
  return requests.postJSON<{
    user_data: {user: User; accountKey: string; kv: string};
  }>(registerRoute, {
    user: username,
  });
}

export function revokeIntegrityToken() {
  return requests.get(revokeTokenRoute);
}
