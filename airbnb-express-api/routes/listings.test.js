const request = require("supertest")
const app = require("../app")

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testTokens,
  testListingIds,
} = require("../tests/common")

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

const lebronFrenchListing = {
  username: "lebron",
  location: "France",
  title: "Modern home on the French Riviera",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur finibus, ligula eu eleifend consequat, sem metus dignissim purus, et sodales eros ligula non lacus. Maecenas lacinia nibh at semper efficitur. Fusce tincidunt, mi non tincidunt faucibus, neque velit hendrerit tortor, non fermentum nisi tortor at dui.",
  imageUrl:
    "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=2700&q=80",
  imageUrl2:
    "https://images.unsplash.com/photo-1567599672391-17b31d92e431?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2250&q=80",
  imageUrl3:
    "https://images.unsplash.com/photo-1533044309907-0fa3413da946?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80",
  price: 23825,
}

/************************************** POST /listings/ */
describe("POST /listings/", () => {
  test("Authed user can create new listing", async () => {
    const newListing = {
      location: "Canada",
      title: "Test",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur finibus, ligula eu eleifend consequat, sem metus dignissim purus, et sodales eros ligula non lacus. Maecenas lacinia nibh at semper efficitur. Fusce tincidunt, mi non tincidunt faucibus, neque velit hendrerit tortor, non fermentum nisi tortor at dui.",
      imageUrl:
        "https://images.unsplash.com/photo-1539437829697-1b4ed5aebd19?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1534&q=80",
      price: 20000,
    }

    const res = await request(app)
      .post(`/listings`)
      .set("authorization", `Bearer ${testTokens.lebronToken}`)
      .send({ newListing })
    expect(res.statusCode).toEqual(201)

    const { listing } = res.body

    // cast to proper datatypes
    listing.price = Number(listing.price)
    listing.totalAmount = Number(listing.totalAmount)

    expect(listing).toEqual({
      id: expect.any(Number),
      userId: expect.any(Number),
      username: "lebron",
      title: newListing.title,
      location: newListing.location,
      description: newListing.description,
      imageUrl: newListing.imageUrl,
      imageUrl2: null,
      imageUrl3: null,
      price: newListing.price,
      totalAmount: Math.ceil(newListing.price + newListing.price * 0.1),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })
  })

  test("Throws Unauthorized error when user is unauthenticated", async () => {
    const res = await request(app).post(`/listings/`)
    expect(res.statusCode).toEqual(401)
  })
})

/************************************** GET /listings/ */

describe("GET /listings", () => {
  test("Authed user can fetch all listings", async () => {
    const res = await request(app).get(`/listings/`).set("authorization", `Bearer ${testTokens.jloToken}`)
    expect(res.statusCode).toEqual(200)

    const { listings } = res.body

    expect(listings.length).toEqual(12)

    const frenchListingForLebron = listings.find((l) => l.username === "lebron" && l.location === "France")
    const { username, location, title, description, imageUrl, imageUrl2, imageUrl3, price } = frenchListingForLebron
    expect({ username, location, title, description, imageUrl, imageUrl2, imageUrl3, price: Number(price) }).toEqual(
      lebronFrenchListing
    )
  })

  test("Anonymous user can fetch all listings", async () => {
    const res = await request(app).get(`/listings/`)
    expect(res.statusCode).toEqual(200)

    const { listings } = res.body

    expect(listings.length).toEqual(12)

    const frenchListingForLebron = listings.find((l) => l.username === "lebron" && l.location === "France")
    const { username, location, title, description, imageUrl, imageUrl2, imageUrl3, price } = frenchListingForLebron
    expect({ username, location, title, description, imageUrl, imageUrl2, imageUrl3, price: Number(price) }).toEqual(
      lebronFrenchListing
    )
  })
})

/************************************** GET /listings/:listingId */

describe("GET /listings/:listingId", () => {
  test("Authenticated user can get listing by id", async () => {
    const listingId = testListingIds[0]
    const res = await request(app).get(`/listings/${listingId}/`).set("authorization", `Bearer ${testTokens.jloToken}`)
    expect(res.statusCode).toEqual(200)

    const { listing } = res.body
    const { username, location, title, description, imageUrl, imageUrl2, imageUrl3, price } = listing
    expect({ username, location, title, description, imageUrl, imageUrl2, imageUrl3, price: Number(price) }).toEqual(
      lebronFrenchListing
    )
  })

  test("Throws Unauthorized error when user is unauthenticated", async () => {
    const listingId = testListingIds[0]
    const res = await request(app).get(`/listings/${listingId}/`)
    expect(res.statusCode).toEqual(401)
  })
})
