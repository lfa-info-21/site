CREATE TABLE IF NOT EXISTS permlinker (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    userid INTEGER,
    groupid INTEGER,
    FOREIGN KEY(userid) REFERENCES user(id),
    FOREIGN KEY(groupid) REFERENCES permgroup(id)
);