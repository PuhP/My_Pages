document.addEventListener('DOMContentLoaded', () => {

  const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';

  let allDishes = [];
  const activeFilters = {};

  const dishesByCategory = {
    soup: [],
    main_dish: [],
    starter: [],
    drink: [],
    dessert: [],
    additive: []
  };

  let selectedDishes = {
    soup: null,
    main_dish: null,
    starter: null,
    drink: null,
    dessert: null,
    additive: null
  };

  const stickyPanel = document.getElementById('sticky_order_panel');
  const orderCostElement = document.getElementById('order_current_cost');
  const checkoutLink = document.getElementById('checkout_link');

  // ✅ нормализация категорий с API
  function normalizeCategory(raw) {
    const c = (raw || '').toLowerCase();

    if (c === 'main_course' || c === 'main' || c === 'maincourse') return 'main_dish';
    if (c === 'salad' || c === 'starter') return 'starter';
    if (c === 'additives' || c === 'additive' || c === 'extra' || c === 'sauce') return 'additive';

    return c; // soup, drink, dessert
  }

  function loadSelectedDishIds() {
    try {
      const storedData = localStorage.getItem('selectedDishes');
      return storedData ? JSON.parse(storedData) : {};
    } catch (e) {
      console.error("Ошибка при загрузке данных из localStorage", e);
      return {};
    }
  }

  function saveSelectedDishes(currentSelectedDishes) {
    const idsToStore = {};
    for (const category in currentSelectedDishes) {
      if (currentSelectedDishes[category]) {
        idsToStore[category] = currentSelectedDishes[category].id;
      }
    }
    try {
      localStorage.setItem('selectedDishes', JSON.stringify(idsToStore));
    } catch (e) {
      console.error("Ошибка при сохранении данных в localStorage", e);
    }
  }

  const filterConfigs = {
    soup: [
      { kind: 'fish', name: 'рыбный' },
      { kind: 'meat', name: 'мясной' },
      { kind: 'veg', name: 'вегетарианский' }
    ],
    main_dish: [
      { kind: 'fish', name: 'рыбное' },
      { kind: 'meat', name: 'мясное' },
      { kind: 'veg', name: 'вегетарианское' }
    ],
    starter: [
      { kind: 'fish', name: 'рыбный' },
      { kind: 'meat', name: 'мясной' },
      { kind: 'veg', name: 'вегетарианский' }
    ],
    drink: [
      { kind: 'cold', name: 'холодный' },
      { kind: 'hot', name: 'горячий' }
    ],
    dessert: [
      { kind: 'small_portion', name: 'маленькая порция' },
      { kind: 'medium_portion', name: 'средняя порция' },
      { kind: 'large_portion', name: 'большая порция' }
    ]
  };

  function createDishCard(dish) {
    const foodCard = document.createElement('div');
    foodCard.className = 'food_card';
    foodCard.setAttribute('data-dish-id', dish.id);
    foodCard.setAttribute('data-category', dish._category);
    foodCard.setAttribute('data-kind', dish.kind);

    const isSelected =
      selectedDishes[dish._category] && selectedDishes[dish._category].id === dish.id;

    if (isSelected) foodCard.classList.add('selected');

    foodCard.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}">
      <section>
        <p>${dish.name}</p>
        <p>${dish.price}₽</p>
        <p style="font-size: 0.9em; font-style: italic;">${dish.count}</p>
      </section>
      <a class="add_to_lunch_button">${isSelected ? 'Удалить' : 'Add to lunch'}</a>
    `;

    const clickHandler = () => handleDishSelection(dish);

    foodCard.addEventListener('click', clickHandler);
    foodCard.querySelector('.add_to_lunch_button').addEventListener('click', (e) => {
      e.stopPropagation();
      clickHandler();
    });

    return foodCard;
  }

  function renderFilters(category) {
    const filtersContainer = document.getElementById(`${category}_filters`);
    if (!filtersContainer) return;

    const filters = filterConfigs[category];
    if (!filters) return;

    filtersContainer.innerHTML = '';

    filters.forEach(filter => {
      const button = document.createElement('a');
      button.href = '#';
      button.className = 'filter-button';
      button.textContent = filter.name;
      button.setAttribute('data-kind', filter.kind);

      if (activeFilters[category] === filter.kind) button.classList.add('active');

      button.addEventListener('click', (e) => {
        e.preventDefault();
        handleFilterClick(category, filter.kind);
      });

      filtersContainer.appendChild(button);
    });
  }

  function renderDishes(singleCategory = null) {
    const containerMap = {
      soup: 'soup_container',
      main_dish: 'main_dish_container',
      starter: 'starter_container',
      drink: 'drink_container',
      dessert: 'dessert_container',
      additive: 'additive_container'
    };

    const categoriesToRender = singleCategory ? [singleCategory] : Object.keys(dishesByCategory);

    categoriesToRender.forEach(category => {
      const container = document.getElementById(containerMap[category]);
      const activeKind = activeFilters[category];

      if (!container) return;

      container.innerHTML = '';

      const filtered = dishesByCategory[category].filter(d => !activeKind || d.kind === activeKind);
      filtered.forEach(dish => container.appendChild(createDishCard(dish)));

      if (filterConfigs[category]) renderFilters(category);
    });
  }

  function handleFilterClick(category, kind) {
    activeFilters[category] = (activeFilters[category] === kind) ? null : kind;
    renderDishes(category);
    renderFilters(category);
  }

  function handleDishSelection(dish) {
    const category = dish._category;

    if (selectedDishes[category] && selectedDishes[category].id === dish.id) {
      selectedDishes[category] = null;
    } else {
      selectedDishes[category] = dish;
    }

    saveSelectedDishes(selectedDishes);
    renderDishes(category);
    updateStickyPanel();
  }

  const availableCombos = [
    ['soup', 'main_dish', 'starter', 'drink'],
    ['soup', 'main_dish', 'drink'],
    ['soup', 'starter', 'drink'],
    ['main_dish', 'starter', 'drink'],
    ['main_dish', 'drink']
  ];

  function checkComboValidity(dishes) {
    const requiredCategories = ['soup', 'main_dish', 'starter', 'drink'];
    const selectedRequired = requiredCategories.filter(cat => dishes[cat] !== null);

    const hasSoup = dishes.soup !== null;
    const hasMain = dishes.main_dish !== null;
    const hasStarter = dishes.starter !== null;
    const hasDrink = dishes.drink !== null;
    const hasDessertOrAdditive = dishes.dessert !== null || dishes.additive !== null;

    if (selectedRequired.length === 0 && !hasDessertOrAdditive) {
      return 'Ничего не выбрано. Выберите блюда для заказа';
    }

    const essentialSelected = hasSoup || hasMain || hasStarter;
    if (essentialSelected && !hasDrink) return 'Выберите напиток';

    if ((hasDrink && !essentialSelected) || (hasDessertOrAdditive && !essentialSelected)) {
      return 'Выберите суп, главное блюдо или салат/стартер для основного заказа';
    }

    const currentComboBase = selectedRequired.filter(c => c !== 'drink').sort();

    const comboBaseFound = availableCombos.some(combo => {
      const comboBase = combo.filter(c => c !== 'drink').sort();
      return comboBase.length === currentComboBase.length &&
        comboBase.every((val, idx) => val === currentComboBase[idx]);
    });

    if (comboBaseFound && hasDrink) return null;

    if (selectedRequired.length > 0) {
      if (hasSoup && !hasMain && !hasStarter && hasDrink) return 'Выберите главное блюдо или салат/стартер';
      if (hasMain && !hasSoup && !hasStarter && hasDrink) return 'Выберите суп или салат/стартер';
      if (hasStarter && !hasSoup && !hasMain && hasDrink) return 'Выберите суп или главное блюдо';
      return 'Некорректная комбинация блюд для заказа';
    }

    return null;
  }

  if (typeof window !== 'undefined') window.checkComboValidity = checkComboValidity;

  function updateStickyPanel() {
    let totalCost = 0;
    let dishCount = 0;

    for (const category in selectedDishes) {
      if (selectedDishes[category]) {
        totalCost += selectedDishes[category].price;
        dishCount++;
      }
    }

    orderCostElement.textContent = `${totalCost}₽`;

    const comboError = checkComboValidity(selectedDishes);

    if (dishCount > 0) {
      stickyPanel.style.display = 'flex';

      if (comboError === null) {
        checkoutLink.classList.remove('disabled');
        checkoutLink.href = '../html_files/order_form.html';
      } else {
        checkoutLink.classList.add('disabled');
        checkoutLink.href = '#';
      }
    } else {
      stickyPanel.style.display = 'none';
    }
  }

  async function loadDishes() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Ошибка при загрузке блюд:', error);
      alert('Не удалось загрузить блюда. Запускай проект через локальный сервер (Live Server).');
      return [];
    }
  }

  function populateAndRenderDishes() {
    for (const cat in dishesByCategory) dishesByCategory[cat] = [];

    const selectedIds = loadSelectedDishIds();
    const newSelected = { soup:null, main_dish:null, starter:null, drink:null, dessert:null, additive:null };

    allDishes.forEach(dish => {
      const category = normalizeCategory(dish.category);
      dish._category = category;

      if (dishesByCategory[category]) {
        dishesByCategory[category].push(dish);

        if (selectedIds[category] === dish.id) {
          newSelected[category] = dish;
        }
      }
    });

    selectedDishes = newSelected;

    for (const category in dishesByCategory) {
      dishesByCategory[category].sort((a, b) => a.name.localeCompare(b.name));
    }

    Object.keys(dishesByCategory).forEach(category => {
      if (filterConfigs[category] || category === 'additive') {
        renderDishes(category);
      }
    });

    updateStickyPanel();
  }

  async function init() {
    allDishes = await loadDishes();

    if (allDishes.length > 0) {
      populateAndRenderDishes();
    } else {
      const message = '<p style="color: white; font-size: 1.5em; text-align: center;">Блюда не загружены.</p>';
      document.getElementById('soup_container').innerHTML = message;
    }
  }

  init();
});
