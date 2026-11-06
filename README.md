# Social Publisher

## Run locally

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Run `npm run build` to create the production site in `dist`.

Drafts, images, and videos are saved in this browser using IndexedDB. Clearing browser data removes them.

## Deploy

In repository **Settings → Pages**, choose **GitHub Actions** as the source. Push to `main` to build and deploy using `.github/workflows/deploy.yml`.

The production base path is `/SocialMediaManager/`. Update `repositoryName` in `vite.config.ts` if you rename the repository.
