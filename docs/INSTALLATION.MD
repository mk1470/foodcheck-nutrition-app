# Installation

Step 1: Head to the repositiory link and clone it -   https://github.com/mk1470/foodcheck-nutrition-app.git

Step 2:Install the dependces - 
npm install

Step 3: Create a supabase account and generate SUPABASE_URL, SUPABASE_KEY

Step 4: Create your own .env file and copt and paste the keys

Step 5: Supabase table should have these fields - 
Table name : favorites
Table columns: 
  id SERIAL PRIMARY KEY,
  barcode TEXT NOT NULL,
  name TEXT,
  image TEXT,
  calories NUMERIC,
  sugar NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  nutri_score TEXT

Step 6: Get to running [link](docs/RUNNING.MD)