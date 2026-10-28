import { Router } from "express";
import Movie from "../models/Movie.js";
const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (err) { next(err); }
});
router.get("/:id", async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    res.json(movie);
  } catch (err) { next(err); }
});
export default router;
