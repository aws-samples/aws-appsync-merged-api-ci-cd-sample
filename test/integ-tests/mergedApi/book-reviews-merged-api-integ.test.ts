import { CloudFormationClient, ListExportsCommand } from "@aws-sdk/client-cloudformation"
import * as fs from "fs"
import { executeRequest } from "../common-utils"

const cloudformationClient = new CloudFormationClient();

let endpoint: string;
let apiUrl: URL

beforeAll(async () => {
   const response = await cloudformationClient.send(new ListExportsCommand({}))
   endpoint = response.Exports?.find(e => e.Name === `${process.env.Stage}-BookReviewsMergedApiUrl`)?.Value ?? "";
   console.log(endpoint)
   apiUrl = new URL(endpoint)
})

test('basic integration test', async () => {
  var authorId;
  var bookId;
  var reviewIds: string[] = [];
  try {
    authorId = await createAuthor();
    bookId = await createBook(authorId);
    reviewIds = await createReviews(authorId, bookId);
    await getAuthorsBooksAndReviews(authorId, bookId, reviewIds);
    await getBookAuthorAndReviews(bookId, authorId, reviewIds);
    await getReviewsBookAndAuthor(bookId, authorId, reviewIds);
  } finally {
    if (authorId != null) {
      await deleteAuthor(authorId);
    }

    if (bookId != null) {
      await deleteBook(bookId);
    }

    for (var i = 0; i < reviewIds.length; i++) {
      await deleteReview(reviewIds[i]);
    }
  }
}, 15000)

async function createAuthor() {
  var request = fs.readFileSync('test/integ-tests/sourceApis/authorsService/createAuthor.graphql', 'utf-8')
  var response = await executeRequest(apiUrl, request)
  expect(response.data.createAuthor.name).toEqual("Jonathon")
  expect(response.data.createAuthor.contactEmail).toEqual("jonathon@example.com")
  expect(response.data.createAuthor.id).toBeDefined();
  return response.data.createAuthor.id;
}

async function createBook(authorId: string) {
    var request = fs.readFileSync('test/integ-tests/sourceApis/booksService/createBook.graphql', 'utf-8')
    var response = await executeRequest(apiUrl, request, { authorId: authorId })
    expect(response.data.createBook.title).toEqual("A book for testing")
    expect(response.data.createBook.genre).toEqual("Fantasy")
    expect(response.data.createBook.id).toBeDefined();
    return response.data.createBook.id;
}

async function createReviews(authorId: string, bookId: string) {
  const reviewIds: string[] = [];
  reviewIds.push(await createReview(authorId, bookId, "I enjoyed it", 9));
  reviewIds.push(await createReview(authorId, bookId, "It was ok.", 6));
  reviewIds.push(await createReview(authorId, bookId, "It was boring!", 3));
  return reviewIds;
}

async function createReview(authorId: string, bookId: string, comment: string, rating: number) {
  var request = fs.readFileSync('test/integ-tests/sourceApis/reviewsService/createReview.graphql', 'utf-8')
  var response = await executeRequest(apiUrl, request, { authorId: authorId, bookId: bookId, comment: comment, rating: rating})
  expect(response.data.createReview.comment).toEqual(comment)
  expect(response.data.createReview.rating).toEqual(rating)
  expect(response.data.createReview.id).toBeDefined();
  return response.data.createReview.id;
}

async function deleteAuthor(authorId: string) {
  var request = fs.readFileSync('test/integ-tests/sourceApis/authorsService/deleteAuthor.graphql', 'utf-8')
  await executeRequest(apiUrl, request, { id: authorId })
}

async function deleteBook(bookId: string) {
  var request = fs.readFileSync('test/integ-tests/sourceApis/booksService/deleteBook.graphql', 'utf-8')
  await executeRequest(apiUrl, request, { id: bookId })
}

async function deleteReview(reviewId: string) {
  var request = fs.readFileSync('test/integ-tests/sourceApis/reviewsService/deleteReview.graphql', 'utf-8')
  await executeRequest(apiUrl, request, { id: reviewId })
}

async function getAuthorsBooksAndReviews(authorId: string, bookId: string, reviewIds: string[]) {
  var request = fs.readFileSync('test/integ-tests/mergedApi/getAuthorsBooksAndReviews.graphql', 'utf-8')
  const response = await executeRequest(apiUrl, request)
  var items = response.data.listAuthors.items;
  var foundAuthor;
  for (var i = 0; i < items.length; i++) {
      if (items[i].id == authorId) {
        foundAuthor = items[i];
      }
  }

  expect(foundAuthor).toBeDefined()
  expect(foundAuthor.name).toEqual("Jonathon")
  expect(foundAuthor.contactEmail).toEqual("jonathon@example.com")
  items = foundAuthor.books.items;
  expect(items.length).toEqual(1);
  expect(items[0].id).toEqual(bookId);
  expect(items[0].title).toEqual("A book for testing")
  items = foundAuthor.reviews.items
  expect(items.length).toEqual(reviewIds.length)
  for (var i = 0; i < items.length; i++) {
    expect(reviewIds.includes(items[i].id)).toBeTruthy()
  }
}

async function getBookAuthorAndReviews(bookId: string, authorId: string, reviewIds: string[]) {
  var request = fs.readFileSync('test/integ-tests/mergedApi/getBookAuthorAndReviews.graphql', 'utf-8')
  const response = await executeRequest(apiUrl, request, { bookId: bookId })
  const book = response.data.getBook;
  expect(book.title).toEqual("A book for testing")
  expect(book.genre).toEqual("Fantasy")
  expect(book.author.id).toEqual(authorId)
  expect(book.author.name).toEqual("Jonathon")
  
  const items = book.reviews.items
  expect(items.length).toEqual(reviewIds.length)
  for (var i = 0; i < items.length; i++) {
    expect(reviewIds.includes(items[i].id)).toBeTruthy()
  }
}

async function getReviewsBookAndAuthor(bookId: string, authorId: string, reviewIds: string[]) {
  var request = fs.readFileSync('test/integ-tests/mergedApi/getReviewsBookAndAuthor.graphql', 'utf-8')
  const response = await executeRequest(apiUrl, request)
  const reviews = response.data.listReviews.items;
  expect(reviews.length).toEqual(reviewIds.length)
  for (var i = 0; i < reviews.length; i++) {
    expect(reviewIds.includes(reviews[i].id)).toBeTruthy()
    expect(reviews[i].author.id).toEqual(authorId)
    expect(reviews[i].book.id).toEqual(bookId)
  }
}
