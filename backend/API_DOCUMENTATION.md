# Evelyn Hone Market — Backend API Documentation

**Base URL:** `https://evelyn-hone-market-production.up.railway.app`  
**All requests and responses use JSON.**  
**Authentication is handled via user_id passed in request body.**  
**Admin endpoints require the header:** `X-Admin-Key: evelyn-hone-admin-2026`

---

## 1. Authentication `/api/auth`

### Register
`POST /api/auth/register`
...
### Login
`POST /api/auth/login`
...
### Submit Student ID
`POST /api/auth/submit-student-id`
...

## 2. Listings `/api/listings`
### Get All Listings
...
### Create Listing
...
### Update Listing Status
...
### Delete Listing
...

## 3. Messages `/api/messages`
### Send Message
...
### Get Messages for User
...

## 4. Ratings `/api/ratings`
### Submit Rating
...
### Get Ratings for Seller
...

## 5. Categories `/api/categories`
### Get All Categories
...
### Add Category (Admin)
...
### Delete Category (Admin)
...

## 6. Reports `/api/reports`
### Report a Listing
...
### Get All Reports
...

## 7. Notifications `/api/notifications`
### Get Notifications for User
...
### Mark Notification as Read
...
### Mark All Notifications as Read
...

## 8. Admin `/api/admin`
### Get Stats
...
### Get All Users
...
### Verify/Unverify User
...
### Approve/Revoke Seller
...
### Delete User
...
### Get All Listings (Admin)
...
### Delete Listing (Admin)
...
### Get All Reports (Admin)
...
### Dismiss Report
...

## Data Models Summary
| Model | Key Fields |
|-------|-----------|
| User | id, username, email, password, verified, student_id, seller_approved |
| Listing | id, title, description, price, category, listing_type, image, status, user_id |
| Message | id, content, sender_id, receiver_id, listing_id |
| Rating | id, stars, comment, rater_id, seller_id |
| Category | id, name, icon |
| Report | id, reason, reporter_id, listing_id |
| Notification | id, content, read, user_id |

---

## Error Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request / validation error |
| 401 | Unauthorized |
| 403 | Forbidden (e.g. not an approved seller) |
| 404 | Not found |

---

## Notes for Frontend Developers
1. Images are stored as base64 strings.  
2. Authentication uses `user_id` in request bodies (no JWT).  
3. Admin access requires `X-Admin-Key`.  
4. CORS is open.  
5. Categories are dynamic — always fetch them.  

