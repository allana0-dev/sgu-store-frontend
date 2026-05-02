# SGU E-Commerce Backend Prototype

NestJS + Prisma + SQLite backend prototype for the St. George's University campus retail e-commerce platform.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
cp .env.example .env
```

3. Run Prisma migrations:

```bash
npm run prisma:deploy
```

4. Start the API:

```bash
npm run start:dev
```

The API defaults to `http://localhost:4000`.

## Auth Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

Use `Authorization: Bearer <accessToken>` for protected routes such as `/auth/me`.

## Cart Endpoints (Protected)

- `GET /cart` - fetch logged-in user's cart
- `POST /cart/items` - add item or increase quantity
- `PATCH /cart/items/:productId` - set quantity (`0` removes the item)
- `DELETE /cart/items/:productId` - remove one item completely
- `DELETE /cart` - clear the full cart
- `POST /cart/checkout` - create an order from current cart and then clear cart

## Cart Endpoints (Public)

- `POST /cart/guest-checkout` - create an order without signing in (requires `email` and `items` in request body)

Example body for `POST /cart/items`:

```json
{
  "productId": "hoodie-001",
  "productName": "SGU Hoodie",
  "productImageUrl": "https://example.com/hoodie.jpg",
  "unitPrice": 29.99,
  "quantity": 1
}
```

For demo UX, the frontend can still mirror this cart in local storage for instant UI hydration, while treating the API as source of truth after login.

## Deployment Notes

For Render or Railway, use a build command like:

```bash
npm install && npm run prisma:deploy && npm run build
```

Use a start command like:

```bash
npm run start:prod
```
