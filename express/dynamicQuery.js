const express = require("express");

const app = express();

// app.get("/greet", (req, res) => {
//   const lang = req.query.lang;
//   let greeting;

//   switch (lang) {
//     case "en":
//       greeting = "Hello!";
//       break;
//     case "fr":
//       greeting = "Bonjour!";
//       break;
//     case "hi":
//       greeting = "Namaste!";
//       break;
//     default:
//       greeting = "Hello!";
//   }

//   res.send({ greeting });
// });

//  Optimized Version Using Object Mapping

app.get("/greet", (req, res) => {
  const greetings = {
    en: "Hello",
    fr: "Bonjour",
    hi: "Namaste",
  };

  const greeting = greetings[req.query.lang] || "Hello (Default)";

  //res.send() - Sends a response of any type: string, buffer, object, array, etc or for simple text or HTML responses.

  //   res.send(greeting);

  // structured API responses (especially when returning data to frontend apps).
  res.json({ greeting, supportedLanguages: Object.keys(greetings) });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
