# API Endpoints

OpenFoodFacts API usually recommends searching by barcode, but that doesn't help for a typical user so I used their search by term API, which isn't as accurate. 

1. GET `/search-product` : Searches Open Food Facts by product name

2. POST `/favorite` : Saves a product to the Supabase favorites table

3. GET `/favorites` : Returns all saved favorites from Supabase 