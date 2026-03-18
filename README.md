# TripGenie Backend API

A comprehensive backend API for TripGenie AI Travel Application built with Node.js, Express, TypeScript, and MongoDB.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Frontend Integration](#frontend-integration)
- [License](#license)

## Quick Links

- **[Complete API Documentation](API_DOCUMENTATION.md)** - Full API reference with examples
- **[Authentication Guide](API_DOCUMENTATION.md#authentication-api)** - Login/Register/Refresh token
- **[Users API](API_DOCUMENTATION.md#users-api)** - User CRUD operations
- **[Items API](API_DOCUMENTATION.md#items-api)** - Destination/Item CRUD with search/filter
- **[Bookings API](API_DOCUMENTATION.md#bookings-api)** - Booking/Reservation system
- **[Reviews API](API_DOCUMENTATION.md#reviews-api)** - Item reviews and ratings
- **[Wishlist API](API_DOCUMENTATION.md#wishlist-api)** - User favorites/wishlist
- **[File Upload API](API_DOCUMENTATION.md#file-upload-api)** - Image upload to cloud
- **[Frontend Integration](API_DOCUMENTATION.md#frontend-integration-guide)** - Code examples for React/Vue/Angular

## Features

- **Authentication System**: JWT-based authentication with access and refresh tokens
- **User Management**: CRUD operations for users with role-based access control
- **Items/Destinations**: CRUD with search, filter, sort, and pagination
- **Bookings**: Reservation system with quantity management
- **Reviews**: Item reviews and ratings with ownership control
- **Wishlist**: User favorites with duplicate prevention
- **File Upload**: Image upload to imgBB cloud storage with delete functionality
- **Search & Filter**: Advanced querying for items (search, price range, category, sort)
- **Security**: Password hashing with bcrypt, protected routes with middleware
- **TypeScript**: Fully typed codebase for better developer experience

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: imgBB (Cloud)
- **Security**: bcrypt, cors

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account or local MongoDB
- imgBB API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tripgenie-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in root directory:
```env
PORT=5000
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/tripgenie
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
IMGBB_API_KEY=your_imgbb_api_key_here
```

4. Build the TypeScript code:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

For development with hot reload:
```bash
npm run dev
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | Yes |
| `DATABASE_URL` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration time | No (default: 7d) |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds | No (default: 12) |
| `IMGBB_API_KEY` | imgBB API key for image upload | Yes |

## API Documentation

For complete API documentation with detailed examples, see **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)**.

### API Overview

| Category | Endpoints | Auth Required |
|----------|-----------|---------------|
| **Authentication** | Register, Login, Refresh Token | No |
| **Users** | Get All, Get By ID, Update, Delete | Yes |
| **Items** | Create, Get All (with search/filter), Get By ID, Update, Delete | Mixed |
| **Bookings** | Create, Get All, Get By ID, Update, Delete | Yes |
| **Reviews** | Create, Get By Item, Delete | Mixed |
| **Wishlist** | Add, Get All, Check Status, Remove | Yes |
| **File Upload** | Single, Multiple, Delete | No |

### Quick Examples

**Login:**
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: "john@example.com",
    password: "123456"
  })
});
const data = await response.json();
// Save: data.data.accessToken, data.data.refreshToken
```

**Authenticated Request:**
```javascript
const response = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});
```

**Upload Image:**
```javascript
const formData = new FormData();
formData.append('profile', file);
const response = await fetch('/api/v1/upload/profile', {
  method: 'POST',
  body: formData
});
```

---

## Error Handling

Common HTTP status codes:

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (Invalid/No token) |
| 403 | Forbidden (Admin access required) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## License

This project is licensed under the ISC License.
