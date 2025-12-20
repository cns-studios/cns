# CNS Studios - Central Authentication Service

This service provides a centralized authentication and user management solution for all applications within the CNS Studios ecosystem. It is built as a standalone microservice and implements a Single Sign-On (SSO) pattern using shared, secure cookies.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Running the Service](#running-the-service)
- [How It Works: SSO Flow](#how-it-works-sso-flow)
- [Integrating a New Service](#integrating-a-new-service)
  - [Step 1: The Login Redirect](#step-1-the-login-redirect)
  - [Step 2: Handling the User Session](#step-2-handling-the-user-session)
  - [Step 3: The Logout Redirect](#step-3-the-logout-redirect)
- [Secure API Usage](#secure-api-usage)
  - [Authentication](#authentication)
  - [Endpoints](#endpoints)
    - [`GET /api/me`](#get-apime)
    - [`GET /api/data/:service`](#get-apidataservice)
    - [`POST /api/data/:service`](#post-apidataservice)
- [Environment Variables](#environment-variables)

---

## Architecture Overview

The CNS Auth Service is the single source of truth for user identity. Other applications (referred to as "sub-services") do not have their own user tables or login forms. Instead, they redirect users to this central service for authentication.

Upon successful login, a secure, `HttpOnly` cookie containing a JSON Web Token (JWT) is set on a shared parent domain (e.g., `.cns-studios.com`). This cookie is accessible to all sub-services on subdomains, allowing them to verify the user's session.

User data, including data specific to each sub-service, is stored centrally and can be accessed securely via a protected API.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation & Setup

1.  **Clone the repository.**
2.  **Navigate to the `auth` directory:**
    ```bash
    cd auth
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Create an environment file:** Copy the example file and fill in the required values.
    ```bash
    cp .env.example .env
    ```
5.  **Edit the `.env` file:**
    - Set `JWT_SECRET` to a long, random, and secure string.
    - Set `COOKIE_DOMAIN` to your shared parent domain (e.g., `.cns-studios.com`). For local development, you might use `.localhost` and configure your services to run on subdomains like `app1.localhost`.

### Running the Service

-   **For development (with hot-reloading):**
    ```bash
    npm run dev
    ```
-   **For production:**
    ```bash
    npm start
    ```
The service will run on the port specified in your `.env` file (default is `3001`).

---

## How It Works: SSO Flow

1.  A user visits a protected page on `petro.cns-studios.com`.
2.  The Petro app sees there is no valid session and redirects the user to the Auth Service: `https://auth.cns-studios.com/login?redirect_uri=https://petro.cns-studios.com/dashboard`.
3.  The user logs in.
4.  The Auth Service sets the shared `auth_token` cookie on `.cns-studios.com`.
5.  The Auth Service redirects the user back to the `redirect_uri` provided.
6.  The Petro app now sees the `auth_token` cookie and knows the user is logged in. It can make API calls to the Auth Service to get user data.

---

## Integrating a New Service

Here’s how to make your application (`app.cns-studios.com`) use the central auth system.

### Step 1: The Login Redirect

When you need to log a user in, do not show a login form. Instead, construct a redirect URL to the Auth Service and send the user there.

**Crucially, you must include a `redirect_uri` query parameter.** This is where the user will be sent back after they log in.

**Example (Express.js middleware):**

```javascript
function requireAuth(req, res, next) {
    if (!req.cookies.auth_token) {
        const authServiceUrl = 'https://auth.cns-studios.com/login';
        const redirectUri = encodeURIComponent(req.originalUrl); // Or a fixed dashboard URL
        return res.redirect(`${authServiceUrl}?redirect_uri=${redirectUri}`);
    }
    // If the cookie exists, you might want to verify it via the /api/me endpoint
    next();
}
```

### Step 2: Handling the User Session

Your application no longer needs to manage passwords or user registration. Its main job is to check for the presence of the `auth_token` cookie. To get the user's details, you must use this cookie to make a secure, server-to-server call to the Auth Service's API.

### Step 3: The Logout Redirect

To log a user out, you must clear the central session. Redirect the user to the Auth Service's `/logout` endpoint. You can optionally provide a `redirect_uri` to send them to a specific page after logout.

**Example:**

```html
<a href="https://auth.cns-studios.com/logout?redirect_uri=https://app.cns-studios.com/logged-out">
  Logout
</a>
```

---

## Secure API Usage

### Authentication

All API endpoints require the `auth_token` cookie to be sent with the request. The API is intended for **server-to-server** communication. Your sub-service's backend should make these calls, not the user's browser directly.

### Endpoints

#### `GET /api/me`

Retrieves the profile and core data for the currently authenticated user.

-   **Success Response (200 OK):**
    ```json
    {
        "userId": 1,
        "username": "jules",
        "profile": {
            "displayName": "jules",
            "avatar": null,
            "level": 1,
            "joinDate": "..."
        },
        "services": {
            "petro": { "theme": "dark" }
        }
    }
    ```
-   **Error Response (401 Unauthorized):** If the `auth_token` cookie is missing or invalid.

#### `GET /api/data/:service`

Retrieves the data stored specifically for one service for the current user.

-   **URL Param:** `service` - The name of your service (e.g., `petro`).
-   **Success Response (200 OK):**
    ```json
    {
        "theme": "dark",
        "lastProjectId": "xyz-123"
    }
    ```
-   **Error Response (404 Not Found):** If no data is stored for that service.

#### `POST /api/data/:service`

Creates or overwrites the data for a specific service for the current user.

-   **URL Param:** `service` - The name of your service (e.g., `petro`).
-   **Request Body:** A JSON object containing the data you want to store.
-   **Success Response (200 OK):**
    ```json
    {
        "message": "Data for petro updated successfully."
    }
    ```

---

## Environment Variables

| Variable          | Description                                                                                              | Example               |
| ----------------- | -------------------------------------------------------------------------------------------------------- | --------------------- |
| `PORT`            | The port on which the service will run.                                                                  | `3001`                |
| `JWT_SECRET`      | A long, random, and secret string used for signing authentication tokens.                                | `your-super-secret`   |
| `COOKIE_DOMAIN`   | **CRITICAL:** The shared parent domain for the cookie. Must start with a dot (`.`).                        | `.cns-studios.com`    |
| `COOKIE_MAX_AGE`  | The maximum age of the cookie in milliseconds.                                                           | `604800000` (7 days)  |
