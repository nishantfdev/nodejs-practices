const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Enable CORS for all origins (development only)
app.use(cors());

const items = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
}));

app.get("/items", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit; //10
  const endIndex = startIndex + limit; //20

  res.json({
    page,
    totalPages: Math.ceil(items.length / limit), //1000/100 = 10
    totalItems: items.length,
    data: items.slice(startIndex, endIndex),
  });
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
