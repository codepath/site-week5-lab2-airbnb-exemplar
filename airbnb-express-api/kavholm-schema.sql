CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  password    TEXT NOT NULL,
  username    TEXT NOT NULL UNIQUE,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE CHECK (POSITION('@' IN email) > 1),
  is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE listings (
  id          SERIAL PRIMARY KEY,
  location    TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  price       BIGINT NOT NULL,  
  image_url   TEXT NOT NULL,
  image_url2  TEXT,
  image_url3  TEXT,
  user_id     INTEGER NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
  id             SERIAL PRIMARY KEY,  
  payment_method TEXT NOT NULL,
  start_date     TIMESTAMP NOT NULL,
  end_date       TIMESTAMP NOT NULL,
  guests         INTEGER NOT NULL,
  total_cost     BIGINT NOT NULL,
  listing_id     INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

