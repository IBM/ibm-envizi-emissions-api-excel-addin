const express = require("express");
const app = express();
app.use(express.json());

app.post("/log", (req, res) => {
  console.log("[CLIENT LOG]:", ...req.body.log);
  res.sendStatus(200);
});

app.listen(3000, () => console.log("Log server running on port 3000"));
