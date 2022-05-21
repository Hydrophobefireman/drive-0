import type {Context} from "hono";

import type {Env} from "../types";

export class BaseHandler<T extends string = any> {
  constructor(protected c: Context<T, Env>) {}

  public async handle(): Promise<any> {
    this.c.res = new Response(undefined, {status: 404});
  }
}
