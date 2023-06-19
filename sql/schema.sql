CREATE TABLE cities (
    city TEXT NOT NULL,
    city_ascii TEXT,
    lat FLOAT,
    lng FLOAT,
    country TEXT,
    iso2 TEXT,
    iso3 TEXT,
    admin_name TEXT,
    capital TEXT,
    population TEXT,
    id INTEGER PRIMARY KEY
);

COPY cities
FROM 'D:\Projects\Springboard\worldcities.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    address TEXT,
    city_id INTEGER REFERENCES cities ON DELETE SET NULL,
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    max_members INTEGER
);

CREATE TABLE users (
    username VARCHAR(25) PRIMARY KEY,
    password TEXT NOT NULL,
    bio TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    trivia_score INTEGER
);

CREATE TABLE groupsusers (
    group_id INTEGER REFERENCES groups ON DELETE CASCADE,
    username VARCHAR(25) REFERENCES users ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (group_id, username),
    is_owner BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE games (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    cover_url TEXT
);

CREATE TABLE favoritegames (
    username VARCHAR(25) REFERENCES users ON DELETE CASCADE ON UPDATE CASCADE,
    game_id INTEGER REFERENCES games ON DELETE CASCADE,
    PRIMARY KEY (username, game_id)
);

CREATE TABLE groupsgames (
    group_id INTEGER REFERENCES groups ON DELETE CASCADE,
    game_id INTEGER REFERENCES games ON DELETE CASCADE,
    PRIMARY KEY (group_id, game_id)
);

