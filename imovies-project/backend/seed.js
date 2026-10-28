import dotenv from "dotenv";
import mongoose from "mongoose";
import Movie from "./src/models/Movie.js";
dotenv.config();
const date = new Date();
const dates = [0, 1, 2].map(offset => {
  const d = new Date(date); d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
});
const movies = [
  { title: "The Last Horizon", description: "A daring crew sets out on a mission that will change their world forever.", genre: ["Adventure", "Sci-Fi"], duration: 138, rating: 8.4, language: "English", posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", bannerUrl: "https://image.tmdb.org/t/p/w1280/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
  { title: "City of Dreams", description: "Two strangers discover that a new beginning can come from the most unexpected place.", genre: ["Drama", "Romance"], duration: 124, rating: 7.9, language: "Hindi", posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
  { title: "Shadow Protocol", description: "A covert agent races against time to stop a dangerous conspiracy.", genre: ["Action", "Thriller"], duration: 132, rating: 8.1, language: "Hindi", posterUrl: "https://image.tmdb.org/t/p/w500/qm8d3v5Yw3i8r6p3m6z8x4z8x4z.jpg" },
  { title: "Ocean of Stars", description: "An animated family adventure about courage, friendship, and finding your way home.", genre: ["Animation", "Family"], duration: 106, rating: 8.0, language: "English", posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" }
].map(m => ({
  ...m,
  showtimes: dates.flatMap(date => ["10:30 AM", "2:00 PM", "6:30 PM", "9:45 PM"].map(time => ({ date, time, price: time.includes("9:45") ? 220 : 180, bookedSeats: [] })))
}));
try {
  await mongoose.connect(process.env.MONGODB_URI);
  await Movie.deleteMany({});
  await Movie.insertMany(movies);
  console.log("Demo movies and showtimes seeded.");
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
