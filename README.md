# Vinken Solutions Limited

Company website and Express/MySQL API for Vinken Solutions Limited.

## Requirements

- Node.js 20 or later
- MySQL 8 or a compatible MySQL server

## Local setup

1. Install dependencies with `npm ci`.
2. Create a local `.env` file from `.env.example` and set the database credentials and a unique `ADMIN_API_KEY`.
3. Create the database and tables by running `database/schema.sql` in MySQL.
4. Start the site with `npm start` (or `npm run dev` during development).
5. Open `http://localhost:5000`.

The Express server serves the website and API from the same origin. This keeps
the browser API URL deployment-independent. `/api/health` checks the server;
`/api/db-test` checks the MySQL connection.

## Production deployment

1. Provision a MySQL database and a dedicated application user with only the
   permissions required by the schema and application.
2. Apply `database/schema.sql` to the production database.
3. Configure the environment variables from `.env.example` in the hosting
   provider's secret manager. Do not commit `.env` or place secrets in frontend
   files. Generate `ADMIN_API_KEY` with the command in `.env.example`.
4. Deploy the repository, install dependencies with `npm ci`, and run
   `npm start` using a Node.js 20+ runtime.
5. Configure the hosting provider or reverse proxy to terminate HTTPS and
   forward traffic to the configured `PORT`. Keep MySQL private to the
   application where possible.
6. Verify `/api/health`, `/api/db-test`, the homepage, and both public inquiry
   forms after deployment.

Set `CORS_ORIGINS` only when a separately hosted frontend needs browser access
to this API, and list exact trusted origins separated by commas. It is not
needed when the site and API are served together.

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
