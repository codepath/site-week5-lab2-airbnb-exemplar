const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testListingIds,
} = require("../tests/common")
const { BadRequestError, ForbiddenError } = require("..//utils/errors")
const permissions = require("./permissions")

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

describe("ListingPermissions", () => {
  describe("Test authedUserIsListingOwner", () => {
    test("Attaches listing to res.local if authed user is listing owner", async () => {
      expect.assertions(3)
      const testListing = testListingIds[0]

      const req = { params: { listingId: testListing } }
      const res = { locals: { user: { username: "lebron" } } }
      const next = (err) => expect(err).toBeFalsy()
      await permissions.authedUserIsListingOwner(req, res, next)

      const { listing } = res.locals
      expect(listing).toBeTruthy()

      const { username, location, title, description, imageUrl, imageUrl2, imageUrl3, price } = listing
      expect({ username, location, title, description, imageUrl, imageUrl2, imageUrl3, price: Number(price) }).toEqual(
        lebronFrenchListing
      )
    })

    test("Throws error if authed user doesn't own listing", async () => {
      expect.assertions(2)
      const testListing = testListingIds[0]

      const req = { params: { listingId: testListing } }
      const res = { locals: { user: { username: "jlo" } } }
      const next = (err) => expect(err instanceof ForbiddenError).toBeTruthy()
      await permissions.authedUserIsListingOwner(req, res, next)

      const { listing } = res.locals
      expect(listing).toBeFalsy()
    })
  })

  describe("authedUserIsNotListingOwner", () => {
    test("Attaches listing to res.local if authed user does not own listing", async () => {
      expect.assertions(3)
      const testListing = testListingIds[0]

      const req = { params: { listingId: testListing } }
      const res = { locals: { user: { username: "jlo" } } }
      const next = (err) => expect(err).toBeFalsy()
      await permissions.authedUserIsNotListingOwner(req, res, next)

      const { listing } = res.locals
      expect(listing).toBeTruthy()

      const { username, location, title, description, imageUrl, imageUrl2, imageUrl3, price } = listing
      expect({ username, location, title, description, imageUrl, imageUrl2, imageUrl3, price: Number(price) }).toEqual(
        lebronFrenchListing
      )
    })

    test("Throws error if authed user does own listing", async () => {
      expect.assertions(2)
      const testListing = testListingIds[0]

      const req = { params: { listingId: testListing } }
      const res = { locals: { user: { username: "lebron" } } }
      const next = (err) => expect(err instanceof BadRequestError).toBeTruthy()
      await permissions.authedUserIsNotListingOwner(req, res, next)

      const { listing } = res.locals
      expect(listing).toBeFalsy()
    })
  })
})
