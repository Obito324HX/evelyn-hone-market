# Evelyn Hone Market — Backend API Documentation

**Base URL:** `https://evelyn-hone-market-production.up.railway.app`  
**All requests and responses use JSON.**  
**Authentication is JWT-based (Flask-JWT-Extended).** `POST /api/auth/register`
and `POST /api/auth/login` return a `token`. Send it on protected routes as:
`Authorization: Bearer <token>`  
**Admin endpoints require a valid JWT belonging to a user with `is_admin = true`
in the database.** There is no separate admin key or header — admin status
lives only on the account itself, checked server-side on every request via a
`require_admin` decorator. (This replaces an older static `X-Admin-Key`
header scheme, which was removed because the key was shipped in frontend
code and visible to any visitor.)

**Route prefixes:** Most resources are available under both `/api/<resource>`
(used by this repo's React frontend) and, for `auth`, `listings`, and `users`
only, a no-prefix `/<resource>` alias (used by the secondary Next.js
frontend). Both prefixes hit identical view logic — the paths below are
written with `/api/...` but drop the `/api` for the aliased resources if
you're calling from the other client.

---

## 1. Authentication `/api/auth`

### Register
`POST /api/auth/register`

Body:
```json
{ "name": "string (3-30 chars, letters/numbers/underscore)", "email": "string", "password": "string (6+ chars)", "phone": "string (optional)" }
```
Response `201`:
```json
{
  "token": "jwt",
  "user": { "id": 1, "name": "...", "email": "...", "phone": "...", "verified": false, "seller_approved": false, "student_id": null, "is_admin": false }
}
```
Errors `400`: missing/invalid fields, duplicate email, duplicate username.

### Login
`POST /api/auth/login`

Body: `{ "email": "string", "password": "string" }`  
Response `200`: same shape as Register.  
Errors: `400` missing fields, `401` invalid credentials.

### Submit Student ID
`POST /api/auth/submit-student-id` — **requires JWT**

Starts the seller approval process — see the [Seller Verification &
Approval Workflow](../README.md#seller-verification--approval-workflow) in
the root README for the full picture. This does **not** grant selling
rights; it only puts the user in the admin's approval queue.

Body: `{ "student_id": "string (4+ chars)" }`  
`user_id` is taken from the caller's JWT, not the body.  
Response `200`: `{ "message": "Student ID submitted!" }`  
Errors: `400` missing/short student ID, `404` user not found.

---

## 2. Listings `/api/listings`

### Get All Listings
`GET /api/listings/`

Query params (all optional): `search` (title substring, case-insensitive),
`category`, `sellerId`.

Response `200`: array of listing objects:
```json
{ "id": 1, "title": "...", "description": "...", "price": 100.0, "category": "Electronics", "listingType": "product", "images": ["base64..."], "status": "available", "sellerId": 3, "sellerUsername": "...", "sellerVerified": false, "createdAt": "..." }
```

### Get Single Listing
`GET /api/listings/<id>`

Same shape as above, but includes a full `seller` object (`id`, `name`,
`phone`, `verified`) instead of the flattened `sellerUsername`/`sellerVerified`
fields. `404` if not found.

### Create Listing
`POST /api/listings/` — **requires JWT**

Body:
```json
{ "title": "3-100 chars", "description": "10+ chars", "price": 0.0, "category": "one of the valid categories", "images": ["base64..."], "listingType": "product|service" }
```
**Requires `seller_approved = true` on the authenticated user** — returns
`403 { "message": "You must be approved as a seller first" }` otherwise.
This check is server-side and cannot be bypassed from the client.

Valid categories: `Electronics`, `Textbooks`, `Clothing`, `Food`, `Services`, `Other`.

Response `201`: the created listing (with full `seller` object).

### Update Listing
`PUT /api/listings/<id>` — **requires JWT**, must be the listing's owner
(`403` otherwise). Same field validation as Create. Does not re-check
`seller_approved` (only enforced on creation).

### Update Listing Status
`PUT /api/listings/<id>/status` — **requires JWT**, must be the owner.  
Body: `{ "status": "available|reserved|sold" }`

### Delete Listing
`DELETE /api/listings/<id>` — **requires JWT**, must be the owner.

---

## 3. Messages `/api/messages`

### Send Message
`POST /api/messages/` — **requires JWT**

Body: `{ "content": "string", "receiver_id": 2, "listing_id": 5 }`  
`sender_id` is taken from the caller's JWT, not the body. Also creates a
`Notification` for the receiver. Response `201`: `{ "message": "Message sent!" }`

### Get Messages for User
`GET /api/messages/<user_id>`

Returns every message where the user is sender or receiver (i.e. all of
their conversations combined, unfiltered by listing or thread — the
frontend is responsible for grouping these into conversations).

---

## 4. Ratings `/api/ratings`

### Submit Rating
`POST /api/ratings/` — **requires JWT**

Body: `{ "stars": 1-5, "comment": "string (optional)", "seller_id": 2 }`  
`rater_id` is taken from the caller's JWT, not the body. If the same
`rater_id`/`seller_id` pair already has a rating, it's updated in place
rather than duplicated (one rating per rater per seller).  
Response `201`: `{ "message": "Rating submitted!" }`

### Get Ratings for Seller
`GET /api/ratings/<seller_id>`

Response `200`:
```json
{ "average": 4.5, "total": 2, "ratings": [{ "stars": 5, "comment": "...", "rater_id": 1 }] }
```

---

## 5. Categories `/api/categories`

### Get All Categories
`GET /api/categories/`

Seeds the six default categories (Electronics, Textbooks, Clothing, Food,
Services, Other) on first call if the table is empty. Response `200`: array
of `{ "id": 1, "name": "...", "icon": "..." }`.

### Add Category (Admin)
`POST /api/categories/` — **requires JWT + `is_admin`**  
Body: `{ "name": "2-50 chars", "icon": "emoji, optional" }`  
`400` if name missing, too short/long, or already exists.

### Delete Category (Admin)
`DELETE /api/categories/<id>` — **requires JWT + `is_admin`**

---

## 6. Reports `/api/reports`

### Report a Listing
`POST /api/reports/` — **requires JWT**

Body: `{ "reason": "string", "listing_id": 5 }`  
`reporter_id` is taken from the caller's JWT, not the body. One report per
reporter per listing — `400` if that pair already exists.

### Get All Reports
`GET /api/reports/` — returns every report, unauthenticated. (Admin panel
also exposes reports via `/api/admin/reports`; functionally the same data.)

---

## 7. Notifications `/api/notifications`

### Get Notifications for User
`GET /api/notifications/<user_id>` — newest first.

### Mark Notification as Read
`PUT /api/notifications/<id>/read`

### Mark All Notifications as Read
`PUT /api/notifications/<user_id>/read-all`

---

## 8. Users `/api/users`

### Get User
`GET /api/users/<id>`

Response `200`: `{ "id": 1, "name": "...", "email": "...", "phone": "...", "createdAt": "..." }`  
`404` if not found. Note this is a public profile lookup — does not include
`verified`/`seller_approved`/`student_id`.

---

## 9. Admin `/api/admin` — **all routes require JWT + `is_admin = true`**

### Get Stats
`GET /api/admin/stats`

Response `200`:
```json
{
  "total_users": 0, "total_listings": 0, "total_messages": 0, "total_reports": 0,
  "pending_sellers": 0,
  "available": 0, "sold": 0, "reserved": 0
}
```
`pending_sellers` = users with a `student_id` on file but `seller_approved = false`.

### Get All Users
`GET /api/admin/users` — full user list including `verified`, `student_id`,
`seller_approved`, `is_admin`.

### Verify/Unverify User
`PUT /api/admin/users/<id>/verify` — toggles `User.verified` (unrelated to
seller approval; this is a separate "trusted user" badge).

### Approve/Revoke Seller
`PUT /api/admin/users/<id>/approve-seller` — toggles `seller_approved`. This
is the action that unlocks (or locks) a user's ability to create listings.

### Promote/Demote Admin
`PUT /api/admin/users/<id>/toggle-admin` — toggles `is_admin`. An admin
cannot demote themselves (`400` if `id` matches the caller's own ID).

### Change Own Password
`PUT /api/admin/change-password`  
Body: `{ "current_password": "string", "new_password": "6+ chars" }`  
Verifies `current_password` against the hash before updating — `401` if wrong.

### Delete User
`DELETE /api/admin/users/<id>`

### Get All Listings (Admin)
`GET /api/admin/listings`

### Delete Listing (Admin)
`DELETE /api/admin/listings/<id>`

### Get All Reports (Admin)
`GET /api/admin/reports`

### Dismiss Report
`DELETE /api/admin/reports/<id>`

---

## Data Models Summary
| Model | Key Fields |
|-------|-----------|
| User | id, username, email, password (hashed), phone, verified, student_id, seller_approved, is_admin, created_at |
| Listing | id, title, description, price, category, listing_type, image, status, user_id, created_at |
| Message | id, content, sender_id, receiver_id, listing_id, created_at |
| Rating | id, stars, comment, rater_id, seller_id, created_at |
| Category | id, name, icon, created_at |
| Report | id, reason, reporter_id, listing_id, created_at |
| Notification | id, content, read, user_id, created_at |

---

## Error Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request / validation error |
| 401 | Unauthorized (missing/invalid JWT, wrong password) |
| 403 | Forbidden (e.g. not an approved seller, not the resource owner, not an admin) |
| 404 | Not found |

---

## Notes for Frontend Developers
1. Images are stored as base64 strings.
2. Authentication is JWT-based — send `Authorization: Bearer <token>` on
   protected routes. All identity-bearing writes (`messages`, `ratings`,
   `reports`, `submit-student-id`, `listings`) now derive the acting
   user from the token rather than trusting an ID in the request body.
3. Admin access requires a JWT for a user with `is_admin = true` — no
   separate key or header.
4. CORS is open.
5. Categories are dynamic — always fetch them.
6. Two route prefixes exist for the same endpoints: `/api/<resource>` for
   this repo's React frontend, and a no-prefix `/<resource>` alias
   (currently only for `auth`, `listings`, and `users`) for the secondary
   Next.js frontend. Both hit identical view logic.
7. A listing's `seller_approved` gate is enforced only on **creation**, not
   on update — an already-approved seller who is later revoked can still
   edit their existing listings, just not create new ones.
