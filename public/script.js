function goToApp() {
  window.location.href = "app.html";
}

function goToAbout() {
  window.location.href = "about.html";
}

let myChart = null;
let lastProduct = null;
let lastWinner = null;

async function getProductInfo(input) {
  try {
    const response = await fetch(`/search-product?name=${encodeURIComponent(input)}`);
    const products = await response.json();
    let product = products[0];

    if (!product) return null;

    const nutriments = product.nutriments || {};
    return {
      id: product.code || '',
      name: product.product_name || 'Unknown Product',
      brand: product.brands || 'N/A',
      image: product.image_front_url || '',
      calories: nutriments['energy-kcal_100g'] || 0,
      fat: nutriments.fat_100g || 0,
      sugar: nutriments.sugars_100g || 0,
      protein: nutriments.proteins_100g || 0,
      carbs: nutriments.carbohydrates_100g || 0,
      nutriScore: product.nutrition_grades || 'N/A',
      allergens: product.allergens || 'N/A',
      ingredients: product.ingredients_text || 'N/A'
    };
  } catch (error) {
    console.error('Error fetching product info:', error);
    alert('Error fetching product info. Please try again.');
    return null;
  }
}

async function productInfo() {
  const input = document.getElementById("input_1").value.trim();
  const output = document.getElementById("lookup-result");

  if (!input) {
    alert("Please enter a product name.");
    return;
  }

  output.innerHTML = "Searching...";

  const productInfo = await getProductInfo(input);

  if (!productInfo) {
    output.innerHTML = "Product not found.";
    return;
  }

  output.innerHTML = `
    <h2>${productInfo.name}</h2>

    <img src="${productInfo.image}" width="200">

    <p><strong>Brand:</strong> ${productInfo.brand}</p>
    <p><strong>Calories:</strong> ${productInfo.calories} kcal</p>
    <p><strong>Fat:</strong> ${productInfo.fat} g</p>
    <p><strong>Sugar:</strong> ${productInfo.sugar} g</p>
    <p><strong>Protein:</strong> ${productInfo.protein} g</p>
    <p><strong>Carbs:</strong> ${productInfo.carbs} g</p>
    <p><strong>Nutri-Score:</strong> ${productInfo.nutriScore.toUpperCase()}</p>
    <p><strong>Allergens:</strong> ${productInfo.allergens}</p>
    <p><strong>Ingredients:</strong> ${productInfo.ingredients}</p>
  `;

  makeChart(productInfo);
  lastProduct = productInfo;
  document.getElementById('fave-btn').innerHTML = `
    <button onclick='saveFavorite(lastProduct)'>⭐ Save to Favorites</button>`;
  
}

function makeChart(productInfo) {
  if (myChart) {
    myChart.destroy();
    myChart = null;
  }
  const ctx = document.getElementById("myChart");

  myChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Calories", "Sugar", "Protein", "Carbs"],
      datasets: [{
        backgroundColor: ["#2ECC71", "#E74C3C", "#3498DB", "#9B59B6"],
        data: [
          productInfo.calories,
          productInfo.sugar,
          productInfo.protein,
          productInfo.carbs
        ]
      }]
    },
    options: {
      plugins: {
        legend: {
          display: true
        },
        title: {
          display: true,
          text: productInfo.name,
          font: {
            size: 16
          }
        }
      }
    }
  });


}

async function showdown() {
  const input_1 = document.getElementById("input_2").value.trim();
  const input_2 = document.getElementById("input_3").value.trim();
  const output = document.getElementById("typed-element");

  if (!input_1 || !input_2) {
    alert("Please enter both product names.");
    return;
  }

  output.innerHTML = "Comparing...";

  const productInfo_1 = await getProductInfo(input_1);
  const productInfo_2 = await getProductInfo(input_2);

  if (!productInfo_1 || !productInfo_2) {
    output.innerHTML = "Product not found.";
    return;
  }

  let image = "";
  let winner = "";
  let product = null;
  if (productInfo_1.nutriScore > productInfo_2.nutriScore) {
    product = productInfo_1;
    winner = productInfo_1.name;
    image = productInfo_1.image;
  } else if (productInfo_1.nutriScore < productInfo_2.nutriScore) {
    product = productInfo_2;
    winner = productInfo_2.name;
    image = productInfo_2.image;
  } else {
    winner = productInfo_1.name + " and " + productInfo_2.name;
    product = null;
  }

  output.innerHTML = "";
  var typed = new Typed('#typed-element', {
    strings: ["Lets see who the healthier option is is....", `${winner} WON THE SHOWDOWN!`],
    typeSpeed: 35,
    startDelay: 500,
    backDelay: 1000,
    backSpeed: 35,
    smartBackspace: true,
    loop: false,
    onComplete: function() {
      document.getElementById("winner-image").src = image;
      lastWinner = product;
      document.getElementById('fave-btn-2').innerHTML = `<button onclick='saveFavorite(lastWinner)'>⭐ Save to Favorites</button>`;
    }
});

}

async function saveFavorite(productInfo) {
  await fetch(`/favorite`, {
    method: 'POST', 
    body: JSON.stringify({
      name: productInfo.name,
      barcode: productInfo.id,
      image: productInfo.image,
      calories: productInfo.calories,
      sugar: productInfo.sugar,
      protein: productInfo.protein,
      carbs: productInfo.carbs,
      nutri_score: productInfo.nutriScore,
    }),
    headers: {
      'content-type': 'application/json',
    },
  }).then((result) => result.json());

  await loadFavorites();

}
async function loadFavorites() {
  await fetch('/favorites')
  .then((result) => result.json())
  .then((resultJson) => {
    console.log(resultJson);
    const fTable = document.getElementById('favorites-table');
    const table = document.createElement('table');
    table.setAttribute('id', 'favInfo');
    // Setting up table Heading Row
    const tableRow = document.createElement('tr');
    const tableHeadingId = document.createElement('th');
    tableHeadingId.innerHTML = 'Product ID';
    const tableHeadingName = document.createElement('th');
    tableHeadingName.innerHTML = 'Product Name';
    const tableHeadingBarcode = document.createElement('th');
    tableHeadingBarcode.innerHTML = 'Product Barcode';
    const tableHeadingImage = document.createElement('th');
    tableHeadingImage.innerHTML = 'Product Image';
    const tableHeadingCalories = document.createElement('th');
    tableHeadingCalories.innerHTML = 'Product Calories';
    const tableHeadingSugar = document.createElement('th');
    tableHeadingSugar.innerHTML = 'Product Sugar';
    const tableHeadingProtein = document.createElement('th');
    tableHeadingProtein.innerHTML = 'Product Protein';
    const tableHeadingCarbs = document.createElement('th');
    tableHeadingCarbs.innerHTML = 'Product Carbs';
    const tableHeadingNutriScore = document.createElement('th');
    tableHeadingNutriScore.innerHTML = 'Product Nutri-Score';

    tableRow.appendChild(tableHeadingId);
    tableRow.appendChild(tableHeadingName);
    tableRow.appendChild(tableHeadingBarcode);
    tableRow.appendChild(tableHeadingImage);
    tableRow.appendChild(tableHeadingCalories);
    tableRow.appendChild(tableHeadingSugar);
    tableRow.appendChild(tableHeadingProtein);
    tableRow.appendChild(tableHeadingCarbs);
    tableRow.appendChild(tableHeadingNutriScore);


    table.appendChild(tableRow);

    // Adding Data to table
    resultJson.forEach((favorite) => {
      const favTableRow = document.createElement('tr');
      const favTableId = document.createElement('td');
      const favTableName = document.createElement('td');
      const favTableBarcode = document.createElement('td');
      const favTableImage = document.createElement('td');
      const favTableCalories = document.createElement('td');
      const favTableSugar = document.createElement('td');
      const favTableProtein = document.createElement('td');
      const favTableCarbs = document.createElement('td');
      const favTableNutriScore = document.createElement('td');

      favTableId.innerHTML = favorite['id'];
      favTableName.innerHTML = favorite['name'];
      favTableBarcode.innerHTML = favorite['barcode'];
      favTableImage.innerHTML = `<img id="fav-image" src="${favorite['image']}" width="100">`;;
      favTableCalories.innerHTML = favorite['calories'];
      favTableSugar.innerHTML = favorite['sugar'];
      favTableProtein.innerHTML = favorite['protein'];
      favTableCarbs.innerHTML = favorite['carbs'];
      favTableNutriScore.innerHTML = favorite['nutri_score'];
      
      favTableRow.appendChild(favTableId);
      favTableRow.appendChild(favTableName);
      favTableRow.appendChild(favTableBarcode);
      favTableRow.appendChild(favTableImage);
      favTableRow.appendChild(favTableCalories);
      favTableRow.appendChild(favTableSugar);
      favTableRow.appendChild(favTableProtein);
      favTableRow.appendChild(favTableCarbs);
      favTableRow.appendChild(favTableNutriScore);

      table.appendChild(favTableRow);
    });

    const preExistingTable = document.getElementById('favInfo');
    if (preExistingTable) {
      preExistingTable.remove();
    }

    fTable.appendChild(table);
  });
  
}

