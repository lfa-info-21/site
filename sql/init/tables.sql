CREATE TABLE IF NOT EXISTS utilisateur
(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    username VARCHAR(100),
    email VARCHAR(255),
    pwd VARCHAR(64),
    perm INT,
    unique(username)
);