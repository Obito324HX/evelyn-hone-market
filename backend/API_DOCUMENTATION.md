# Evelyn Hone Market — Backend API Documentation

**Base URL:** `https://evelyn-hone-market-production.up.railway.app`  
**All requests and responses use JSON.**  
**Authentication is handled via user_id passed in request body.**  
**Admin endpoints require the header:** `X-Admin-Key: evelyn-hone-admin-2026`

---

## 1. Authentication `/api/auth`

### Register
`POST /api/auth/register`

**Request Body:**
```json
{
  "username": "tobi_ehc",
  "email": "tobi@gmail.com",
  "password": "password123"
}

