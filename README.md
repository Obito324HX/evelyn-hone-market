# Evelyn Hone Market (EHM)

A full-stack campus marketplace for Evelyn Hone College students to buy and
sell items, built as a Flask REST API backed by PostgreSQL, with a React
frontend as the primary client.

**Live app:** https://evelyn-hone-market.vercel.app

---

## Overview

EHM lets verified students list products/services, message buyers and
sellers directly, rate sellers, and manage listings through an admin panel.
The defining design constraint of this project is that **not everyone can
sell** — anyone can register and browse, but creating a listing requires
going through a seller approval process. That gate, and how it's enforced,
is the part most worth understanding before touching the code.

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
- A separate Next.js client, built and maintained by a collaborator, that
  talks to the same backend (see [Dual-Frontend Architecture](#dual-frontend-architecture)
  below). It lives in its own repo, not this one.

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
     │  (this repo, Vercel) │               │  (collaborator's repo)  │
     └───────────────────────┘               └──────────────────────────┘
```

Same database, same business logic, two clients hitting the same Flask app
through two different URL prefixes.

---

## Seller Verification & Approval Workflow

This is the core trust mechanism of the marketplace: **a user cannot create
a listing until an admin has approved them as a seller.**

### How it works

1. **Registration** — Anyone can register with a username, email, password,
   and optional phone number. New users start with `seller_approved = false`
   and no `student_id` on file. They can browse, message, and rate — but not
   list.
2. **Apply to become a seller** — From their profile, a user submits their
   student ID (`POST /api/auth/submit-student-id`). This doesn't grant
   selling rights by itself — it just puts them in the queue.
3. **Pending state** — Once a student ID is on file but not yet approved,
   the UI shows a "⏳ Pending" status. The user still cannot create listings
   at this point — `CreateListing` checks `user.seller_approved` client-side,
   and the backend enforces the same check server-side regardless of what
   the client sends.
4. **Admin review** — An admin reviews pending applications in the Admin
   panel (`pending_sellers` in `/api/admin/stats` counts users with a
   `student_id` but `seller_approved = false`), and approves or rejects via
   `PUT /api/admin/users/<id>/approve-seller`, which toggles
   `seller_approved` on the user record.
5. **Approved** — Once `seller_approved` is `true`, the user can create
   listings. The check happens in `POST /api/listings/`:
   ```python
   if not seller.seller_approved:
       return jsonify({'message': 'You must be approved as a seller first'}), 403
   ```
   This is a hard server-side gate — it's not just a UI toggle. Even a
   crafted API request from an unapproved account will be rejected.

### States a user can be in

| `student_id` | `seller_approved` | Meaning                         |
|--------------|--------------------|----------------------------------|
| `None`       | `false`            | Never applied — buyer only       |
| Set          | `false`            | Applied, awaiting admin decision |
| Set          | `true`             | Approved seller — can list       |

### Known gap: the secondary frontend

The "Apply to become a seller" UI (student ID submission form) only exists
in **this** React frontend, inside `Profile.jsx` and `CreateListing.jsx`.
It was never built into the secondary Next.js frontend. The backend enforces
`seller_approved` identically for both clients, so this isn't a security
gap — but it is a usability one:

> Users signing up through the Next.js frontend have no way to submit a
> student ID and get into the approval queue at all. They can register and
> browse, but they'll never be able to list, because there's no UI path to
> apply. An admin could manually flip `seller_approved` for them via the
> database or `PUT /api/admin/users/<id>/approve-seller`, but there is no
> self-serve application flow on that client.

Fixing this means porting the student ID submission flow (or building an
equivalent) into the Next.js frontend — not a backend change.

---

## Authentication

JWT-based, via Flask-JWT-Extended.

- `POST /api/auth/register` and `POST /api/auth/login` return a `token`
  and a `user` object.
- The token is sent as `Authorization: Bearer <token>` on protected routes.
- Admin routes (`/api/admin/*`) require a valid JWT **and** `is_admin=true`
  on that user's database record — checked server-side on every request via
  the `require_admin` decorator. There is no separate admin key or secret
  header; admin status lives only on the account itself.

> Note: `backend/API_DOCUMENTATION.md` currently describes an older
> `X-Admin-Key` header scheme. That was replaced with the JWT + `is_admin`
> check described above (the old static key was shipped in frontend code
> and visible to anyone). The API doc still needs updating to match.

---

## Dual-Frontend Architecture

`app.py` registers each blueprint twice: once under `/api/<resource>` for
this repo's React frontend, and once with no prefix (`/<resource>`) for the
Next.js frontend, which expects routes without the `/api` segment. Both
sets of routes run the exact same view functions — it's routing only, not
duplicated logic.

```python
# Existing prefix - used by our own frontend
app.register_blueprint(auth, url_prefix='/api/auth')
...
# No-prefix aliases - used by the second frontend
app.register_blueprint(auth, url_prefix='/auth', name='auth_noprefix')
```

Only `auth`, `listings`, and `users` currently have no-prefix aliases —
messages, ratings, admin, reports, notifications, and categories are only
reachable via `/api/*`.

---

## Project Structure

```
backend/
├── app.py                  # App factory, blueprint registration, config
├── models.py                # SQLAlchemy models: User, Listing, Message,
│                             # Rating, Category, Report, Notification
├── routes/
│   ├── auth.py               # register, login, submit-student-id
│   ├── listings.py           # CRUD + seller_approved gate on create
│   ├── admin.py               # stats, user management, seller approval
│   ├── users.py, messages.py, ratings.py, reports.py,
│   │   notifications.py, categories.py
├── make_admin.py             # one-off script to promote a user to admin
├── migrate_add_is_admin.py   # migration for the is_admin column
├── API_DOCUMENTATION.md      # endpoint reference (see note above re: auth)
└── requirements.txt

frontend/
├── src/
│   ├── pages/                # Profile, CreateListing, Admin, etc.
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
| `DATABASE_URL`     | No       | Defaults to local SQLite. Set to your Neon Postgres URL in prod.   |
| `SECRET_KEY`       | Recommended | Flask secret key.                                               |
| `JWT_SECRET_KEY`   | **Yes, in production** | Falls back to a public default value if unset — the app prints a startup warning, because anyone who's seen this repo's source can forge tokens for any user (including admins) if the fallback is left in place. |

```bash
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Point the frontend's API base URL at your local backend (`http://localhost:5000`)
or the deployed Railway URL, depending on your `.env` setup.

### Making yourself an admin

Use `backend/make_admin.py` against your database to flip `is_admin` on
your own account — there's no signup flow for admins by design.

---

## API Reference

Full endpoint list, request/response shapes, and error codes are in
[`backend/API_DOCUMENTATION.md`](backend/API_DOCUMENTATION.md). Treat the
auth section of that file as outdated until it's updated to reflect JWT +
`is_admin` (see [Authentication](#authentication) above).

---

## Known Issues

- The Next.js frontend has no "apply to become a seller" UI (see above).
- Only `auth`, `listings`, and `users` have no-prefix route aliases for the
  second frontend; expand as needed if it grows to use more endpoints.
- `seller_approved` is enforced on listing **creation** only, not on
  updates — a seller who is later revoked can still edit listings they
  made while approved.

### Recently fixed
- `messages`, `ratings`, `reports`, and `submit-student-id` previously took
  the acting user's ID directly from the request body, so a caller could
  send a message, leave a rating, file a report, or apply for seller status
  "as" any user ID. All four now require a JWT and derive the identity from
  the token instead. Corresponding frontend calls were updated to send
  `Authorization: Bearer <token>` via the existing `getAuthHeaders()` helper.
- Admin auth (`API_DOCUMENTATION.md`) was updated to describe the real
  JWT + `is_admin` scheme instead of the retired `X-Admin-Key` header.
