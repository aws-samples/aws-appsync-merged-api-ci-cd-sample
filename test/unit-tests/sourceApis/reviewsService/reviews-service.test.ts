import * as fs from "fs";
import { AppSyncClient, AppSyncRuntime, EvaluateCodeCommand } from "@aws-sdk/client-appsync";

const resolverCodePath = './lib/sourceApis/reviewsService/resolverCode';
const runtime: AppSyncRuntime = { name:'APPSYNC_JS', runtimeVersion: '1.0.0' };
const appsyncClient = new AppSyncClient();

test('test get review resolver code request', async () => {
    const code = fs.readFileSync(resolverCodePath + '/getReview.js', 'utf-8')
    const context = "{\"arguments\": { \"id\": \"2\" }}";

    const command: EvaluateCodeCommand = new EvaluateCodeCommand({
        code: code,
        context: context,
        runtime: runtime,
        function: 'request'
    });

    const response = await appsyncClient.send(command)

    if (!response || !response.evaluationResult) {
        throw Error("Expected response")
    }

    if (response.error) {
        throw Error(`Error occurred during execution: ${response.error}`)
    }

    const result = JSON.parse(response.evaluationResult)
    expect(result.operation).toEqual("GetItem")
    expect(result.key.id.S).toEqual("2")
});

test('test get reviews for author resolver code request', async () => {
    const code = fs.readFileSync(resolverCodePath + '/getReviewsForAuthor.js', 'utf-8')
    const context = "{\"source\": { \"id\": \"2\" }}";

    const command: EvaluateCodeCommand = new EvaluateCodeCommand({
        code: code,
        context: context,
        runtime: runtime,
        function: 'request'
    });

    const response = await appsyncClient.send(command)

    if (!response || !response.evaluationResult) {
        throw Error("Expected response")
    }

    if (response.error) {
        throw Error(`Error occurred during execution: ${response.error}`)
    }

    const result = JSON.parse(response.evaluationResult)
    expect(result.operation).toEqual("Query")
    expect(result.index).toEqual("review-author-index")
    expect(result.query.expressionValues[":authorId"].S).toEqual("2")
});

test('test get reviews for book resolver code request', async () => {
    const code = fs.readFileSync(resolverCodePath + '/getReviewsForBook.js', 'utf-8')
    const context = "{\"source\": { \"id\": \"2\" }}";

    const command: EvaluateCodeCommand = new EvaluateCodeCommand({
        code: code,
        context: context,
        runtime: runtime,
        function: 'request'
    });

    const response = await appsyncClient.send(command)

    if (!response || !response.evaluationResult) {
        throw Error("Expected response")
    }

    if (response.error) {
        throw Error(`Error occurred during execution: ${response.error}`)
    }

    const result = JSON.parse(response.evaluationResult)
    expect(result.operation).toEqual("Query")
    expect(result.index).toEqual("review-book-index")
    expect(result.query.expressionValues[":bookId"].S).toEqual("2")
});

test('test delete review resolver code request', async () => {
    const code = fs.readFileSync(resolverCodePath + '/deleteReview.js', 'utf-8')
    const context = "{\"arguments\": { \"input\": { \"id\": \"2\" }}}";

    const command: EvaluateCodeCommand = new EvaluateCodeCommand({
        code: code,
        context: context,
        runtime: runtime,
        function: 'request'
    });

    const response = await appsyncClient.send(command);

    if (!response || !response.evaluationResult) {
        throw Error("Expected response")
    }

    if (response.error) {
        throw Error(`Error occurred during execution: ${response.error}`)
    }

    const result = JSON.parse(response.evaluationResult)
    expect(result.operation).toEqual("DeleteItem")
    expect(result.key.id.S).toEqual("2")
});

test('test create review resolver code request', async () => {
    const code = fs.readFileSync(resolverCodePath + '/createReview.js', 'utf-8')
    const context = "{\"arguments\": { \"input\": {\"bookId\": \"1\", \"reviewerId\": \"2\", \"comment\": \"This book captured my imagination and I could not put it down\", \"rating\": 7}}}";

    const command: EvaluateCodeCommand = new EvaluateCodeCommand({
        code: code,
        context: context,
        runtime: runtime,
        function: 'request'
    });

    const response = await appsyncClient.send(command)

    if (!response || !response.evaluationResult) {
        throw Error("Expected response")
    }

    if (response.error) {
        throw Error(`Error occurred during execution: ${response.error}`)
    }

    const result = JSON.parse(response.evaluationResult)
    expect(result.operation).toEqual("PutItem")
    expect(result.attributeValues.bookId.S).toEqual("1")
    expect(result.attributeValues.rating.N).toEqual(7)
    expect(result.condition.expression).toEqual("attribute_not_exists(#id)")
});

test('test list reviews request', async () => {
    const code = fs.readFileSync(resolverCodePath + '/listReviews.js', 'utf-8')
    const context = "{\"arguments\": { \"limit\": 23, \"nextToken\": \"testToken\" }}";

    const command: EvaluateCodeCommand = new EvaluateCodeCommand({
        code: code,
        context: context,
        runtime: runtime,
        function: 'request'
    });

    const response = await appsyncClient.send(command)

    if (!response || !response.evaluationResult) {
        throw Error("Expected response")
    }

    if (response.error) {
        throw Error(`Error occurred during execution: ${response.error}`)
    }

    const result = JSON.parse(response.evaluationResult)
    expect(result.operation).toEqual("Scan")
    expect(result.limit).toEqual(23)
    expect(result.nextToken).toEqual("testToken")
});