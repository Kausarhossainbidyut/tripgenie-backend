# TripGenie API Documentation

Complete API reference for TripGenie Backend.

## Table of Contents

- [Authentication API](#authentication-api)
- [Users API](#users-api)
- [File Upload API](#file-upload-api)
- [Frontend Integration Guide](#frontend-integration-guide)
- [Error Codes](#error-codes)

---

## Base URL

```
http://localhost:5000
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true|false,
  "message": "Description of the result",
  "data": { ... },
  "error": "Error message (if any)"
}
```

---

## Authentication API

### 1. Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456",
  "avatar": "https://i.ibb.co/.../image.jpg"
}
```

**Required Fields:**
- `name` (string) - User's full name
- `email` (string) - Valid email address
- `password` (string) - Minimum 6 characters

**Optional Fields:**
- `avatar` (string) - URL to user's profile image

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully. Please login to get access token.",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": "",
    "_id": "69ba8a415ea070bc51060b1d",
    "createdAt": "2026-03-18T11:19:29.856Z",
    "updatedAt": "2026-03-18T11:19:29.856Z"
  }
}
```

**Note:** Registration does not return tokens. User must login separately.

---

### 2. Login User

Authenticate user and receive access tokens.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "_id": "69ba8a415ea070bc51060b1d",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "avatar": ""
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Token Details:**
- `accessToken` - Valid for 15 minutes, used for API authentication
- `refreshToken` - Valid for 7 days, used to get new access tokens

**Frontend Storage:**
```javascript
localStorage.setItem('accessToken', data.data.accessToken);
localStorage.setItem('refreshToken', data.data.refreshToken);
localStorage.setItem('user', JSON.stringify(data.data.user));
```

---

### 3. Refresh Token

Get new access token when current one expires.

**Endpoint:** `POST /api/auth/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## Users API

All user routes require authentication. Include the access token in the Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 1. Get All Users

Retrieve list of all users (Admin only).

**Endpoint:** `GET /api/users`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "_id": "69ba8a415ea070bc51060b1d",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "avatar": ""
    }
  ]
}
```

**Access:** Admin only

---

### 2. Get User by ID

Retrieve specific user details.

**Endpoint:** `GET /api/users/:id`

**Example:** `GET /api/users/69ba8a415ea070bc51060b1d`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "_id": "69ba8a415ea070bc51060b1d",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": ""
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 3. Update User

Update user information.

**Endpoint:** `PATCH /api/users/:id`

**Example:** `PATCH /api/users/69ba8a415ea070bc51060b1d`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "avatar": "https://i.ibb.co/.../new-image.jpg"
}
```

**Updatable Fields:**
- `name` (string) - User's full name
- `avatar` (string) - URL to profile image

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "69ba8a415ea070bc51060b1d",
    "name": "Updated Name",
    "email": "john@example.com",
    "role": "user",
    "avatar": "https://i.ibb.co/.../new-image.jpg"
  }
}
```

---

### 4. Delete User

Delete a user account.

**Endpoint:** `DELETE /api/users/:id`

**Example:** `DELETE /api/users/69ba8a415ea070bc51060b1d`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Access:** Admin only

---

## File Upload API

Upload images to imgBB cloud storage.

### 1. Upload Single Image

Upload a single profile image.

**Endpoint:** `POST /api/v1/upload/profile`

**Content-Type:** `multipart/form-data`

**Request Body (form-data):**
| Key | Type | Value |
|-----|------|-------|
| `profile` | File | Select image file |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://i.ibb.co/abc123/image.jpg",
    "delete_url": "https://ibb.co/abc123/delete",
    "thumb_url": "https://i.ibb.co/abc123/image-th.jpg",
    "filename": "profile.jpg",
    "size": 12345,
    "mimetype": "image/jpeg"
  }
}
```

**Response Fields:**
- `url` - Direct image URL (use this to display image)
- `delete_url` - URL to delete the image later
- `thumb_url` - Thumbnail version URL
- `filename` - Original filename
- `size` - File size in bytes
- `mimetype` - File MIME type

---

### 2. Upload Multiple Images

Upload multiple travel images at once.

**Endpoint:** `POST /api/v1/upload/travel-images`

**Content-Type:** `multipart/form-data`

**Request Body (form-data):**
| Key | Type | Value |
|-----|------|-------|
| `images` | File | Select multiple image files |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": [
    {
      "url": "https://i.ibb.co/abc123/image1.jpg",
      "delete_url": "https://ibb.co/abc123/delete",
      "thumb_url": "https://i.ibb.co/abc123/image1-th.jpg",
      "filename": "travel1.jpg",
      "size": 12345,
      "mimetype": "image/jpeg"
    },
    {
      "url": "https://i.ibb.co/def456/image2.jpg",
      "delete_url": "https://ibb.co/def456/delete",
      "thumb_url": "https://i.ibb.co/def456/image2-th.jpg",
      "filename": "travel2.jpg",
      "size": 67890,
      "mimetype": "image/jpeg"
    }
  ]
}
```

---

### 3. Delete Uploaded Image

Delete an image from imgBB using delete_url.

**Endpoint:** `DELETE /api/v1/upload/delete`

**Method 1 - Query Parameter:**
```
DELETE /api/v1/upload/delete?delete_url=https://ibb.co/xxxxx/delete
```

**Method 2 - Request Body:**
```json
{
  "delete_url": "https://ibb.co/xxxxx/delete"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "File deletion initiated. Use the delete_url from upload response to delete the file.",
  "delete_url": "https://ibb.co/xxxxx/delete"
}
```

**Note:** Save the `delete_url` when uploading images if you want to delete them later.

---

## Frontend Integration Guide

### Complete Authentication Flow

```javascript
// Base API URL
const API_URL = 'http://localhost:5000/api';

// 1. Register User
const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// Usage:
// await register({
//   name: "John Doe",
//   email: "john@example.com",
//   password: "123456"
// });

// 2. Login User
const login = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await response.json();
  
  if (data.success) {
    // Store tokens
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  return data;
};

// Usage:
// await login({
//   email: "john@example.com",
//   password: "123456"
// });

// 3. Get Access Token from Storage
const getToken = () => localStorage.getItem('accessToken');

// 4. Make Authenticated Request
const fetchUsers = async () => {
  const response = await fetch(`${API_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.json();
};

// 5. Get Single User
const getUserById = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.json();
};

// 6. Update User
const updateUser = async (userId, updateData) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(updateData)
  });
  return response.json();
};

// Usage:
// await updateUser('69ba8a415ea070bc51060b1d', {
//   name: "Updated Name",
//   avatar: "https://i.ibb.co/.../image.jpg"
// });

// 7. Delete User
const deleteUser = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.json();
};

// 8. Refresh Token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await fetch(`${API_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
  }
  return data;
};
```

### File Upload Integration

```javascript
// Upload Single Image
const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('profile', file);
  
  const response = await fetch(`${API_URL}/v1/upload/profile`, {
    method: 'POST',
    body: formData
  });
  return response.json();
};

// Upload Multiple Images
const uploadTravelImages = async (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });
  
  const response = await fetch(`${API_URL}/v1/upload/travel-images`, {
    method: 'POST',
    body: formData
  });
  return response.json();
};

// Delete Image
const deleteImage = async (deleteUrl) => {
  const response = await fetch(`${API_URL}/v1/upload/delete?delete_url=${encodeURIComponent(deleteUrl)}`, {
    method: 'DELETE'
  });
  return response.json();
};

// React Example - Image Upload Component
/*
function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const result = await uploadProfileImage(file);
      if (result.success) {
        console.log('Image URL:', result.data.url);
        console.log('Delete URL:', result.data.delete_url);
        // Save these URLs to your database
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <input 
      type="file" 
      accept="image/*" 
      onChange={handleFileChange}
      disabled={uploading}
    />
  );
}
*/
```

### Axios Setup with Auto Token Refresh

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          'http://localhost:5000/api/auth/refresh-token',
          { refreshToken }
        );
        
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Token refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Usage
// const users = await api.get('/users');
// const user = await api.get('/users/123');
// await api.patch('/users/123', { name: 'New Name' });
```

---

## Error Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions (Admin required) |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

### Common Error Responses

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**403 - Forbidden:**
```json
{
  "success": false,
  "message": "Access denied. Admin only."
}
```

**404 - Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**400 - User Already Exists:**
```json
{
  "success": false,
  "message": "User already exists!"
}
```

**401 - Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## Quick Reference

### API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| POST | `/api/auth/refresh-token` | No | Refresh access token |
| GET | `/api/users` | Yes (Admin) | Get all users |
| GET | `/api/users/:id` | Yes | Get user by ID |
| PATCH | `/api/users/:id` | Yes | Update user |
| DELETE | `/api/users/:id` | Yes (Admin) | Delete user |
| POST | `/api/v1/upload/profile` | No | Upload single image |
| POST | `/api/v1/upload/travel-images` | No | Upload multiple images |
| DELETE | `/api/v1/upload/delete` | No | Delete uploaded image |

### Token Storage Best Practices

1. **Access Token**: Store in memory or localStorage
2. **Refresh Token**: Store securely (localStorage or httpOnly cookie)
3. **User Data**: Store in localStorage for quick access
4. **Clear on Logout**: Remove all tokens from storage

### Security Notes

- Always use HTTPS in production
- Never expose JWT secrets
- Implement rate limiting for auth endpoints
- Validate all user inputs
- Sanitize file uploads
