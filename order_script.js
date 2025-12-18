document.addEventListener('DOMContentLoaded', async () => {
  // ВСТАВЬ СВОЙ КЛЮЧ:
  const API_KEY = "a0cd61c9-08ca-4666-adc5-cfa927d3e73b";

  const BASE_URL = "https://edu.std-900.ist.mospolytech.ru";
  const DISHES_URL = `${BASE_URL}/labs/api/dishes`;
  const ORDERS_URL = `${BASE_URL}/labs/api/orders`;

  const dishesListContainer = document.getElementById('dishes_list_container');
  const emptyOrderMessage = document.getElementById('empty_order_message');
  const orderSummaryElement = document.getElementById('order_summary');

  const orderForm = document.getElementById('order_form');
  const submitButton = document.getElementById('submit_order_button');

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email'); // ДОБАВИЛИ
  const phoneInput = document.getElementById('number');
  const addressInput = document.getElementById('address');
  const commentInput = document.getElementById('comments');
  const deliveryTimeInput = document.getElementById('delivery_time');

  let allDishesData = [];

  let selectedDishes = {
    soup: null,
    main_dish: null,
    starter: null,
    drink: null,
    dessert: null,
    additive: null
  };

  function normalizeCategory(raw) {
    const c = (raw || '').toLowerCase();
    if (c === 'main_course' || c === 'main' || c === 'maincourse') return 'main_dish';
    if (c === 'salad' || c === 'starter') return 'starter';
    if (c === 'additives' || c === 'additive' || c === 'extra' || c === 'sauce') return 'additive';
    return c;
  }

  function loadSelectedDishIds() {
    try {
      const storedData = localStorage.getItem('selectedDishes');
      return storedData ? JSON.parse(storedData) : {};
    } catch {
      return {};
    }
  }

  function saveSelectedDishes() {
    const idsToStore = {};
    for (const category in selectedDishes) {
      if (selectedDishes[category]) idsToStore[category] = selectedDishes[category].id;
    }
    localStorage.setItem('selectedDishes', JSON.stringify(idsToStore));
  }

  function removeDish(category) {
    selectedDishes[category] = null;
    saveSelectedDishes();
    renderOrderComposition();
    updateOrderSummary();
  }

  function createOrderDishCard(dish) {
    const foodCard = document.createElement('div');
    foodCard.className = 'food_card selected';

    foodCard.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}">
      <section>
        <p>${dish.name}</p>
        <p>${dish.price}₽</p>
        <p style="font-size: 0.9em; font-style: italic;">${dish.count}</p>
      </section>
      <a class="add_to_lunch_button">Удалить</a>
    `;

    foodCard.querySelector('.add_to_lunch_button').addEventListener('click', (e) => {
      e.preventDefault();
      removeDish(dish._category);
    });

    return foodCard;
  }

  function renderOrderComposition() {
    dishesListContainer.innerHTML = '';
    let dishCount = 0;

    const orderedCategories = ['soup', 'main_dish', 'starter', 'drink', 'dessert', 'additive'];
    orderedCategories.forEach(category => {
      const dish = selectedDishes[category];
      if (dish) {
        dishesListContainer.appendChild(createOrderDishCard(dish));
        dishCount++;
      }
    });

    emptyOrderMessage.style.display = dishCount === 0 ? 'block' : 'none';
  }

  function updateOrderSummary() {
    let totalCost = 0;

    const categoryTitles = {
      soup: 'Суп',
      main_dish: 'Главное блюдо',
      starter: 'Салат/стартер',
      drink: 'Напиток',
      dessert: 'Десерт',
      additive: 'Добавки'
    };

    let summaryHTML = '';
    const orderedCategories = ['soup', 'main_dish', 'starter', 'drink', 'dessert', 'additive'];

    orderedCategories.forEach(category => {
      const dish = selectedDishes[category];
      summaryHTML += `<p style="font-weight: bold; margin-top: 10px;">${categoryTitles[category]}</p>`;
      if (dish) {
        summaryHTML += `<p>${dish.name} ${dish.price}₽</p>`;
        totalCost += dish.price;
      } else {
        summaryHTML += `<p style="font-style: italic;">Не выбрано</p>`;
      }
    });

    summaryHTML += `
      <p style="font-weight: bold; margin-top: 20px;">Стоимость заказа</p>
      <p style="font-size: 1.2em; font-weight: bold;">${totalCost}₽</p>
    `;

    orderSummaryElement.innerHTML = summaryHTML;

    // кнопка активна только при валидном комбо
    const validationError = window.checkComboValidity ? window.checkComboValidity(selectedDishes) : "Ошибка валидации";
    submitButton.disabled = validationError !== null;
    submitButton.textContent = validationError === null ? 'Отправить' : `Отправить (Некорректный заказ)`;
  }

  async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
      const msg = data?.error || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  }

  function withKey(url) {
    const u = new URL(url);
    u.searchParams.set("api_key", API_KEY);
    return u.toString();
  }

  function restoreSelectedDishes() {
    const selectedIds = loadSelectedDishIds();
    for (const cat in selectedDishes) selectedDishes[cat] = null;

    allDishesData.forEach(dish => {
      const category = normalizeCategory(dish.category);
      dish._category = category;

      if (selectedIds[category] === dish.id) {
        selectedDishes[category] = dish;
      }
    });
  }

  function buildOrderPayload() {
    const deliveryOption = document.querySelector('input[name="delivery_option"]:checked')?.value;
    const delivery_type = deliveryOption === "specified" ? "by_time" : "now";

    const payload = {
      full_name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      delivery_address: addressInput.value.trim(),
      delivery_type,
      comment: commentInput.value.trim() || null,

      // блюдо/комбо:
      soup_id: selectedDishes.soup?.id ?? null,
      main_course_id: selectedDishes.main_dish?.id ?? null,
      salad_id: selectedDishes.starter?.id ?? null,
      drink_id: selectedDishes.drink?.id ?? null,
      dessert_id: selectedDishes.dessert?.id ?? null,
    };

    // additives — обычно не отдельное поле в API, поэтому не отправляем
    // (Если у вас в методичке есть additive_id — скажи, добавлю)

    if (delivery_type === "by_time") {
      payload.delivery_time = deliveryTimeInput.value; // "HH:MM"
    }

    return payload;
  }

  // ✅ СОЗДАНИЕ ЗАКАЗА В API
  async function createOrder(e) {
    e.preventDefault();

    if (API_KEY === "YOUR_API_KEY") {
      alert("Вставь свой API_KEY в js_files/order_script.js");
      return;
    }

    const validationError = window.checkComboValidity ? window.checkComboValidity(selectedDishes) : "Ошибка валидации";
    if (validationError !== null) {
      alert(`Некорректный заказ: ${validationError}`);
      return;
    }

    const payload = buildOrderPayload();

    // базовая проверка обязательных полей
    const required = ["full_name","email","phone","delivery_address","delivery_type","drink_id"];
    for (const k of required) {
      if (!payload[k]) {
        alert(`Не заполнено обязательное поле: ${k}`);
        return;
      }
    }
    if (payload.delivery_type === "by_time" && !payload.delivery_time) {
      alert("Укажи delivery_time (HH:MM) для доставки ко времени");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Отправка…";

    try {
      const created = await fetchJson(withKey(ORDERS_URL), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      alert("Заказ успешно создан!");

      // очищаем выбранные блюда и переводим в историю
      localStorage.removeItem("selectedDishes");
      window.location.href = "../html_files/orders.html";
    } catch (err) {
      alert(`Ошибка создания заказа: ${err.message}`);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Отправить";
    }
  }

  async function initOrderPage() {
    allDishesData = await fetchJson(DISHES_URL);

    restoreSelectedDishes();
    renderOrderComposition();
    updateOrderSummary();

    orderForm.addEventListener('submit', createOrder);
  }

  initOrderPage();
});
