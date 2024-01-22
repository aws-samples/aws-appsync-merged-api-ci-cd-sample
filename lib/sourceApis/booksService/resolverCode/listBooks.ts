import {Context} from "@aws-appsync/utils";
import {defaultResponseHandler} from "./commonUtils";

export function request(ctx: Context) {
    const { limit = 10, nextToken } = ctx.args;
    return { operation: "Scan", limit, nextToken };
}

export function response(ctx: Context) {
    return defaultResponseHandler(ctx);
}