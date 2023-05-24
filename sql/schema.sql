CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location TEXT
);

CREATE TABLE users (
    username VARCHAR(25) PRIMARY KEY,
    password TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    trivia_score INTEGER
);

CREATE TABLE groupsusers (
    group_id INTEGER REFERENCES groups ON DELETE CASCADE,
    username VARCHAR(25) REFERENCES users ON DELETE CASCADE,
    PRIMARY KEY (group_id, username),
    is_owner BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE games (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    cover_url TEXT
);

CREATE TABLE favoritegames (
    username VARCHAR(25) REFERENCES users ON DELETE CASCADE,
    game_id INTEGER REFERENCES games ON DELETE CASCADE,
    PRIMARY KEY (username, game_id)
);

CREATE TABLE groupsgames (
    group_id INTEGER REFERENCES groups ON DELETE CASCADE,
    game_id INTEGER REFERENCES games ON DELETE CASCADE,
    PRIMARY KEY (group_id, game_id)
);