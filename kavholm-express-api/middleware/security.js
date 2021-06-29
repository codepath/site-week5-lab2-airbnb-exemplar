const jwt = require("jsonwebtoken")
const { SECRET_KEY } = require("../config")
const { UnauthorizedError } = require("../utils/errors")

const jwtFrom = ({ headers }) => {
  if (headers?.authorization) {
    const [scheme, token] = headers.authorization.split(" ")
    if (scheme.trim() === "Bearer") {
      return token
    }
  }

  return undefined
}

/**
 * If the request contains a JWT token in the Authorization header,
 * extract that token, convert the credentials into a user, and attach
 * it to the response's locals property.
 */
const extractUserFromJwt = (req, res, next) => {
  try {
    const token = jwtFrom(req)
    if (token) {
      res.locals.user = jwt.verify(token, SECRET_KEY)
    }

    return next()
  } catch (err) {
    console.log(err)
    return next()
  }
}

const requireAuthenticatedUser = (req, res, next) => {
  try {
    const { user } = res.locals
    if (!user?.username) throw new UnauthorizedError()
    return next()
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  jwtFrom,
  extractUserFromJwt,
  requireAuthenticatedUser,
}
