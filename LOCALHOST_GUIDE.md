# FoodTabs — Local Development Setup

## Prerequisites

Make sure the following are installed before starting:

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB Community Server + Compass](https://www.mongodb.com/try/download/community) — install the full package, it includes both the database and the Compass GUI
- npm (comes with Node.js)

---

## 1. Clone the Repository

```bash
git clone https://github.com/ZeddhD/Project-FoodTabs.git
cd Project-FoodTabs
```

---

## 2. Install Dependencies

Run these two commands from the project root — one for the server, one for the client:

```bash
cd server && npm install
cd ../client && npm install
```

---

## 3. Configure Environment Variables

### Server

```bash
# from the project root
cp .env.example server/.env
```

Open `server/.env` and fill in the values:

```env
# MongoDB — choose one:
MONGODB_URI=mongodb://localhost:27017/foodtabs   # local MongoDB
# MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/foodtabs  # Atlas

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=7d

PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Stripe (leave as-is if not testing payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

> **Generate a secure JWT secret:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```
> Copy the output and paste it as your `JWT_SECRET`.

### Client

```bash
cp client/.env.example client/.env
```

The default values work for local development — no changes needed unless you change the server port:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

---

## 4. Start MongoDB with Compass

### Option A — MongoDB Compass (recommended)

1. Open **MongoDB Compass**
2. In the connection screen, paste the URI:
   ```
   mongodb://localhost:27017
   ```
3. Click **Connect**
4. Compass starts the local MongoDB service automatically — no terminal needed
5. You'll see a `foodtabs` database appear here after the server runs for the first time

> The `MONGODB_URI` in `server/.env` should be:
> ```
> MONGODB_URI=mongodb://localhost:27017/foodtabs
> ```

### Option B — MongoDB Atlas (cloud)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write access
3. Whitelist your IP address (or use `0.0.0.0/0` for dev)
4. Copy the connection string and paste it as `MONGODB_URI` in `server/.env`:
   ```
   MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/foodtabs
   ```
5. You can still use Compass to browse Atlas data — click **+ New connection** and paste the Atlas URI

---

## 5. Seed the Database (Optional)

Populates the database with sample restaurants, dishes, and a test admin account:

```bash
cd server
npm run seed
```

Test accounts created by the seed:
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@foodtabs.com | password123 |
| Owner | owner@foodtabs.com | password123 |
| User | user@foodtabs.com | password123 |

---

## 6. Start the Servers

Open **two separate terminals**:

**Terminal 1 — Backend (port 5000)**
```bash
cd server
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB connected
```

**Terminal 2 — Frontend (port 5173)**
```bash
cd client
npm run dev
```

You should see:
```
VITE v4.x.x  ready in Xms
➜  Local:   http://localhost:5173/
```

---

## 7. Open the App

Visit [http://localhost:5173](http://localhost:5173) in your browser.

The frontend talks to the backend at `http://localhost:5000/api`.

---

## Quick Reference

| Command | What it does |
|---------|-------------|
| `cd server && npm run dev` | Start backend with auto-reload |
| `cd client && npm run dev` | Start frontend dev server |
| `cd server && npm run seed` | Seed the database with sample data |
| `cd server && npm start` | Start backend without auto-reload |
| `cd client && npm run build` | Build frontend for production |

---

## Troubleshooting

**`MongoServerError: connect ECONNREFUSED`**
MongoDB is not running. Open Compass and connect to `mongodb://localhost:27017` first, or check your Atlas connection string.

**`Port 5000 already in use`**
Change `PORT` in `server/.env` to another value (e.g. `5001`) and update `VITE_API_URL` in `client/.env` to match.

**`CORS error in browser`**
Make sure `CLIENT_URL` in `server/.env` matches the URL your frontend is running on (default `http://localhost:5173`).

**Uploads not working**
The server creates an `uploads/` folder automatically on startup. Make sure the `server/` directory is writable.
