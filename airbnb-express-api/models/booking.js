const db = require("../db")
const { BadRequestError, NotFoundError } = require("../utils/errors")

class Booking {
  static async createBooking({ newBooking, listing, user }) {
    const requiredFields = ["startDate", "endDate"]
    requiredFields.forEach((field) => {
      if (!newBooking?.hasOwnProperty(field)) {
        throw new BadRequestError(`Missing required field - ${field} - in request body.`)
      }
    })

    const results = await db.query(
      `
        INSERT INTO bookings (
          payment_method,
          start_date,
          end_date,
          guests,
          total_cost,
          listing_id,
          user_id
        )
        VALUES (
          $1,
          ($2)::date,
          ($3)::date,
          $4,

          -- calculate total_cost by
          -- multiplying days spent (+1)
          -- with the listing price + market fees
          -- rounded up to nearest cent
          -- Example:
          -- CEIL(($3)::date - ($2)::date + 1) * ($5 + $5 * 0.1) turns into
          -- CEIL(('10-10-2021')::date - ('10-08-2021')::date + 1) * (10000 + 10000 * 0.1)
          -- which becomes CEIL((3) * (11000))

          CEIL(
            (($3)::date - ($2)::date + 1) * ($5 + $5 * 0.1)
          ),
          $6,
          (SELECT id FROM users WHERE username = $7)
        )
        RETURNING id,
                  payment_method AS "paymentMethod",
                  start_date AS "startDate",
                  end_date AS "endDate",
                  guests,
                  total_cost AS "totalCost",
                  listing_id AS "listingId",
                  user_id AS "userId",

                  -- subquery to get the username of the booking user
                  (
                    SELECT username
                    FROM users
                    WHERE id = user_id
                  ) AS "username",

                  -- nested subqueries
                  -- to select the username
                  -- of the host who owns the listing
                  (
                    SELECT users.username
                    FROM users
                    WHERE users.id = (
                      SELECT listings.user_id
                      FROM listings
                      WHERE listings.id = listing_id
                    )
                  ) AS "hostUsername",
                  created_at AS "createdAt";
      `,
      [
        newBooking.paymentMethod || "card",
        newBooking.startDate,
        newBooking.endDate,
        newBooking.guests || 1,
        listing.price,
        listing.id,
        user.username,
      ]
    )

    return results.rows[0]
  }

  static async fetchBookingById(bookingId) {
    // fetch a single booking by its id
    const results = await db.query(
      `
      SELECT id,
             payment_method AS "paymentMethod",
             start_date AS "startDate",
             end_date AS "endDate",
             guests,
             total_cost AS "totalCost",
             listing_id AS "listingId",
             user_id AS "userId",
             -- subquery to select the username
             -- of the user who is making the booking
             (
               SELECT username
               FROM users
               WHERE id = user_id
             ) AS "username",
             -- nested subquery to select the username
             -- of the host user who owns the listing
             (
               SELECT users.username
               FROM users
               WHERE users.id = (
                 SELECT listings.user_id
                 FROM listings
                 WHERE listings.id = listing_id
               )
             ) AS "hostUsername",
             created_at AS "createdAt"
      FROM bookings
      WHERE id = $1;
      `,
      [bookingId]
    )

    const booking = results.rows[0]

    if (booking) return booking

    throw new NotFoundError("No booking found with that id.")
  }

  // static async listBookingsForListing(listingId) {
  //   // list all bookings for a single listing
  //   const results = await db.query(
  //     `
  //     SELECT bookings.id,
  //            bookings.payment_method AS "paymentMethod",
  //            bookings.start_date AS "startDate",
  //            bookings.end_date AS "endDate",
  //            bookings.guests,
  //            bookings.total_cost AS "totalCost",
  //            bookings.listing_id AS "listingId",
  //            bookings.user_id AS "userId",
  //            users.username AS "username",

  //            -- subquery to get username of
  //            -- user who owns the listing
  //            (
  //             SELECT hostUsers.username
  //             FROM users AS hostUsers
  //             WHERE hostUsers.id = (
  //               SELECT listings.user_id
  //               FROM listings
  //               WHERE listings.id = listing_id
  //             )
  //            ) AS "hostUsername",
  //            bookings.created_at AS "createdAt"
  //     FROM bookings
  //       JOIN users ON users.id = bookings.user_id
  //     WHERE listing_id = $1
  //     ORDER BY bookings.created_at DESC;
  //     `,
  //     [listingId]
  //   )

  //   return results.rows
  // }

  static async listBookingsFromUser(user) {
    // list all bookings that the user has created
    const results = await db.query(
      `
      SELECT bookings.id,
            bookings.payment_method AS "paymentMethod",
            bookings.start_date AS "startDate",
            bookings.end_date AS "endDate",
            bookings.guests,
            bookings.total_cost AS "totalCost",
            bookings.listing_id AS "listingId",
            bookings.user_id AS "userId",
            users.username AS "username",
            (
              SELECT hostUsers.username
              FROM users AS hostUsers
              WHERE hostUsers.id = (
                SELECT listings.user_id
                FROM listings
                WHERE listings.id = listing_id
              )
            ) AS "hostUsername",            
            bookings.created_at AS "createdAt"
      FROM bookings
        JOIN users ON users.id = bookings.user_id
      WHERE user_id = (SELECT id FROM users WHERE username = $1)
      ORDER BY bookings.created_at DESC;
      `,
      [user.username]
    )

    return results.rows
  }

  static async listBookingsForUserListings(user) {
    // list all bookings created for any of the listings that a user owns
    const results = await db.query(
      `
      SELECT bookings.id,
             bookings.payment_method AS "paymentMethod",
             bookings.start_date AS "startDate",
             bookings.end_date AS "endDate",
             bookings.guests,
             bookings.total_cost AS "totalCost",
             bookings.listing_id AS "listingId",
             bookings.user_id AS "userId",
             users.username AS "username",
             (
              SELECT hostUsers.username
              FROM users AS hostUsers
              WHERE hostUsers.id = (
                SELECT listings.user_id
                FROM listings
                WHERE listings.id = listing_id
              )
             ) AS "hostUsername",
             bookings.created_at AS "createdAt"
      FROM bookings
        JOIN users ON users.id = bookings.user_id
        JOIN listings ON listings.id = bookings.listing_id
      WHERE listings.user_id = (SELECT id FROM users WHERE username = $1)
      ORDER BY bookings.created_at DESC;
      `,
      [user.username]
    )

    return results.rows
  }
}

module.exports = Booking
