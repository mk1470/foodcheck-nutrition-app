#Known Bugs

-The search method uses word search trhough the API,but due to limits the same word may create an error and sometimes you need to test the same word multiple times for it to work. 

- There is no duplicate checking any user can save the same product multiple times.

- Product images occasionally return broken URLs from Open Food Facts.


#Future Development
- Add the ability to search using the barcode, since it requires a user and agent realtionship. Users can use the database saved barcodes to compare it with other products. 

- Add a delete API endpoint for favorites so users can remove a favorite if they find they don't want a product anymore. 

- Add duplicate detection before saving.

- Allow user login so favorites are user specific.
