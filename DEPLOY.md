# Deploy

This project is a Vite static frontend. It does not have a Node server entry like `src/server.js`.

## Vercel

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Add environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

`vercel.json` is included to make React Router routes rewrite to `index.html`.

## Render

Create a `Static Site`, not a Web Service.

- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Add environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

`render.yaml` is included to configure static hosting and route rewrites.

## Notes

- The `npm warn deprecated rimraf@3.0.2` message on Vercel is a warning, not the actual build failure.
- If a platform says it cannot find `/src/server.js`, it is using the wrong service type or wrong start command.
