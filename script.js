// js_files/script.js

document.addEventListener('DOMContentLoaded', () => {
    
    // API URL для загрузки данных
    const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
    
    let allDishes = []; 

    // ----------------------------------------------------
    // 1. Инициализация объектов данных и localStorage
    // ----------------------------------------------------
    
    const activeFilters = {}; 

    const dishesByCategory = {
        soup: [],
        main_dish: [],
        starter: [],
        drink: [],
        dessert: [],
        additive: []
    };
    
    // selectedDishes теперь хранит полные объекты блюд, загруженные по ID из localStorage
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


    /**
     * Загружает выбранные ID блюд из localStorage.
     * Возвращает объект { soup: id, main_dish: id, ... }
     */
    function loadSelectedDishIds() {
        try {
            const storedData = localStorage.getItem('selectedDishes');
            return storedData ? JSON.parse(storedData) : {};
        } catch (e) {
            console.error("Ошибка при загрузке данных из localStorage", e);
            return {};
        }
    }

    /**
     * Сохраняет выбранные ID блюд в localStorage.
     * Принимает объект, где ключи - категории, а значения - полные объекты блюд.
     */
    function saveSelectedDishes(currentSelectedDishes) {
        const idsToStore = {};
        for (const category in currentSelectedDishes) {
            if (currentSelectedDishes[category]) {
                // Храним только ID
                idsToStore[category] = currentSelectedDishes[category].id; 
            }
        }
        try {
            localStorage.setItem('selectedDishes', JSON.stringify(idsToStore));
        } catch (e) {
            console.error("Ошибка при сохранении данных в localStorage", e);
        }
    }

    // ----------------------------------------------------
    // 2. Конфигурация фильтров (без изменений)
    // ----------------------------------------------------
    
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

    // ----------------------------------------------------
    // 3. Функции для динамической генерации HTML и рендеринга блюд
    // ----------------------------------------------------

    /**
     * Создает HTML-карточку блюда.
     */
    function createDishCard(dish) {
        const foodCard = document.createElement('div');
        foodCard.className = 'food_card';
        foodCard.setAttribute('data-dish-id', dish.id);
        foodCard.setAttribute('data-category', dish.category);
        foodCard.setAttribute('data-kind', dish.kind); 

        const isSelected = selectedDishes[dish.category] && selectedDishes[dish.category].id === dish.id;
        
        // Добавление класса для выбранного блюда
        if (isSelected) {
            foodCard.classList.add('selected');
        }

        foodCard.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}">
            <section>
                <p>${dish.name}</p>
                <p>${dish.price}₽</p>
                <p style="font-size: 0.9em; font-style: italic;">${dish.count}</p>
            </section>
            <a class="add_to_lunch_button">${isSelected ? 'Удалить' : 'Add to lunch'}</a>
        `;
        
        const clickHandler = (event) => {
            handleDishSelection(dish);
        };

        foodCard.addEventListener('click', clickHandler);
        foodCard.querySelector('.add_to_lunch_button').addEventListener('click', (e) => {
            e.stopPropagation(); 
            clickHandler(e);
        });
        
        return foodCard;
    }

    /**
     * Отображает блюда на странице, с учетом фильтрации.
     */
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
            const containerId = containerMap[category];
            const container = document.getElementById(containerId);
            const activeKind = activeFilters[category];
            
            if (container) {
                container.innerHTML = '';
                
                const filteredDishes = dishesByCategory[category].filter(dish => {
                    return !activeKind || dish.kind === activeKind; 
                });
                
                filteredDishes.forEach(dish => {
                    const card = createDishCard(dish);
                    container.appendChild(card);
                });

                // При рендеринге карточки сами решают, быть ли им выбранными
            }
            
            if (filterConfigs[category]) {
                renderFilters(category);
            }
        });
    }

    /**
     * Отображает кнопки фильтров.
     */
    function renderFilters(category) {
        const filtersContainer = document.getElementById(`${category}_filters`);
        if (!filtersContainer) return;

        //... (функция renderFilters остается без изменений)
        const filters = filterConfigs[category];
        if (!filters) return;

        filtersContainer.innerHTML = '';

        filters.forEach(filter => {
            const button = document.createElement('a');
            button.href = '#';
            button.className = 'filter-button';
            button.textContent = filter.name;
            button.setAttribute('data-kind', filter.kind);

            if (activeFilters[category] === filter.kind) {
                button.classList.add('active');
            }

            button.addEventListener('click', (e) => {
                e.preventDefault();
                handleFilterClick(category, filter.kind);
            });

            filtersContainer.appendChild(button);
        });
    }

    /**
     * Обрабатывает клик по кнопке фильтра.
     */
    function handleFilterClick(category, kind) {
        const currentActiveFilter = activeFilters[category];
        
        if (currentActiveFilter === kind) {
            activeFilters[category] = null;
        } else {
            activeFilters[category] = kind;
        }

        renderDishes(category);
        renderFilters(category);
    }

    // ----------------------------------------------------
    // 4. Функции для обработки выбора блюд и работы с заказом
    // ----------------------------------------------------

    /**
     * Обработчик выбора блюда.
     */
    function handleDishSelection(dish) {
        const category = dish.category;

        // Если блюдо уже выбрано - удаляем
        if (selectedDishes[category] && selectedDishes[category].id === dish.id) {
             selectedDishes[category] = null;
        } else {
            // Иначе - выбираем новое
             selectedDishes[category] = dish;
        }
       
        // Сохраняем в localStorage
        saveSelectedDishes(selectedDishes);

        // Обновляем UI
        renderDishes(category); // Перерендеринг только одной категории
        updateStickyPanel(); // Обновление липкой панели
    }
    
    /**
     * Обновляет липкую панель (стоимость и доступность ссылки).
     */
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
        
        // Проверка комбо
        const comboValid = checkComboValidity(selectedDishes);
        
        if (dishCount > 0) {
            stickyPanel.style.display = 'flex'; // Показываем панель, если что-то выбрано
            
            if (comboValid === null) {
                checkoutLink.classList.remove('disabled');
                checkoutLink.href = '../html_files/order_form.html';
            } else {
                checkoutLink.classList.add('disabled');
                checkoutLink.href = '#';
            }
        } else {
            stickyPanel.style.display = 'none'; // Скрываем, если ничего не выбрано
        }
    }


    // ----------------------------------------------------
    // 5. Логика проверки комбо (перенесена для использования на обеих страницах)
    // ----------------------------------------------------
    
    const availableCombos = [
        ['soup', 'main_dish', 'starter', 'drink'],
        ['soup', 'main_dish', 'drink'],
        ['soup', 'starter', 'drink'],
        ['main_dish', 'starter', 'drink'],
        ['main_dish', 'drink']
    ];

    /**
     * Проверяет, соответствует ли текущий заказ одному из доступных комбо.
     * Возвращает null, если комбо валидно, или строку с ошибкой.
     */
    function checkComboValidity(dishes) {
        const requiredCategories = ['soup', 'main_dish', 'starter', 'drink'];
        
        const selectedRequiredCategories = requiredCategories.filter(cat => dishes[cat] !== null);
        
        const hasSoup = dishes.soup !== null;
        const hasMain = dishes.main_dish !== null;
        const hasStarter = dishes.starter !== null;
        const hasDrink = dishes.drink !== null;
        const hasDessertOrAdditive = dishes.dessert !== null || dishes.additive !== null;
        
        // Сценарий 1: Ничего не выбрано (панель должна быть скрыта, но на всякий случай)
        if (selectedRequiredCategories.length === 0 && !hasDessertOrAdditive) {
            return 'Ничего не выбрано. Выберите блюда для заказа';
        }
        
        // Сценарий 2: Выбран обязательный компонент, но нет напитка.
        const essentialDishesSelected = hasSoup || hasMain || hasStarter;
        if (essentialDishesSelected && !hasDrink) {
            return 'Выберите напиток'; 
        }

        // Сценарий 3: Выбран только напиток/десерт/добавки 
        if ((hasDrink && !essentialDishesSelected) || (hasDessertOrAdditive && !essentialDishesSelected)) {
            return 'Выберите суп, главное блюдо или салат/стартер для основного заказа';
        }

        // Проверка соответствия комбо-вариантам
        
        // Формируем набор категорий без напитка для проверки
        const currentComboBase = selectedRequiredCategories.filter(c => c !== 'drink').sort();
        
        // Комбо считается валидным, если база соответствует одной из схем, и напиток выбран.
        const comboBaseFound = availableCombos.some(combo => {
            const comboBase = combo.filter(c => c !== 'drink').sort();
            // Сравниваем длины и элементы
            return comboBase.length === currentComboBase.length &&
                   comboBase.every((val, index) => val === currentComboBase[index]);
        });

        if (comboBaseFound && hasDrink) {
            return null; // Успех: Комбо-база найдена И есть напиток
        } 
        
        // Если дошли сюда, и выбрано что-то, но не сработало комбо
        if (selectedRequiredCategories.length > 0) {
             // Дополнительные проверки для более точных сообщений:
             if (hasSoup && !hasMain && !hasStarter && hasDrink) return 'Выберите главное блюдо или салат/стартер';
             if (hasMain && !hasSoup && !hasStarter && hasDrink) return 'Выберите суп или салат/стартер';
             if (hasStarter && !hasSoup && !hasMain && hasDrink) return 'Выберите суп или главное блюдо';
             
             return 'Некорректная комбинация блюд для заказа';
        }
        
        return null;
    }
    
    // Делаем функцию доступной глобально (для order_script, если вы захотите ее использовать)
    if (typeof window !== 'undefined') {
        window.checkComboValidity = checkComboValidity; 
    }


    // ----------------------------------------------------
    // 6. Функция загрузки и инициализации
    // ----------------------------------------------------

    /**
     * Асинхронно загружает данные о блюдах с API.
     */
    async function loadDishes() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка при загрузке блюд:', error);
            alert('Не удалось загрузить данные о блюдах с сервера. Пожалуйста, запустите проект через локальный веб-сервер (например, Live Server в VS Code).');
            return []; 
        }
    }

    /**
     * Заполняет локальные объекты данными, учитывая ранее выбранные блюда.
     */
    function populateAndRenderDishes() {
        // Очищаем предыдущие данные
        for (const cat in dishesByCategory) {
            dishesByCategory[cat] = [];
        }

        const selectedIds = loadSelectedDishIds();

        // 1. Распределение данных по категориям и восстановление selectedDishes
        const newSelectedDishes = {
            soup: null, main_dish: null, starter: null, drink: null, dessert: null, additive: null
        };

        allDishes.forEach(dish => {
            const category = dish.category ? dish.category.toLowerCase() : ''; 

            if (dishesByCategory[category]) {
                dishesByCategory[category].push(dish);
                
                // Если ID блюда был сохранен, восстанавливаем его в selectedDishes
                if (selectedIds[category] === dish.id) {
                    newSelectedDishes[category] = dish;
                }
            }
        });
        
        selectedDishes = newSelectedDishes;

        // 2. Сортировка по имени
        for (const category in dishesByCategory) {
            dishesByCategory[category].sort((a, b) => a.name.localeCompare(b.name));
        }

        // 3. Запуск рендеринга и фильтров
        Object.keys(dishesByCategory).forEach(category => {
            if (filterConfigs[category] || category === 'additive') {
                renderDishes(category);
            }
        });

        // 4. Обновление липкой панели
        updateStickyPanel();
    }

    /**
     * Основная функция инициализации приложения.
     */
    async function init() {
        // Шаг 1: Загрузка данных с API
        allDishes = await loadDishes();
        
        // Шаг 2: Заполнение структур данных и рендеринг
        if (allDishes.length > 0) {
            populateAndRenderDishes(); 
        } else {
             const message = '<p style="color: white; font-size: 1.5em; text-align: center;">Блюда не загружены. Проверьте подключение к интернету и запуск через локальный сервер.</p>';
             document.getElementById('soup_container').innerHTML = message;
        }

        // Важно: На странице "Собрать ланч" нет формы для отправки, 
        // поэтому мы не ставим обработчик на submit.
    }

    // Запускаем инициализацию при загрузке DOM
    init();

});