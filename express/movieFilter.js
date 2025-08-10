const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;

const movies = JSON.parse(fs.readFileSync("movie.json", "utf-8"));

// http://localhost:3000/movies?genre=sci-fi&year=2020,2022
app.get("/movies", (req, res) => {
  const genre = req.query.genre?.toLowerCase();
  const yearParam = req.query.year;

  // 🚫 If either parameter is missing
  if (!genre || !yearParam) {
    return res.json({
      message: "Both 'genre' and 'year' query parameters are required.",
      movies: [],
    });
  }

  const years = yearParam.split(",").map((y) => parseInt(y.trim()));

  const filtered = movies.filter((movie) => {
    const genreMatch = movie.genre.toLowerCase() === genre;
    const yearMatch = Array.isArray(movie.year)
      ? movie.year.some((y) => years.includes(y))
      : years.includes(movie.year);
    return genreMatch && yearMatch;
  });

  res.json({ movies: filtered });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
