# Tea Factory API Testing Guide

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### 1. Register a New User

**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "supplier",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+94771234567",
  "address": "123 Main Street, Colombo"
}
```

**Valid Roles:**
- `owner`
- `factory_manager`
- `fertilizer_manager`
- `inventory_manager`
- `payment_manager`
- `transport_manager`
- `supplier`
- `driver`

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65abc123def456...",
      "email": "john.doe@example.com",
      "role": "supplier",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+94771234567",
      "address": "123 Main Street, Colombo",
      "isActive": true
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

### 2. Login

**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65abc123def456...",
      "email": "john.doe@example.com",
      "role": "supplier",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+94771234567",
      "address": "123 Main Street, Colombo",
      "profileImage": "",
      "isActive": true
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. Get Current User Profile

**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <your_token_here>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65abc123def456...",
      "email": "john.doe@example.com",
      "role": "supplier",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+94771234567",
      "address": "123 Main Street, Colombo",
      "profileImage": "",
      "isActive": true,
      "createdAt": "2026-03-03T10:30:00.000Z"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "No authentication token, access denied"
}
```

---

### 4. Update Profile

**PUT** `/api/auth/profile`

**Headers:**
```
Authorization: Bearer <your_token_here>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+94771234567",
  "address": "456 New Street, Colombo",
  "profileImage": "https://example.com/profile.jpg"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "65abc123def456...",
      "email": "john.doe@example.com",
      "role": "supplier",
      "firstName": "John",
      "lastName": "Smith",
      "phone": "+94771234567",
      "address": "456 New Street, Colombo",
      "profileImage": "https://example.com/profile.jpg",
      "isActive": true
    }
  }
}
```

---

### 5. Change Password

**PUT** `/api/auth/change-password`

**Headers:**
```
Authorization: Bearer <your_token_here>
```

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "supplier@test.com",
    "password": "test123",
    "role": "supplier",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+94771234567",
    "address": "Test Address"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "supplier@test.com",
    "password": "test123"
  }'
```

### Get Profile (Replace YOUR_TOKEN with actual token)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Testing with Postman

1. **Import Collection**: Create a new collection in Postman
2. **Set Environment Variable**: Create `BASE_URL` = `http://localhost:5000/api`
3. **Set Token Variable**: After login, save the token as `{{token}}`
4. **Use Token**: In protected routes, add header: `Authorization: Bearer {{token}}`

---

## Testing with Thunder Client (VS Code Extension)

1. Install Thunder Client extension in VS Code
2. Create a new request
3. Set the method (POST/GET/PUT)
4. Enter the URL
5. Add headers and body as needed
6. Click Send

---

## Sample Test Users for Each Role

```json
// Owner
{
  "email": "owner@teafactory.com",
  "password": "owner123",
  "role": "owner",
  "firstName": "Factory",
  "lastName": "Owner"
}

// Factory Manager
{
  "email": "manager@teafactory.com",
  "password": "manager123",
  "role": "factory_manager",
  "firstName": "Factory",
  "lastName": "Manager"
}

// Supplier
{
  "email": "supplier@test.com",
  "password": "supplier123",
  "role": "supplier",
  "firstName": "Tea",
  "lastName": "Supplier"
}

// Driver
{
  "email": "driver@test.com",
  "password": "driver123",
  "role": "driver",
  "firstName": "Delivery",
  "lastName": "Driver"
}
```

---

## Common Error Codes

- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid credentials or token)
- `403` - Forbidden (account deactivated)
- `404` - Not found
- `500` - Server error

---

## Notes

- All passwords must be at least 6 characters long
- Email addresses are automatically converted to lowercase
- Tokens expire after 7 days
- Store the token securely in your frontend application
- Include the token in the Authorization header for protected routes
