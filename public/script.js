function goToApp() {
  window.location.href = "app.html";
}

function goToAbout() {
  window.location.href = "about.html";
}

let nutritionChart = null;

/** Parsed rows from OFF_Products.csv (filled on first lookup). */
let offCsvRows = null;

async function lookupCode(productName) {
  const needle = productName.toLowerCase().trim();
  if (!needle) return null;

  if (!offCsvRows) {
    const response = await fetch("OFF_Products.csv");
    const csvText = await response.text();
    const data = Papa.parse(csvText, {
      header: true,
    });
    offCsvRows = data.data;
  }

  const products = offCsvRows;
  const match = products.find((product) => {
    if (!product || !product.code) return false;
    const rowText = Object.values(product)
      .filter((v) => v != null && String(v).trim() !== "")
      .join(" ")
      .toLowerCase();
    return rowText.includes(needle);
  });

  if (match) {
    return match.code;
  } else {
    return null;
  }
}

// Search product + display nutrition info
async function productInfo() {

  const output = document.getElementById("lookup-result");

  const input =
    document.getElementById("input_1").value.trim();

  if (!input) {
    output.innerHTML = "Enter a product name.";
    return;
  }

  output.innerHTML = "Searching...";

  const code = await lookupCode(input);

  if (!code) {
    output.innerHTML = "Product not found.";
    return;
  }

  // Get product details
  const productUrl =
    `https://world.openfoodfacts.org/api/v2/product/${code}`;

  const response = await fetch(productUrl);

  const data = await response.json();

  const item = data.product;

  if (!item) {
    output.innerHTML =
      "Found a code in your CSV, but Open Food Facts has no product data for it.";
    return;
  }

  const nutriments = item.nutriments || {};

  // Display info
  output.innerHTML = `

    <div class="product-display">

      <div class="product-info">

        <img src="${item.image_front_url}" width="220">

        <h2>${item.product_name}</h2>

      </div>

      <div class="product-text">

        <p><strong>Brand:</strong> ${item.brands || "N/A"}</p>

        <p><strong>Calories:</strong>
        ${nutriments["energy-kcal_100g"] || 0} kcal</p>

        <p><strong>Fat:</strong>
        ${nutriments.fat_100g || 0} g</p>

        <p><strong>Sugar:</strong>
        ${nutriments.sugars_100g || 0} g</p>

        <p><strong>Protein:</strong>
        ${nutriments.proteins_100g || 0} g</p>

        <p><strong>Carbs:</strong>
        ${nutriments.carbohydrates_100g || 0} g</p>

        <p><strong>Nutri-Score:</strong>
        ${item.nutrition_grades || "N/A"}</p>

      </div>

    </div>

  `;

  renderChart(item);

}

// Nutrition chart
function renderChart(product) {

  const n = product.nutriments || {};

  const values = [

    Number(n["energy-kcal_100g"]) || 0,

    Number(n.sugars_100g) || 0,

    Number(n.proteins_100g) || 0,

    Number(n.carbohydrates_100g) || 0

  ];

  const barColors = [
    "#b91d47",
    "#00aba9",
    "#2b5797",
    "#e8c3b9",
    "#1e7145"
  ];
  
  const ctx = document.getElementById('myChart');
  
  if (nutritionChart) {
    nutritionChart.destroy();
  }

  nutritionChart = new Chart(ctx, {
    type: "doughnut", 
    data: {
      labels: ["Calories", "Sugar", "Protein", "Carbs"],
      datasets: [{
        backgroundColor: barColors,
        data: values
      }]
    },
    options: {
      plugins: {
        legend: {display:true},
        title: {
          display: true,
            text: product.product_name,
          font: {size:16}
        }
      }
    }
  });

}

// Snack showdown
async function showdown() {

  const output =
    document.getElementById("typed-element");

  output.innerHTML = "Searching...";

  const input1 =
    document.getElementById("input_2").value.trim();

  const input2 =
    document.getElementById("input_3").value.trim();

  if (!input1 || !input2) {

    output.innerHTML =
      "Enter two products.";

    return;
  }

  // Search first product
  const search1 =
    await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${input1}&search_simple=1&action=process&json=1`
    );

  const data1 = await search1.json();

  // Search second product
  const search2 =
    await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${input2}&search_simple=1&action=process&json=1`
    );

  const data2 = await search2.json();

  const product1 = data1.products[0];

  const product2 = data2.products[0];

  if (!product1 || !product2) {

    output.innerHTML =
      "One or both products not found.";

    return;
  }

  const score1 =
    product1.nutrition_grades || "N/A";

  const score2 =
    product2.nutrition_grades || "N/A";

  let winner = "";

  if (score1 < score2) {

    winner =
      `${product1.product_name} is healthier!`;

  } else if (score2 < score1) {

    winner =
      `${product2.product_name} is healthier!`;

  } else {

    winner =
      "Both products are similar.";

  }

  output.innerHTML = `

    <h3>Snack Showdown Results</h3>

    <p>
      <strong>${product1.product_name}</strong>
      — Nutri-Score: ${score1}
    </p>

    <p>
      <strong>${product2.product_name}</strong>
      — Nutri-Score: ${score2}
    </p>

    <h2>${winner}</h2>

  `;

}

// Save favorites
function saveFavorite() {

  const productName =
    document.querySelector(".product-info h2");

  if (!productName) {

    alert("Search for a product first.");

    return;
  }

  const favorites =
    JSON.parse(localStorage.getItem("favorites")) || [];

  favorites.push(productName.innerText);

  localStorage.setItem(
    "favorites",
    JSON.stringify(favorites)
  );

  alert("Saved to favorites!");

}

// Load favorites
function loadFavorites() {

  const grid =
    document.getElementById("favorites-grid");

  const favorites =
    JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {

    grid.innerHTML =
      "<p>No favorites saved.</p>";

    return;
  }

  grid.innerHTML = "";

  favorites.forEach(item => {

    grid.innerHTML += `

      <div class="fav-card">

        <h3>${item}</h3>

      </div>

    `;

  });

}