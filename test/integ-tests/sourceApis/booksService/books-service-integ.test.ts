import { CloudFormationClient, ListExportsCommand } from "@aws-sdk/client-cloudformation"
import * as fs from "fs"
import { executeRequest } from "../../common-utils"


const cloudformationClient = new CloudFormationClient();
const requestCodePath = "test/integ-tests/sourceApis/booksService"

let endpoint: string;
let apiUrl: URL

beforeAll(async () => {
   const response = await cloudformationClient.send(new ListExportsCommand({}))
   endpoint = response.Exports?.find(e => e.Name === `${process.env.Stage}-BooksApiUrl`)?.Value ?? "";
   console.log(endpoint)
   apiUrl = new URL(endpoint)
})

test('basic integration test', async () => {
    var request = fs.readFileSync(requestCodePath + '/createBook.graphql', 'utf-8')
    var response = await executeRequest(apiUrl, request, { authorId: "1" })
    expect(response.data.createBook.title).toEqual("A book for testing")
    expect(response.data.createBook.genre).toEqual("Fantasy")
    expect(response.data.createBook.id).toBeDefined();
    const bookId = response.data.createBook.id;

    try {
        request = fs.readFileSync(requestCodePath + '/getBook.graphql', 'utf-8')
        response = await executeRequest(apiUrl, request, { id: bookId})
        expect(response.data.getBook.id).toEqual(bookId)
        expect(response.data.getBook.title).toEqual("A book for testing")
        expect(response.data.getBook.genre).toEqual("Fantasy")


        request = fs.readFileSync(requestCodePath + '/listBooks.graphql', 'utf-8')
        response = await executeRequest(apiUrl, request)

        const items = response.data.listBooks.items;

        var foundItem: any 
        for (var i = 0; i < items.length; i++) {
            if (items[i].id == bookId) {
                foundItem = items[i];
            }
        }

        expect(foundItem).toBeDefined()
        expect(foundItem.id).toEqual(bookId)
        expect(foundItem.genre).toEqual("Fantasy")
        expect(foundItem.title).toEqual("A book for testing")

    } finally {
        request = fs.readFileSync(requestCodePath + '/deleteBook.graphql', 'utf-8')
        response = await executeRequest(apiUrl, request, { id: bookId })

        request = fs.readFileSync(requestCodePath + '/getBook.graphql', 'utf-8')
        response = await executeRequest(apiUrl, request, { id: bookId })
        expect(response.data.getBook).toBeNull()
    }
})