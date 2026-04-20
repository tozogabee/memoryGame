# Memory Game

A full-stack browser-based card memory game. Flip cards to find matching emoji pairs, earn points, beat the clock, and compete on the global leaderboard.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | TypeScript, HTML, CSS, lite-server              |
| Backend   | Node.js, Express, TypeScript                    |
| Database  | PostgreSQL 16                                   |
| Migrations| Liquibase                                       |
| Auth      | JWT stored in HttpOnly cookies                  |
| API Docs  | OpenAPI 3.0 + Swagger UI                        |
| Container | Docker, Docker Compose                          |

---

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose

That's it — everything else runs inside containers.

---

## Configuration

Copy the example below to a `.env` file in the project root and fill in your values:

```env
# PostgreSQL
DB_HOST=postgres
DB_PORT=5432
DB_USER=memorygame
DB_PASSWORD=memorygame
DB_NAME=memorygame

# JWT — change this to a long random string in production
JWT_SECRET=change-me-in-production

# Frontend URL (used in email verification links)
FRONTEND_URL=http://localhost:3000

# Backend API URL (used by the frontend)
API_URL=http://localhost:4000
```

### Gmail App Password

1. Go to [myaccount.google.com](https://myaccount.google.com) → Security → 2-Step Verification → App passwords
2. Generate a password for "Mail"
3. Paste the 16-character password into `SMTP_PASS`

---

## Run with Docker

```bash
docker compose up --build
```

| Service  | URL                                         |
|----------|---------------------------------------------|
| Game     | http://localhost:3000                       |
| API docs | http://localhost:4000/api/docs              |
| Backend  | http://localhost:4000                       |

To stop all services:

```bash
docker compose down
```

To also delete the database volume:

```bash
docker compose down -v
```

---

## How to Play

### 1. Register
- Open http://localhost:3000
- Click the **Register** tab
- Enter a username, email address, and password (min 6 characters)
- Click **Register** — you can log in immediately

### 2. Login
- Enter your username and password
- Click **Login** — you are taken to the game board

### 3. The Game
- The board shows **16 face-down cards** arranged in a 4×4 grid
- **Click a card** to flip it and reveal an emoji
- **Click a second card** to find its pair
  - **Match** — both cards stay face up and you earn **+10 points**
  - **No match** — both cards flip back over after 1 second
- The **timer starts immediately** when the game loads
- Find all **8 pairs** to win
- Your score and time are **automatically saved** to the leaderboard when you win

### 4. Scoring
| Action        | Points |
|---------------|--------|
| Matched pair  | +10    |
| Maximum score | 80     |

### 5. Restart
- Click the **Restart** button at any time to reset the board, score, and timer

### 6. Inactivity Logout
- If you are inactive for **1 minute** (no mouse, keyboard, or touch input), you are automatically logged out for security

### 7. Ranking
- Click **Ranking** on the login screen or the game screen to view the global leaderboard
- The leaderboard shows the **top 50 scores** across all players, sorted by score (highest first), then by fastest time

### 8. Logout
- Click **Logout** in the top bar to end your session

---

## Project Structure

```
memoryGame/
├── .env                          # Environment variables (not committed)
├── docker-compose.yml
├── README.md
│
├── frontend/
│   ├── Dockerfile
│   ├── entrypoint.sh             # Generates env.js from API_URL at container start
│   ├── tsconfig.json
│   ├── bs-config.json            # lite-server config (port 3000)
│   └── src/
│       ├── index.html            # Redirects to login.html
│       ├── login.html            # Login / Register / Ranking tabs
│       ├── game.html             # Game board
│       ├── ranking.html          # Full ranking page
│       ├── verify.html           # Email verification landing page
│       ├── css/
│       │   ├── style.css         # Game styles
│       │   ├── login.css         # Auth page styles
│       │   └── ranking.css       # Ranking page styles
│       └── main/
│           ├── config.ts         # Reads API_URL from window (set by env.js)
│           ├── auth-redirect.ts  # Redirects logged-in users away from login page
│           ├── login.ts          # Login / register / ranking tab logic
│           ├── game-auth.ts      # Auth guard + inactivity logout
│           ├── main.ts           # Game logic (flip, match, score, timer)
│           └── ranking.ts        # Ranking page data loading
│
└── backend/
    ├── Dockerfile                # Includes Liquibase + Java for migrations
    ├── entrypoint.sh             # Runs Liquibase migrations then starts the server
    ├── openapi.yml               # OpenAPI 3.0 specification
    ├── tsconfig.json
    ├── liquibase/
    │   └── changelog/
    │       ├── db.changelog-master.yaml
    │       └── changes/
    │           ├── 001-create-users-table.yaml
    │           ├── 002-create-scores-table.yaml
    │           └── sql/
    │               ├── 001-create-users-table.sql
    │               └── 002-create-scores-table.sql
    └── src/
        ├── index.ts              # Express app, CORS, Swagger UI, routes
        ├── db.ts                 # PostgreSQL connection pool
        ├── logger.ts             # Winston logger factory (SLF4J-style)
        ├── email.ts              # Nodemailer (Gmail SMTP)
        ├── swagger.ts            # Loads openapi.yml for Swagger UI
        ├── middleware/
        │   └── auth.ts           # requireAuth middleware (reads JWT from cookie)
        └── routes/
            ├── auth.ts           # /api/auth/* endpoints
            └── scores.ts         # /api/scores/* endpoints
```

---

## API Endpoints

Full interactive documentation is available at **http://localhost:4000/api/docs**

| Method | Path                    | Auth     | Description                        |
|--------|-------------------------|----------|------------------------------------|
| POST   | /api/auth/register      | No       | Register a new user                |
| POST   | /api/auth/login         | No       | Login, sets HttpOnly cookie        |
| GET    | /api/auth/me            | Cookie   | Get current authenticated user     |
| POST   | /api/auth/logout        | No       | Logout, clears cookie              |
| GET    | /api/auth/verify/:token | No       | Verify email address               |
| POST   | /api/scores             | Cookie   | Save a completed game score        |
| GET    | /api/scores/me          | Cookie   | Get your last 20 scores            |
| GET    | /api/scores/ranking     | No       | Get top 50 scores (public)         |
| GET    | /health                 | No       | Health check                       |

---

## Security

- Passwords are hashed with **bcrypt** (10 rounds)
- Sessions use **JWT stored in HttpOnly cookies** — not accessible from JavaScript, preventing XSS token theft
- Cookies use `SameSite=Strict` to prevent CSRF
- `Secure` flag is enabled automatically in production (`NODE_ENV=production`)
- Inactive sessions are terminated client-side after **1 minute** of no activity
- JWT tokens expire after **24 hours**