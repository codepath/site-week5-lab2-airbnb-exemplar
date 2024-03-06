const db = require("../db")
const { BadRequestError, NotFoundError } = require("../utils/errors")

class Listing {
  static async createListing({ newListing, user }) {
    const requiredFields = ["location", "title", "description", "imageUrl"]
    requiredFields.forEach((field) => {
      if (!newListing?.hasOwnProperty(field)) {
        throw new BadRequestError(`Missing required field - ${field} - in request body.`)
      }
    })

    const results = await db.query(
      `
        INSERT INTO listings (user_id, location, title, description, image_url, image_url2, image_url3, price)
        VALUES ((SELECT id FROM users WHERE username = $1), $2, $3, $4, $5, $6, $7, $8)
        RETURNING id,
                  user_id AS "userId",
                  $1 AS "username",
                  title,
                  description,
                  location,
                  image_url AS "imageUrl",
                  image_url2 AS "imageUrl2",
                  image_url3 AS "imageUrl3",
                  price,
                  -- include 10% market fees
                  CEIL(price + price * 0.1) AS "totalAmount",
                  created_at AS "createdAt",
                  updated_at AS "updatedAt";
      `,
      [
        user.username,
        newListing.location,
        newListing.title,
        newListing.description,
        newListing.imageUrl,
        newListing.imageUrl2,
        newListing.imageUrl3,
        newListing.price,
      ]
    )

    return results.rows[0]
  }

  static async fetchListingById(listingId) {
    const results = await db.query(
      `
      SELECT id,
             user_id AS "userId",
             (
               SELECT username 
               FROM users 
               WHERE id = user_id
             ) AS "username",
             title,
             description,
             location,
             image_url AS "imageUrl",
             image_url2 AS "imageUrl2",
             image_url3 AS "imageUrl3",
             price,
             -- include 10% market fees
             CEIL(price + price * 0.1) AS "totalAmount",
             created_at AS "createdAt",
             updated_at AS "updatedAt"
      FROM listings
      WHERE id = $1;
      `,
      [listingId]
    )

    const listing = results.rows[0]

    if (listing?.title) return listing

    throw new NotFoundError("No listing found with that id.")
  }

  static async fetchAll() {
    const results = await db.query(
      `
      SELECT listings.id,
             listings.user_id AS "userId",
             users.username AS "username",
             listings.title,
             listings.description,
             listings.location,
             listings.image_url AS "imageUrl",
             listings.image_url2 AS "imageUrl2",
             listings.image_url3 AS "imageUrl3",
             listings.price,
             -- include 10% market fees
             listings.price + listings.price * 0.1 AS "totalAmount",
             listings.created_at AS "createdAt",
             listings.updated_at AS "updatedAt"             
      FROM listings
      JOIN users ON users.id = listings.user_id;      
      `
    )

    return results.rows
  }
}

module.exports = Listing
