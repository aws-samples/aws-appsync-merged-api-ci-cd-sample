import { CloudFormationClient, ListExportsCommand, Export } from "@aws-sdk/client-cloudformation"
import * as fs from "fs"
import { executeRequest } from "../../common-utils"

const cloudformationClient = new CloudFormationClient();
const requestCodePath = "test/integ-tests/sourceApis/authorsService"

let endpoint: string;
let apiUrl: URL

beforeAll(async () => {
   const response = await cloudformationClient.send(new ListExportsCommand({}))
   endpoint = response.Exports?.find(e => e.Name === `${process.env.Stage}-AuthorsApiUrl`)?.Value ?? "";
   console.log(endpoint)
   apiUrl = new URL(endpoint)
})

test('basic integration test', async () => {
    var request = fs.readFileSync(requestCodePath + '/createAuthor.graphql', 'utf-8')
    var response = await executeRequest(apiUrl, request)
    expect(response.data.createAuthor.name).toEqual("Jonathon")
    expect(response.data.createAuthor.contactEmail).toEqual("jonathon@example.com")
    expect(response.data.createAuthor.id).toBeDefined();
    const authorId = response.data.createAuthor.id;

    try {
        request = fs.readFileSync(requestCodePath + '/getAuthor.graphql', 'utf-8')
        response = await executeRequest(apiUrl, request, { id: authorId })
        expect(response.data.getAuthor.id).toEqual(authorId)
        expect(response.data.getAuthor.name).toEqual("Jonathon")
        expect(response.data.getAuthor.contactEmail).toEqual("jonathon@example.com")


        request = fs.readFileSync(requestCodePath + '/listAuthors.graphql', 'utf-8')
        response = await executeRequest(apiUrl, request)

        const items = response.data.listAuthors.items;

        var foundItem: any 
        for (var i = 0; i < items.length; i++) {
            if (items[i].id == authorId) {
                foundItem = items[i];
            }
        }

        expect(foundItem).toBeDefined()
        expect(foundItem.id).toEqual(authorId)
        expect(foundItem.name).toEqual("Jonathon")
        expect(foundItem.contactEmail).toEqual("jonathon@example.com")

    } finally {
        request = fs.readFileSync(requestCodePath + '/deleteAuthor.graphql', 'utf-8')
        response = await executeRequest(apiUrl, request, { id: authorId })

        request = fs.readFileSync(requestCodePath + '/getAuthor.graphql', 'utf-8')
        response = await executeRequest(apiUrl, request, { id: authorId })
        expect(response.data.getAuthor).toBeNull()
    }
})