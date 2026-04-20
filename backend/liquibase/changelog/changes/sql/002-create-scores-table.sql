CREATE TABLE IF NOT EXISTS scores
(
    id               SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score            INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL,
    created_at       TIMESTAMP DEFAULT NOW()
);