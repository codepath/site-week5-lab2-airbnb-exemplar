const express = require("express")
const Listing = require("../models/listing")
const security = require("../middleware/security")
const router = express.Router()

router.post("/", security.requireAuthenticatedUser, async function (req, res, next) {
  try {
    const user = res.locals.user
    const listing = await Listing.createListing({ newListing: req.body.newListing, user })
    return res.status(200).json({ listing })
  } catch (err) {
    next(err)
  }
})

router.get("/", async function (req, res, next) {
  try {
    const listings = await Listing.fetchAll()
    return res.status(200).json({ listings })
  } catch (err) {
    return next(err)
  }
})

router.get("/:listingId", security.requireAuthenticatedUser, async function (req, res, next) {
  try {
    const listing = await Listing.fetchListingById(req.params.listingId)
    return res.status(200).json({ listing })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
