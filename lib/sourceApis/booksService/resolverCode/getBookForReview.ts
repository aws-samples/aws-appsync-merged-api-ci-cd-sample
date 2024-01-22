import {Context, util} from '@aws-appsync/utils';
import { defaultResponseHandler } from "./commonUtils";

export function request(ctx: Context) {
    const bookId = ctx.source.bookId
    return {
        operation: 'GetItem',
        key: util.dynamodb.toMapValues({ id: bookId })
    };
}

export function response(ctx: Context) {
    return defaultResponseHandler(ctx);
}
