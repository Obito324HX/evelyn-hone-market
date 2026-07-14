# Evelyn Hone Market (EHM)

A full-stack campus marketplace for Evelyn Hone College students to buy and
sell items, built as a Flask REST API backed by PostgreSQL, with a React
frontend as the primary client.

**Live app:** https://evelyn-hone-market.vercel.app

---

## Overview

EHM lets verified students list products and services, message buyers and
sellers directly, rate sellers, and manage listings through an admin panel.
Not every registered user can sell — creating a listing requires going
through a seller approval process first.

---

## Tech Stack

**Backend**
- Flask 3 (Python), organized as blueprints per resource
- PostgreSQL via SQLAlchemy (Neon in production, SQLite fallback for local dev)
- Flask-JWT-Extended for authentication
- Deployed on Railway

**Frontend (primary)**
- React 19 + Vite
- React Router
- Axios
- Deployed on Vercel

**Secondary frontend**
- A separate Next.js client, maintained in its own repo, that talks to the
  same backend (see [Dual-Frontend Architecture](#dual-frontend-architecture)).

---

## Architecture

```
                        ┌──────────────────────┐
                        │   Flask API (Railway) │
                        │   PostgreSQL (Neon)    │
                        └───────────┬────────────┘
                                    │
                ┌───────────────────┴───────────────────┐
                │                                        │
      /api/* routes                              no-prefix routes
    (auth, listings, users, ...)             (auth, listings, users)
                │                                        │
     ┌──────────▼───────────┐               ┌────────────▼────────────┐
     │  React/Vite frontend │               │   Next.js frontend      │
     │  (this repo, Vercel) │               │  (separate repo)        │
     └───────────────────────┘               └──────────────────────────┘
```

Same database, same business logic, two clients hitting the same Flask app
through two different URL prefixes.

---

## Seller Verification & Approval Workflow

A user cannot create a listing until an admin has approved them as a
seller.

### How it works

1. **Registration** — Anyone can register with a username, email, password,
   and optional phone number. New users start with `seller_approved = false`
   and no `student_id` on file. They can browse, message, and rate — but not
   list.
2. **Apply to become a seller** — From their profile, a user submits a
   student ID (`POST /api/auth/submit-student-id`). This doesn't grant
   selling rights by itself; it places the user in the approval queue.
3. **Pending state** — Once a student ID is on file but not yet approved,
   the UI shows a "Pending" status. Listing creation stays blocked — the
   frontend checks `user.seller_approved`, and the backend enforces the
   same check independently.
4. **Admin review** — Admins review pending applications in the Admin
   panel (`pending_sellers` in `/api/admin/stats` counts users with a
   `student_id` but `seller_approved = false`) and approve or reject via
   `PUT /api/admin/users/<id>/approve-seller`, which toggles
   `seller_approved` on the user record.
5. **Approved** — Once `seller_approved` is `true`, the user can create
   listings. The gate lives in `POST /api/listings/`:
   ```python
   if not seller.seller_approved:
       return jsonify({'message': 'You must be approved as a seller first'}), 403
   ```
   This is enforced server-side regardless of what the client sends.

### States a user can be in

| `student_id` | `seller_approved` | Meaning                         |
|--------------|--------------------|----------------------------------|
| `None`       | `false`            | Never applied — buyer only       |
| Set          | `false`            | Applied, awaiting admin decision |
| Set          | `true`             | Approved seller — can list       |

### Checking a user's seller status

`student_id` and `seller_approved` are only returned in the `user` object
from `POST /api/auth/register` and `POST /api/auth/login` — there is
currently no endpoint to re-fetch them afterward. `GET /api/users/<id>` is
the general-purpose profile lookup, but it intentionally excludes these
fields (see [API Reference](backend/API_DOCUMENTATION.md)).

The React frontend works around this by storing the full `user` object in
`localStorage` at login and updating it locally whenever the state changes
(e.g. after `submit-student-id`), rather than re-querying the backend. Any
other client implementing this flow — including the Next.js frontend —
needs to do the same, or a status check on page reload / a fresh session
has nowhere to ask the backend. Adding a `GET /api/auth/me` (or similar)
endpoint that returns the current JWT holder's full profile would remove
the need for this workaround.

### Secondary frontend limitation

The seller application UI (student ID submission form) exists only in the
primary React frontend, inside `Profile.jsx` and `CreateListing.jsx`. It is
not present in the secondary Next.js frontend. The backend enforces
`seller_approved` identically for both clients, so this is a usability gap
rather than a security one: users on the Next.js frontend can register and
browse but have no self-serve path into the approval queue. An admin can
grant `seller_approved` manually via `PUT /api/admin/users/<id>/approve-seller`,
but the application step itself needs to be built into that client.

---

## Authentication

JWT-based, via Flask-JWT-Extended.

- `POST /api/auth/register` and `POST /api/auth/login` return a `token`
  and a `user` object.
- The token is sent as `Authorization: Bearer <token>` on protected routes.
- Admin routes (`/api/admin/*`) require a valid JWT and `is_admin = true`
  on the corresponding user record, checked server-side on every request
  via the `require_admin` decorator. Admin status lives only on the
  account itself — there is no separate admin key or header.

---

## Dual-Frontend Architecture

`app.py` registers each blueprint twice: once under `/api/<resource>` for
the React frontend, and once with no prefix (`/<resource>`) for the Next.js
frontend, which expects routes without the `/api` segment. Both route sets
call the same view functions — it's routing only, not duplicated logic.

```python
# Existing prefix - used by the React frontend
app.register_blueprint(auth, url_prefix='/api/auth')
...
# No-prefix aliases - used by the Next.js frontend
app.register_blueprint(auth, url_prefix='/auth', name='auth_noprefix')
```

Only `auth`, `listings`, and `users` currently have no-prefix aliases;
messages, ratings, admin, reports, notifications, and categories are
reachable only via `/api/*`.

---

## Project Structure

```
backend/
├── app.py                    # App factory, blueprint registration, config
├── models.py                 # SQLAlchemy models: User, Listing, Message,
│                              # Rating, Category, Report, Notification
├── routes/
│   ├── auth.py                # register, login, submit-student-id
│   ├── listings.py            # CRUD + seller_approved gate on create
│   ├── admin.py                # stats, user management, seller approval
│   ├── users.py, messages.py, ratings.py, reports.py,
│   │   notifications.py, categories.py
├── make_admin.py              # promotes a user to admin
├── migrate_add_is_admin.py    # migration for the is_admin column
├── API_DOCUMENTATION.md       # full endpoint reference
└── requirements.txt

frontend/
├── src/
│   ├── pages/                 # Profile, CreateListing, Admin, etc.
│   └── ...
├── vercel.json
└── package.json
```

---

## Getting Started

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

Environment variables:

| Variable         | Required | Notes                                                              |
|-------------------|----------|---------------------------------------------------------------------|
| `DATABASE_URL`     | No       | Defaults to local SQLite. Set to the Neon Postgres URL in production. |
| `SECRET_KEY`       | Recommended | Flask secret key.                                               |
| `JWT_SECRET_KEY`   | Required in production | Falls back to a public default value if unset (the app prints a startup warning) — leaving the fallback in place lets anyone who has seen the source forge tokens for any user, including admins. |

```bash
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set the frontend's API base URL to the local backend
(`http://localhost:5000`) or the deployed Railway URL via `.env`.

### Creating an admin account

`backend/make_admin.py` promotes a user to admin by flipping `is_admin` on
their record — there is no signup flow for admins by design.

---

## API Reference

Full endpoint list, request/response shapes, and error codes are in
[`backend/API_DOCUMENTATION.md`](backend/API_DOCUMENTATION.md).

---

## Known Issues

- The Next.js frontend has no "apply to become a seller" UI (see
  [Seller Verification & Approval Workflow](#seller-verification--approval-workflow)).
- Only `auth`, `listings`, and `users` have no-prefix route aliases for the
  Next.js frontend; extend as needed if it grows to use more endpoints.
- `seller_approved` is enforced on listing creation only, not on updates —
  a seller who is later revoked can still edit listings created while
  approved.
