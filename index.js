const express = require('express');
const bodyParser = require('body-parser');
const supabaseClient = require('@supabase/supabase-js');
const { isValidStateAbbreviation } = require('usa-state-validator');
const dotenv = require('dotenv');

const app = express();
const port = 3000;
dotenv.config();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
  res.sendFile('public/main.html', { root: __dirname });
}); 

app.get('/favorites', async (req, res) => {
  console.log('Attempting to get all favorites!');

  const { data, error } = await supabase.from('favorites').select();

  if (error) {
    console.log(`Error: ${error}`);
    res.statusCode = 500;
    res.send(error);
  } else {
    console.log('Recieved Data:', data.length);
    res.json(data);
  }
});

app.post('/favorite', async (req, res) => {
  console.log('Adding Favorite');
  console.log(`Request: ${JSON.stringify(req.body)}`);
  const barcode = req.body.barcode;
  const name = req.body.name;
  const image = req.body.image;
  const calories = req.body.calories;
  const sugar = req.body.sugar; 
  const protein = req.body.protein;
  const carbs = req.body.carbs;
  const nutriScore = req.body.nutri_score;
  const { data, error } = await supabase
    .from('favorites')
    .insert({
      name: name,
      barcode: barcode,
      image: image,
      calories: calories,
      sugar: sugar,
      protein: protein,
      carbs: carbs,
      nutri_score: nutriScore,
    })
    .select();

  if (error) {
    console.log(`Error: ${error.message}`);
    res.statusCode = 500;
    res.send(error);
  } else {
    res.json(data);
  }
});
  

app.get('/search-product', async (req, res) => {
  const searchTerm = (req.query.name  || '').toLowerCase().trim();
  if (!searchTerm) return res.status(400).json({ error: 'Missing name query parameter' });

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchTerm}&search_simple=1&action=process&json=1`
    );
    const data = await response.json();
    res.json(data.products || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from Open Food Facts' });
  }
});

app.listen(port, () => {
  console.log(`App is available on port: ${port}`);
});