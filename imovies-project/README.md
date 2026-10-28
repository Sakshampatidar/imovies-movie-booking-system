# iMovies — Movie Ticket Booking

A full-stack starter project using React + Vite, Node.js, Express, and MongoDB.

## Features
- Browse movies and view details
- Register / log in with JWT authentication
- Browse showtimes and select seats
- Book available seats (server checks seat availability)
- View your bookings
- Seed demo movies and showtimes
- Responsive UI

## Requirements
- Node.js 18+
- MongoDB Atlas connection string or local MongoDB

## 1. Configure backend
```bash
cd backend
cp .env.example .env
```
Edit `.env` and set `MONGODB_URI` and a long `JWT_SECRET`.

Install and start:
```bash
npm install
npm run seed
npm run dev
```
Backend defaults to `http://localhost:5000`.

## 2. Configure frontend
Open a second terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open the URL printed by Vite (usually http://localhost:5173).

## Demo flow
1. Register an account.
2. Browse movies.
3. Open a movie and choose a showtime.
4. Select seats and book.
5. Open My Bookings to see your reservations.

## Important
- This is a student/demo project, not a production ticketing platform.
- Use HTTPS, strong secrets, rate limiting, email verification, payment provider integration, and more rigorous concurrency handling before production use.
- Never commit `.env` files or real credentials to GitHub.
