# AirBnB Clone Part 1

For this lab, interns will be creating a clone of AirBnB - a modern booking platform for local bed and breakfasts. This competitor application will be geared towards celebrities only, in the hopes of attracting the highest revenue customers to the platform. Celebrities should be able to sign up, list any of their personal residences, and let other celebrities book trips to stay in their houses.

We'll start on the backend side of things and focus on writing tests to verify that the backend is working correctly, as well as use TDD to implement new functionality in our application.


## Things to Know

This lab will help SITE interns master:
+ Writing tests for an Express backend with Jest
+ Simulating HTTP requests with Supertest
+ Using TDD to design and implement new features
+ Verifying permissions with custom API middleware


## Goals

+ Stage 1 - Project Setup
  + Clone the backend starter [repo](https://github.com/Jastor11/kavholm-api-starter)
  + Install the dependencies for the repo
  + Explore the repo
+ Stage 2 - Initialize database with SQL files
  + Run the sql scripts to create the necessary database and tables, as well as seed the database with starter data
  + Explore the backend repo code and examine the created tables with `psql`.
  + Create a `.env` file from the `.env-template` file. Modify any appropriate environment variables there. Open up the `config.js` file and modify any variables there as well.
  + Once the database is setup, start the backend and frontend repos and use the application to get a feel for it. There might be a few broken features, so be aware of them.
+ Stage 3 - Setup Jest and Fix Broken Features
  + Make sure Jest is installed globally by running `npm install -g jest`.
  + Run the current set of tests and examine all tests that are failing for users and listings.
  + Use the broken tests to determine which features are failing and why.
  + Modify the `users` and `listings` models and routes to get all tests passing
+ Stage 4 - Use TDD to Add a `createBookings` method to the `Booking` model
  + Make the following additions to the `models/booking.test.js` file:
    + First add a new `describe` grouping inside the `describe Booking` grouping. It should `describe` `Test createBooking`.
    + Inside the `Test createBooking` grouping, add two new test cases:
      + **Test** `Can create a new booking with valid params`
        + It should create a dummy user object containing only the `username` property equal to `jlo`
        + Then it should select one of the listing ids from the `testListingIds` array. Look at the values for that listing in the `tests/createListings.js` file.
        + It should then use the `Listing` model to fetch that listing.
        + Next, it should create a `newBooking` object with `startDate`, `endDate`, and `guests` properties
        + Then it should use the `createBooking` method on the `Booking` model to create a new booking using the `newBooking` object, listing, and user.
        + Finally, it should check that the booking returned by that method is equal to an expected booking, containing the properties: `id`, `startDate`, `endDate`, `paymentMethod`, `guests`, `listingId`, `username`, `userId`, and `createdAt`. Use exact values or `expect.any` matchers when necessary.
      + **Test** `Throws error with invalid params`
        + Start the test by expecting exactly one assertion
        + It should create a dummy user object containing only the `username` property equal to `jlo`
        + Then it should select one of the listing ids from the `testListingIds` array. Look at the values for that listing in the `tests/createListings.js` file.
        + It should then use the `Listing` model to fetch that listing.
        + Next, it should create a `newBooking` object with only an `endDate`.
        + Use a `try...catch...` block to call the `Booking.createBooking` method with the `newBooking`, `listing`, and `user`.
        + In the catch block, expect the error to be an instance of `BadRequestError`.
    + Run the tests and make sure they fail
    + Create the `newBooking` method on the `Booking` model.
      + It should accept `newBooking`, `listing`, and `user` as parameters - either separately or as properties on an object.
      + It should ensure that the `startDate` and `endDate` properties exist on the `newBooking` object, or it should throw a 400 error.
      + It should execute a query that does the following:
        + Inserts values in the `payments` table for the following columns:
        + `payment_method` - should either be `newBooking.paymentMethod` or default to `"card"` 
        + `start_date` - should come from `newBooking.startDate` and should be cast to a date
        + `end_date` - should come from `newBooking.end_date` and should be cast to a date
        + `guests` - should come from `newBooking.guests` or default to `1`. 
        + `total_cost` - this one is tricky. It should be a calculation wrapping in a `CEIL` function to round up. The calculation should:
          + Determine the number of days by subtracting the `start_date` cast to a date from the `end_date` cast to a date and adding `1`
          + Determine the price of one night by adding `10%` to the `listing.price` for "marketplace fees". This can be done by multipling `listing.price` by `1.1`
          + Multiply those two values together
          + Wrap the whole calculation in a `CEIL` function
        + `listing_id` should come from `listing.id`
        + `user_id` should use a subquery to the get the `id` of the user from `user.username`.
      + The query should use the `RETURNING` clause to return 
        + `id`
        + `start_date` aliased as `"startDate"`
        + `end_date` aliased as `"endDate"`
        + `guests`
        + `total_cost` aliased as `"totalCost"`
        + `user_id` aliased as `"userId"`
        + `username` of booking user
        + The username of the user who owns the listing. Use a nested subquery to access this value and alias it as `"hostUsername"`
        + `created_at` aliased as `"createdAt"`
      + Pass the correct bind parameters to the query.
      + Return the results of executing the query at the end of the method.
    + Get the tests to pass
    + Refactor where needed.
+ Stage 5 - Use TDD to Create a New Booking `POST` Endpoint
  + Make the following additions to the `routes/bookings.test.js` file:
    + Add a new `describe("POST bookings/listings/:listingId"` block:
    + Create two new test cases in it:
      + **Test**: `Authed user can book a listing they don't own.`
        + First, it should select one of the listing ids from the `testListingIds` array. Look at the values for that listing in the `tests/createListings.js` file. 
        + Create an object called `data` with a single `newBooking` property on it. Set that key equal to an object with the `startDate`, `endDate`, and `guests` properties on it.
        + Then it should make a `POST` request to the `/bookings/listings/:listingId` route. Make sure to set the authorization header on the post request using the `jloToken`. Send the `data` object in that post request.
        + Expect the response code to be `201`.
        + Finally, it should check that the booking returned by that method is equal to an expected booking, containing the properties: `id`, `startDate`, `endDate`, `paymentMethod`, `guests`, `listingId`, `username`, `userId`, and `createdAt`. Use exact values or `expect.any` matchers when necessary. 
      + **Test**: `Throws a Bad Request error when user attempts to book their own listing`
        + First, select the `listingId` with an index of `0` in the `testListingIds` array. This is owned by the user with the `lebronToken`. Look at the values for that listing in the `tests/createListings.js` file. 
        + Create an object called `data` with a single `newBooking` property on it. Set that key equal to an object with the `startDate`, `endDate`, and `guests` properties on it.
        + Then it should make a `POST` request to the `/bookings/listings/:listingId` route. Make sure to set the authorization header on the post request using the `lebronToken`. Send the `data` object in that post request.
        + Expect the response code to be 400.
    + Make sure both tests fail
  + Create a new route in the `routes/bookings.js` file:
    + It should be a `POST` request to the `"bookings/listings/:listingId/"` endpoint
    + It should request an authenticated user
    + It should have permissions that ensure the authenticated user does not own the listing that the booking is being made for
    + It should have an `async` router handler that executes a `try...catch` block.
    + It should extract the `user` and `listing` from `res.locals`.
    + It should extract the `newBooking` object from `req.body`
    + It should pass the `user`, `listing`, and `newBooking` to the `Booking.createBooking` method and create a new booking
    + It should return a `201` JSON response with the `booking`
    + Any error should be passed to the `next` function in the `catch` block
  + Get the tests to pass
  + Refactor

## Stretch Goals

+ Implement a new route and model method using a test-driven methodology.
  + The feature is the ability to list all bookings for a single listing
  + The model method should be called `listBookingsForListing`.
    + Write the following tests, using the existing ones as a guide:
      + `Fetches all of the bookings for a single listing`
        + Should check that all bookings are returned when a valid listing id is provided
      + `Returns empty array when listing has no bookings`
        + Should check that an empty array is returned when a valid listing id is provided that has no bookings 
    + The endpoint should be a `GET` request at the `/bookings/listings/:listingId` route.
      + Write the following tests, using the existing ones as a guide:
        + `Listing owner can fetch all bookings for a single listing`
          + Should check that the owner of a listing is able to fetch all bookings for that listing
        + `Authenticated user who is not listing owner receives 403 Forbidden Error`
          + Should check that a user who is NOT the owner of the listing receives a 403 Forbidden Error when attempting to hit the endpoint
        + `Unknown listing id throws a 404 error`
          + Should check that a 404 error is thrown when a `listingId` is provided that doesn't match a listing in the database
  + Implement the new route, making sure to use two middleware: 
    + One that checks for the existence of an authenticated user
    + One that ensures that the authenticated user is the owner of the listing
  + Implement the model method that takes in a `listingId` and fetches all bookings for that listing. Use the other queries as a guide.
  + Make sure all the tests are passing!
+ Modify the bookings model to only allow a single resident to book a listing for a given date range
  + Write tests to ensure that an error is thrown if a user tries to book a listin that already has a booking confirmed for any of the dates that the user submits.
+ Create a new set of permissions functions that provide admin access to users who are saved in the database as admin. 
  + They should have privileges that allow them to access/update/modify/create all resources.
  + Write a test suite in Jest to ensure that admin are provided all admin privileges throughout the application.
