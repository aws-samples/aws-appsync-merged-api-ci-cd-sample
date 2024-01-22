import * as fs from "fs";
import { AppSyncClient, AppSyncRuntime, EvaluateCodeCommand } from "@aws-sdk/client-appsync";

const resolverCodePath = './lib/sourceApis/booksService/resolverCode';
const runtime: AppSyncRuntime = { name:'APPSYNC_JS', runtimeVersion: '1.0.0' };
const appsyncClient = new AppSyncClient();

test('test get book resolver code request', async () => {
    const code = fs.readFileSync(resolverCodePath + '/getBook.js', 'utf-8')
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

test('test get book for review resolver code request', async () => {
    const code = fs.readFileSync(resolverCodePath + '/getBookForReview.js', 'utf-8')
    const context = "{\"source\": { \"bookId\": \"2\" }}";

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

test('test get books for author resolver code request', async () => {
    const code = fs.readFileSync(resolverCodePath + '/getBooksForAuthor.js', 'utf-8')
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
    expect(result.query.expressionValues[":authorId"].S).toEqual("2")
    expect(result.index).toEqual("book-author-index")
    expect(result.scanIndexForward).toBeTruthy()
    expect(result.select).toEqual("ALL_ATTRIBUTES")
});

test('test delete book resolver code request', async () => {
    const code = fs.readFileSync(resolverCodePath + '/deleteBook.js', 'utf-8')
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

    const result = JSON.parse(response.evaluationResult);
    expect(result.operation).toEqual("DeleteItem")
    expect(result.key.id.S).toEqual("2")
});

test('test create book resolver code request', async () => {
    const code = fs.readFileSync(resolverCodePath + '/createBook.js', 'utf-8')
    const context = "{\"arguments\": { \"input\": {\"title\": \"Pride and Prejudice\", \"authorId\": \"2\", \"publisherId\": \"1\", \"genre\": \"Classics\", \"publicationYear\": 1813}}}";

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
    expect(result.operation).toEqual("PutItem")

    expect(result.attributeValues.title.S).toEqual("Pride and Prejudice");
    expect(result.attributeValues.publicationYear.N).toEqual(1813);
    expect(result.condition.expression).toEqual("attribute_not_exists(#id)")
});

test('test list books request', async () => {
    const code = fs.readFileSync(resolverCodePath + '/listBooks.js', 'utf-8')
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