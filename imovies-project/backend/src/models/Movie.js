import mongoose from "mongoose";
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  genre: { type: [String], default: [] },
  duration: { type: Number, default: 120 },
  rating: { type: Number, default: 8.0 },
  language: { type: String, default: "Hindi" },
  posterUrl: { type: String, default: "" },
  bannerUrl: { type: String, default: "" },
  releaseDate: { type: Date, default: Date.now },
  showtimes: [{
    time: { type: String, required: true },
    date: { type: String, required: true },
    price: { type: Number, default: 180 },
    bookedSeats: { type: [String], default: [] }
  }]
}, { timestamps: true });
export default mongoose.model("Movie", movieSchema);
