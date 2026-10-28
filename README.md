# Vinken Solutions Limited

Company website and Express/MySQL API for Vinken Solutions Limited.

## Requirements

- Node.js 20 or later
- PostgreSQL 14+ or a compatible PostgreSQL server

## Local setup

1. Install dependencies with `npm ci`.
2. Create a local `.env` file from `.env.example` and set the database credentials and a unique `ADMIN_API_KEY`.
3. Create the database and tables by running `database/schema.sql` in PostgreSQL.
4. Start the site with `npm start` (or `npm run dev` during development).
5. Open `http://localhost:5000` for the company website or
   `http://localhost:5000/admin.html` for the administrator dashboard.

The Express server serves the website and API from the same origin. This keeps
the browser API URL deployment-independent. `/api/health` checks the server;
`/api/db-test` checks the PostgreSQL connection.

## Production deployment

1. Provision a PostgreSQL database and a dedicated application user with only the
   permissions required by the schema and application.
2. Apply `database/schema.sql` to the production database.
3. Configure the environment variables from `.env.example` in the hosting
   provider's secret manager. Do not commit `.env` or place secrets in frontend
   files. Generate `ADMIN_API_KEY` with the command in `.env.example`.
4. Deploy the repository, install dependencies with `npm ci`, and run
   `npm start` using a Node.js 20+ runtime.
5. Configure the hosting provider or reverse proxy to terminate HTTPS and
   forward traffic to the configured `PORT`. Keep PostgreSQL private to the
   application where possible.
6. Verify `/api/health`, `/api/db-test`, the homepage, and both public inquiry
   forms after deployment.

Set `CORS_ORIGINS` only when a separately hosted frontend needs browser access
to this API, and list exact trusted origins separated by commas. It is not
needed when the site and API are served together.

The administrator dashboard uses the configured `ADMIN_API_KEY` to access
protected endpoints. The key is retained only in the current browser session
and is cleared when you sign out.

Open the dashboard through the Express server at `/admin.html`; do not open
the HTML file directly or serve it with a static preview server, because the
dashboard's `/api` requests must reach the Express API on the same origin.

## API access

Product and service listings, inquiry submissions, and quotation submissions
are public website features. Administrative endpoints (creating or deleting
products/services, reading submitted customer inquiries/quotations, and
changing quotation statuses) require the `x-admin-api-key` header or a Bearer
token containing the configured `ADMIN_API_KEY`.

The tender form does not store uploaded documents. Send tender/LPO files to
`info@vinkensolutions.co.ke` and include the request reference.

## Before launch

- Replace the sample product/service catalogue with the company's approved
  current offerings in the database.
- Confirm the displayed telephone number, email address, operating hours and
  service coverage with the company.
- Add the production domain to DNS and enable HTTPS at the hosting provider.
