# lazy-hn

`lazy-hn` is a Hacker News frontend that runs on Cloudflare Workers or as a Bun server in Docker.

## Local development

```bash
bun install
bun run start
bun run dev
```

`bun run start` runs the local Bun server on `http://localhost:3000`.
`bun run dev` starts Wrangler in development mode.

## Docker

```bash
docker build -t lazy-hn .
docker run --rm -p 3000:3000 lazy-hn
docker compose up --build
```

Environment variables:

- `PORT`: HTTP port inside the container. Defaults to `3000`.
- `HOST`: bind address. Defaults to `0.0.0.0`.
- `JOB_INTERVAL_MS`: how often background refresh jobs run. Defaults to `120000`.

Open [http://localhost:3000](http://localhost:3000).

## Deploy

```bash
bun run deploy
```
