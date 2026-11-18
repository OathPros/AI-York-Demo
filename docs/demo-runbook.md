# AI @ York milestone 1 demo

## Local setup

1. Run `npm install`.
2. Run `npm run db:migrate` and `npm run db:seed`.
3. In separate terminals run `npm run dev:api` and `npm run dev:web`.
4. Open `http://localhost:5173`.

The local Worker uses D1 through Wrangler. `VITE_API_BASE_URL` can point the Pages build at a deployed Worker; `BASE_PATH` should be the repository path for GitHub Pages.

## Two-browser journey

1. In browser A choose **Suggest a Change**, then **External User**. Submit a fictional event.
2. Choose **Switch demo role**, then **AI @ York Admin**, and refresh the Requests inbox.
3. Publish the request.
4. In Studio choose **Copy visitor link**. Open that link in browser B. The link redeems a scoped visitor session for the same workspace; it grants public reads and external suggestions, not Studio access.
5. In browser B choose **Suggest a Change**, submit a fictional event, then return to browser A and refresh the inbox.
6. Publish from browser A, then refresh the calendar in browser B. Published events are fetched from D1; drafts and declined requests are excluded.

This is a credential-free demonstration. Do not enter real personal information.
