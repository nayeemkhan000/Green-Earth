const categoryContainer = document.getElementById("category-container");
const plantContainer = document.getElementById("plant-container");
const cartContainer = document.getElementById("cart-container");
const cartTotalPrice = document.getElementById("cart-total-price");

// Fetch Functions
const fetchCategories = async () => {
  const response = await fetch(
    "https://openapi.programming-hero.com/api/categories"
  );
  const data = await response.json();

  return data.categories;
};

const fetchPlants = async (categoryId) => {
  const endPoint = categoryId
    ? `https://openapi.programming-hero.com/api/category/${categoryId}`
    : "https://openapi.programming-hero.com/api/plants";
  const response = await fetch(endPoint);
  const data = await response.json();
  return data.plants;
};

// Render Functions
const renderCategory = (category) => `
 <input
    class="join-item btn justify-start border-none shadow-  bg-green-50 checked:bg-green-800"
    type="radio"
    name="category"
    value="${category.id}"
    aria-label="${category.category_name}"
/>
`;

const renderPlant = (plant) => `
<li class="p-4 bg-white rounded-lg space-y-4 shadow-sm">
    <img
        src="${plant.image}"
        alt="${plant.name}"
        class="aspect-video w-full h-auto object-cover rounded-lg bg-gray-200"
    />

    <div>
      <h4 
        class="text-lg font-bold cursor-pointer"
        onclick="modal_${plant.id}.showModal()"
      >${plant.name}</h4>
      <p>
        ${plant.description.substring(0, 64)}...
      </p>
    </div>

    <div class="flex items-center justify-between">
      <p
        class="bg-green-100 px-4 py-1 w-fit rounded-2xl cursor- text-sm"
      >
        ${plant.category}
      </p>
      <p class="font-bold">
        ৳<span id="price">${plant.price}</span>
      </p>
    </div>  
    <button
      class="btn w-full py-6 bg-green-800 text-white text-  font-normal rounded-3xl hover:bg-green-900 transition-colors duration-500 ease-in-out"
      onclick="addPlantToCart('${JSON.stringify(plant).replace(
        /"/g,
        "&quot;"
      )}')"
    >
      Add to Cart
    </button>
</li>

<dialog id="modal_${plant.id}" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>

    <div class="space-y-4">
      <h4 
        class="text-lg font-bold cursor-pointer"
        onclick="modal_${plant.id}.showModal()"
      >
        ${plant.name}
      </h4>
      <img
        src="${plant.image}"
        alt="${plant.name}"
        class="aspect-video object-cover rounded-lg bg-gray-200"
      />
      <p>
        <span class="font-bold">Category: </span> ${plant.category}
      </p>
      <p>
        <span class="font-bold">Price: </span> ${plant.price}
      </p>
      <p>
        <span class="font-bold">Description: </span> ${plant.description}
      </p>
    </div>
   
  </div>
</dialog>
`;

const renderCartItem = (plant) => `
<li
  class="flex items-center justify-between p-4 bg-green-100 rounded-md"
  data-name="${plant.name}"
  data-price="${plant.price}"
>
    <div>
        <h5 class="font-bold text-lg">${plant.name}</h5>
        <p>৳${plant.price} x 1</p>
    </div>
    <button class="cursor-pointer" onclick="removeParent(this)">
      ✕
    </button>
</li>
`;

const renderLoader = () => `
<span
  class="col-span-full loading loading-dots loading-xl mx-auto"
></span>
`;

// Helper Functions
const renderElements = (items, renderFunction) => {
  const renderedElements = items.map((item) => renderFunction(item));
  return renderedElements.join("");
};

const renderElementAndAppendToParent = (
  renderData,
  renderFunction,
  parentElement
) => {
  parentElement.innerHTML += renderFunction(renderData);
};

const renderElementsAndAppendToParent = async (
  itemsOrFetcher,
  renderFunction,
  parentElement
) => {
  const loader = renderLoader();
  parentElement.innerHTML += loader;
  const items =
    typeof itemsOrFetcher === "function"
      ? await itemsOrFetcher()
      : itemsOrFetcher;
  const renderedElements = renderElements(items, renderFunction);
  parentElement.querySelector(".loading")?.remove();
  parentElement.innerHTML += renderedElements;
};

const renderElementsAndAddToParent = async (
  itemsOrFetcher,
  renderFunction,
  parentElement
) => {
  const loader = renderLoader();
  parentElement.innerHTML = loader;
  const items =
    typeof itemsOrFetcher === "function"
      ? await itemsOrFetcher()
      : itemsOrFetcher;
  const renderedElements = renderElements(items, renderFunction);
  parentElement.innerHTML = renderedElements;
};

// Functions Bound to Logic in HTML
const addPlantToCart = (plant) => {
  const parsedPlant = JSON.parse(plant);
  renderElementAndAppendToParent(parsedPlant, renderCartItem, cartContainer);
  const currentPrice = Number(cartTotalPrice.innerHTML);
  cartTotalPrice.textContent = currentPrice + parsedPlant.price;
  alert(`Added ${parsedPlant.name} to the Cart`);
};

const removePlantFromCart = (name, price) => {
  const currentPrice = Number(cartTotalPrice.innerHTML);
  cartTotalPrice.textContent = currentPrice - price;
  alert(`Removed ${name} from the Cart`);
};

const removeParent = (self) => {
  const parent = self.parentElement;
  const name = parent.dataset.name;
  const price = parent.dataset.price;
  removePlantFromCart(name, price);
  parent.remove();
  // parent.classList.add("opacity-0", "transition", "duration-200");
  // parent.addEventListener("transitionend", () => parent.remove(), {
  //   once: true,
  // });
};

// App Initialization
const initApp = async () => {
  // Fetch and Render Plants
  await renderElementsAndAddToParent(fetchPlants, renderPlant, plantContainer);
  // Fetch and Render Categories
  await renderElementsAndAppendToParent(
    fetchCategories,
    renderCategory,
    categoryContainer
  );
};

initApp();

// Event Listeners
categoryContainer.addEventListener("click", async (e) => {
  const target = e.target;
  switch (target.type) {
    case "radio":
      const categoryId = target.value;
      const plants = await fetchPlants(categoryId);
      renderElementsAndAddToParent(plants, renderPlant, plantContainer);
      break;

    default:
      break;
  }
});
