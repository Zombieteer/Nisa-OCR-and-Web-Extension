CREATE DATABASE nisa_doclock;

CREATE TABLE users(
    ID SERIAL PRIMARY KEY,
    NAME VARCHAR(255),
    IS_SUBSCRIBED INT DEFAULT 0 REFERENCES files (IS_SUBSCRIBED),
    EMAIL VARCHAR(255) UNIQUE NOT NULL,
    ROLE VARCHAR(20) DEFAULT 'user' NOT NULL,
    TOTAL_FILES INT DEFAULT 0,    
    CREATED_ON VARCHAR(50),
    UPDATED_ON VARCHAR(50)
)

CREATE TABLE files(
    FILESIZE_LIMIT INT DEFAULT 1024,
    FILE_LIMIT INT DEFAULT 10,
    IS_SUBSCRIBED INT DEFAULT 0 PRIMARY KEY,
)
