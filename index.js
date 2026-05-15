const express = require('express');
const bodyParser = require('body-parser');
const supabaseClient = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { isValidStateAbbreviation } = require('usa-state-validator');
const path = require('path');

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get("/OFF_Products.csv", (_req, res) => {
  res.sendFile(path.join(__dirname, "OFF_Products.csv"));
});

const supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_KEY);



app.get("/search-product", async (req, res) => {
  const searchTerm = (req.query.name || "").toLowerCase().trim();

  if (!searchTerm) {
    return res.status(400).json({ error: "Missing name query parameter" });
  }

  const fs = require("fs");
  const csv = require("csv-parser");

  let results = [];

  fs.createReadStream("OFF_Products.csv").pipe(csv())
    .on("data", (row) => {
      const rowText = Object.values(row).join(" ").toLowerCase();

      if (rowText.includes(searchTerm)) results.push(row);
    })
    .on("end", () => res.json(results));
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});