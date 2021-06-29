const { NotFoundError, BadRequestError, UnauthorizedError } = require("../utils/errors")
const User = require("./user")
const Listing = require("./listing")
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
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

describe("Listing", () => {
  /************************************** createListing */
  describe("Test createListing", () => {
    test("Can create new listing successfully with valid params", async () => {
      const user = await User.login({ email: "lebron@james.io", password: "password1" })

      const newListing = {
        location: "Canada",
        title: "Test",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur finibus, ligula eu eleifend consequat, sem metus dignissim purus, et sodales eros ligula non lacus. Maecenas lacinia nibh at semper efficitur. Fusce tincidunt, mi non tincidunt faucibus, neque velit hendrerit tortor, non fermentum nisi tortor at dui.",
        imageUrl:
          "https://images.unsplash.com/photo-1539437829697-1b4ed5aebd19?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1534&q=80",
        price: 20000,
      }

      const listing = await Listing.createListing({ newListing, user })

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
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })

    test("Throws an error when proper attributes aren't provided", async () => {
      expect.assertions(1)

      const user = await User.login({ email: "lebron@james.io", password: "password1" })

      const newListing = {
        location: "Canada",
        title: "Test",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur finibus, ligula eu eleifend consequat, sem metus dignissim purus, et sodales eros ligula non lacus. Maecenas lacinia nibh at semper efficitur. Fusce tincidunt, mi non tincidunt faucibus, neque velit hendrerit tortor, non fermentum nisi tortor at dui.",
        imageUrl:
          "https://images.unsplash.com/photo-1539437829697-1b4ed5aebd19?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1534&q=80",
        // price: 20000,
      }

      try {
        await Listing.createListing({ newListing, user })
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy()
      }
    })
  })

  /************************************** fetch all listings */
  describe("Test fetchAll", () => {
    test("Can successfully fetch all listings", async () => {
      const listings = await Listing.fetchAll()
      expect(listings.length).toEqual(12)

      const frenchListingForLebron = listings.find((l) => l.username === "lebron" && l.location === "France")
      const { username, location, title, description, imageUrl, imageUrl2, imageUrl3, price } = frenchListingForLebron
      expect({ username, location, title, description, imageUrl, imageUrl2, imageUrl3, price: Number(price) }).toEqual(
        lebronFrenchListing
      )
    })
  })

  /************************************** fetch single listing */
  describe("Test fetchListingById", () => {
    test("Can fetch listing by id", async () => {
      const listingId = testListingIds[0]

      const listing = await Listing.fetchListingById(listingId)

      const { username, location, title, description, imageUrl, imageUrl2, imageUrl3, price } = listing
      expect({ username, location, title, description, imageUrl, imageUrl2, imageUrl3, price: Number(price) }).toEqual(
        lebronFrenchListing
      )
    })

    test("Throws NotFound error when id doesn't exist.", async () => {
      expect.assertions(1)

      try {
        const listing = await Listing.fetchListingById(-1000)
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy()
      }
    })
  })
})
