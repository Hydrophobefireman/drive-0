import {User} from "@/api-types/user";
import {requests} from "@/util/bridge";
import {registerRoute} from "@/util/routes";

export function register(username: string, name: string, password: string) {
  return requests.postJSON<{user_data: User}>(registerRoute, {
    user: username,
    name,
    password,
  });
}
