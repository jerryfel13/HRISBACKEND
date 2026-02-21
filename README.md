# HRIS Backend

Node.js REST API for the Human Resources Information System, with **Swagger UI** as the REST API guide.

## Features (from process flow)

- **Holiday management** – Create, update, delete holidays
- **Employee profile** – Create, update, delete employee information
- **Schedule management** – Create, update, delete employee schedules
- **Clock in / clock out** – Record, update, delete, and upload time records
- **Leave and absence** – Leave requests, creditation of leave, update leave balance
- **Payroll processing** – Auto-computes salary from clock in/out, schedule, and leave
- **Rank & file** – Achievements, trainings, certifications, and evaluations (CRUD)

## Database (PostgreSQL + DBeaver)

The app uses **PostgreSQL**. You can create and manage the database with **DBeaver** (or any Postgres client).

1. **Create the database** (in DBeaver or psql):
   ```sql
   CREATE DATABASE hris;
   ```

2. **Run the schema** to create all tables: open `database/schema.sql` in DBeaver, connect to the `hris` database, and execute the script. It creates: `holidays`, `employees`, `schedules`, `clock_records`, `leave_requests`, `leave_balances`, `payroll_records`, `rank_files`.

3. **Configure the connection** by copying `.env.example` to `.env` and setting your Postgres credentials:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set at least:
   - `PGUSER` and `PGPASSWORD` (or use `DATABASE_URL=postgresql://user:password@localhost:5432/hris`).

## Quick start

```bash
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm start
```

- **Landing page:** [http://localhost:3000](http://localhost:3000) (company logo, welcome text, link to API docs)
- **API base:** `http://localhost:3000`
- **Swagger UI (REST API guide):** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **OpenAPI JSON:** `http://localhost:3000/api-docs.json`

Replace the default logo with your company logo by overwriting `public/logo.svg` (or add `public/logo.png` and set `src="/logo.png"` in `public/index.html`).

## API overview

| Resource        | Base path        | Main operations                          |
|----------------|------------------|------------------------------------------|
| Holidays       | `/holidays`      | GET, POST, PUT, DELETE                   |
| Employees      | `/employees`    | GET, POST, PUT, DELETE                   |
| Schedules      | `/schedules`     | GET, POST, PUT, DELETE                   |
| Time tracking  | `/time-tracking` | GET, POST clock-in/clock-out/upload, PUT, DELETE |
| Leave          | `/leave`         | Requests: GET, POST, PUT; Balance: GET, POST, PUT update |
| Payroll        | `/payroll`       | GET, POST `/payroll/process`             |
| Rank & file    | `/rank-file`     | GET, POST, PUT, DELETE                   |

Data is stored in PostgreSQL. Use Swagger UI to try all endpoints.
