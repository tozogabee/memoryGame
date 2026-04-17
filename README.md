# Memory Game

A browser-based card memory game built with TypeScript. Find all matching pairs to win!

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+) — for local development
- [Docker](https://www.docker.com/) — for running in a container

---

## Run locally

```bash
npm install
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> If port 3000 is in use, free it first:
> ```bash
> lsof -ti :3000 | xargs kill -9
> ```

---

## Run with Docker

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To stop the container:

```bash
docker compose down
```

---

## How to play

1. Click any card to flip it and reveal the emoji.
2. Click a second card to find its pair.
3. If the two cards match, they stay face up and you earn **10 points**.
4. If they don't match, both cards flip back over.
5. The timer starts on your first click and stops when all pairs are found.
6. Find all 8 pairs to win!

---

## Project structure

```
memoryGame/
├── src/
│   ├── index.html        # Game UI
│   ├── css/
│   │   └── style.css     # Styles
│   └── main/
│       └── main.ts       # Game logic
├── Dockerfile
├── docker-compose.yml
├── bs-config.json        # lite-server config (port 3000)
├── tsconfig.json
└── package.json
```