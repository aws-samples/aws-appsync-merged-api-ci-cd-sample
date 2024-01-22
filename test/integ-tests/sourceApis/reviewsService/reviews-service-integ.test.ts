import { CloudFormationClient, ListExportsCommand} from "@aws-sdk/client-cloudformation"
import * as fs from "fs"
import { executeRequest } from "../../common-utils"


const cloudformationClient = new CloudFormationClient();
const requestCodePath = "test/integ-tests/sourceApis/reviewsService"

let endpoint: string;
let apiUrl: URL

beforeAll(async () => {
   const response = await cloudformationClient.send(new ListExportsCommand({}))
   endpoint = response.Exports?.find(e => e.Name === `${process.env.Stage}-ReviewsApiUrl`)?.Value ?? "";
   console.log(endpoint)
   apiUrl = new URL(endpoint)
})

test('basic integration test', async () => {
    var request = fs.readFileSync(requestCodePath + '/createReview.graphql', 'utf-8')
    var response = await executeRequest(apiUrl, request, { authorId: "1", bookId: "2", comment: "I enjoyed it", rating: 9})
    expect(response.data.createReview.comment).toEqual("I enjoyed it")
    expect(response.data.createReview.rating).toEqual(9)
    expect(response.data.createReview.id).toBeDefined();
    const reviewId = response.data.createReview.id;

    try {
        request = fs.readFileSync(requestCodePath + '/getReview.graphql', 'utf-8')
        response = await executeRequest(apiUrl, request, { id: reviewId })
        expect(response.data.getReview.id).toEqual(reviewId)
        expect(response.data.getReview.comment).toEqual("I enjoyed it")
        expect(response.data.getReview.rating).toEqual(9)


        request = fs.readFileSync(requestCodePath + '/listReviews.graphql', 'utf-8')
        response = await executeRequest(apiUrl, request)

        const items = response.data.listReviews.items;

        var foundItem: any 
        for (var i = 0; i < items.length; i++) {
            if (items[i].id == reviewId) {
                foundItem = items[i];
            }
        }

        expect(foundItem).toBeDefined()
        expect(foundItem.id).toEqual(reviewId)
        expect(foundItem.comment).toEqual("I enjoyed it")
        expect(foundItem.rating).toEqual(9)

    } finally {
        request = fs.readFileSync(requestCodePath + '/deleteReview.graphql', 'utf-8')
        response = await executeRequest(apiUrl, request, { id: reviewId })

        request = fs.readFileSync(requestCodePath + '/getReview.graphql', 'utf-8')
        response = await executeRequest(apiUrl, request, { id: reviewId })
        expect(response.data.getReview).toBeNull()
    }
})