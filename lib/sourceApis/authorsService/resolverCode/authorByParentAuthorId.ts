import {Context, util} from '@aws-appsync/utils';
import { defaultResponseHandler } from "./commonUtils";

export function request(ctx: Context) {
    const authorId = ctx.source.authorId
    return {
        operation: 'GetItem',
        key: util.dynamodb.toMapValues({ id: authorId })
    };
}

export function response(ctx: Context) {
    return defaultResponseHandler(ctx);
}
