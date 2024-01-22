import * as fs from "fs";
import { AppSyncClient, AppSyncRuntime, EvaluateCodeCommand } from "@aws-sdk/client-appsync";

const resolverCodePath = './lib/sourceApis/authorsService/resolverCode';
const runtime: AppSyncRuntime = { name:'APPSYNC_JS', runtimeVersion: '1.0.0' };
const appsyncClient = new AppSyncClient();

test('test get author resolver code request', async () => {
    const code = fs.readFileSync(resolverCodePath + '/getAuthor.js', 'utf-8')
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

test('test delete author resolver code request', async () => {
    const code = fs.readFileSync(resolverCodePath + '/deleteAuthor.js', 'utf-8')
    const context = "{\"arguments\": { \"input\": { \"id\": \"2\" }}}";

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
    expect(result.operation).toEqual("DeleteItem")
    expect(result.key.id.S).toEqual("2")
});

test('test create author resolver code request', async () => {
    const code = fs.readFileSync(resolverCodePath + '/createAuthor.js', 'utf-8')
    const context = "{\"arguments\": { \"input\": {\"name\": \"Jonathon\", \"bio\": \"Boston novelist\", \"nationality\": \"USA\", \"email\": \"jonathon@example.com\"}}}";

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
    expect(result.attributeValues.nationality.S).toEqual("USA");
    expect(result.condition.expression).toEqual("attribute_not_exists(#id)")
});

test('test author by parent author id request', async () => {
    const code = fs.readFileSync(resolverCodePath + '/authorByParentAuthorId.js', 'utf-8')
    const context = "{\"source\": { \"authorId\": \"2\" }}";

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

test('test list authors request', async () => {
    const code = fs.readFileSync(resolverCodePath + '/listAuthors.js', 'utf-8')
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