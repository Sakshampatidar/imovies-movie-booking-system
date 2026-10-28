import { Router } from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate("movie").sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { next(err); }
});

router.post("/", requireAuth, async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { movieId, showtimeId, seats } = req.body;
    if (!movieId || !showtimeId || !Array.isArray(seats) || seats.length < 1 || seats.length > 10) {
      return res.status(400).json({ message: "Choose between 1 and 10 seats." });
    }
    if (new Set(seats).size !== seats.length || seats.some(s => !/^[A-J](?:[1-9]|10)$/.test(s))) {
      return res.status(400).json({ message: "One or more seat numbers are invalid." });
    }
    let booking;
    await session.withTransaction(async () => {
      const movie = await Movie.findById(movieId).session(session);
      if (!movie) throw Object.assign(new Error("Movie not found."), { status: 404 });
      const show = movie.showtimes.id(showtimeId);
      if (!show) throw Object.assign(new Error("Showtime not found."), { status: 404 });
      if (show.date < new Date().toISOString().slice(0, 10)) throw Object.assign(new Error("This show has already passed."), { status: 400 });
      const alreadyBooked = seats.filter(s => show.bookedSeats.includes(s));
      if (alreadyBooked.length) throw Object.assign(new Error(`These seats are no longer available: ${alreadyBooked.join(", ")}`), { status: 409 });
      show.bookedSeats.push(...seats);
      await movie.save({ session });
      booking = await Booking.create([{
        user: req.user.id, movie: movie._id, showtimeId: show._id,
        showDate: show.date, showTime: show.time, seats,
        totalAmount: show.price * seats.length
      }], { session });
      booking = booking[0];
    });
    res.status(201).json(await Booking.findById(booking._id).populate("movie"));
  } catch (err) { next(err); }
  finally { await session.endSession(); }
});
export default router;
