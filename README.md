# Smart Campus GRIET

Smart Campus routes campus issue reports to the appropriate department, preserves their history, and lets students, staff, and administration track progress. The existing Next.js UI is retained.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The server creates a SQLite database at `./data/smart-campus.sqlite` by default. SQLite tables start without demo issue, student, or staff records. Departments and the default category mappings are configuration rows, not sample reports.

## Access

- Student: `/student/access`; name, class/section, and roll number identify an existing student or create one. The unique identity is normalized class/section plus roll number.
- Staff: `/staff/access`; only Staff IDs present in the `staff` table are accepted.
- Administration: `/admin/login`; one central account is configured with `ADMIN_EMAIL` and a bcrypt `ADMIN_PASSWORD_HASH`.

Set a strong `SESSION_SECRET` in production. Do not use `NEXT_PUBLIC_` variables for credentials. Create an admin password hash without putting the password in source:

```bash
ADMIN_PASSWORD='your-password' node -e "console.log(require('bcryptjs').hashSync(process.env.ADMIN_PASSWORD, 12))"
```

Copy the resulting hash into the server-only environment setting `ADMIN_PASSWORD_HASH`, then restart the server. No admin credential is committed or preconfigured.

Staff records are not invented or pre-seeded. After real IDs and names are available, configure staff rows in SQLite with the department foreign key, or use the optional one-record bootstrap variables documented in `.env.example`.

## Persistence and Deployment

The server-side API is the source of truth for students, issues, history, notifications, departments, staff, mappings, and admin configuration. Sessions use signed HTTP-only cookies. Student reports, status transitions, history, and notifications are written transactionally to SQLite.

SQLite is appropriate for a single persistent Node.js host. Set `DATA_DIR` to a durable mounted volume in deployment; an ephemeral/serverless filesystem will not preserve data across instance replacement. For multi-instance deployment, migrate the server data module to managed PostgreSQL before scaling out.

## Issue Workflow

Students describe an issue, select one of First Block through Fourth Block, choose Ground through 4th Floor, review AI classification, confirm, then submit. Submission creates a ticket number, reported history entry, and student notification. Staff see reports routed to their department or explicitly assigned to them; accepted, in-progress, and completed transitions are validated server-side and recorded in history. Recurring patterns are calculated from reports in the prior 30 days and require at least two reports at the same category and exact location.

The AI endpoint uses Gemini when `GEMINI_API_KEY` is configured and `MOCK_AI` is not `true`; otherwise it uses deterministic local rules. The database mapping saved in Administration Settings controls final routing for new reports.

## Validation

```bash
npm run build
npm run dev
```
