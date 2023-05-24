DROP DATABASE groupfinder;
CREATE DATABASE groupfinder;

\connect groupfinder;

\i schema.sql

DROP DATABASE groupfinder_test;
CREATE DATABASE groupfinder_test;

\connect groupfinder_test;

\i schema.sql