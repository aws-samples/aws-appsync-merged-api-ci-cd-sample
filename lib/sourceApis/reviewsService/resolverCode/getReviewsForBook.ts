import {Context, util} from '@aws-appsync/utils';
import {defaultResponseHandler} from "./commonUtils";

export function request(ctx: Context) {
    return {
        operation: 'Query',
        query: {
            expression: '#bookId = :bookId',
            expressionNames: {
                '#bookId': 'bookId'
            },
            expressionValues: {
                ':bookId': util.dynamodb.toDynamoDB(ctx.source.id)
            }
        },
        index: 'review-book-index',
        limit: 25,
        scanIndexForward: true,
        select: 'ALL_ATTRIBUTES'
    }
}

export function response(ctx: Context) {
    return defaultResponseHandler(ctx);
}