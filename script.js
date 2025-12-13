// js_files/script.js

document.addEventListener('DOMContentLoaded', () => {
    
    // API URL для загрузки данных (Требование ЛР 7)
    const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
    
    let allDishes = []; 

    // ----------------------------------------------------
    // 1. Инициализация объектов данных
    // ----------------------------------------------------

    const activeFilters = {}; 

    // Объекты для разделения данных
    const dishesByCategory = {
        soup: [],
        main_dish: [],
        starter: [],
        drink: [],
        dessert: [],
        additive: []
    };
    
    const selectedDishes = {
        soup: null,
        main_dish: null,
        starter: null,
        drink: null,
        dessert: null,
        additive: null
    };

    const orderSummaryElement = document.getElementById('order_summary');
    const orderForm = document.getElementById('order_form');

    // ----------------------------------------------------
    // 2. Конфигурация фильтров
    // ----------------------------------------------------
    // Фильтры оставлены на случай, если API не возвращает 'kind'
    // или для будущей кастомизации.
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
     * Использует dish.image для пути, который возвращает API (полный URL)
     */
    function createDishCard(dish) {
        const foodCard = document.createElement('div');
        foodCard.className = 'food_card';
        // Используем 'id' из API для уникальной идентификации
        foodCard.setAttribute('data-dish-id', dish.id);
        foodCard.setAttribute('data-category', dish.category);
        foodCard.setAttribute('data-kind', dish.kind); 

        // Использование URL изображения из API
        foodCard.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}">
            <section>
                <p>${dish.name}</p>
                <p>${dish.price}₽</p>
                <p style="font-size: 0.9em; font-style: italic;">${dish.count}</p>
            </section>
            <a class="add_to_lunch_button">Add to lunch</a>
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
     * Отображает блюда на странице в соответствующих контейнерах, с учетом фильтрации.
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
                
                // Фильтрация блюд
                const filteredDishes = dishesByCategory[category].filter(dish => {
                    // Используем kind из данных API (если есть) или из filterConfigs (для кастомизации)
                    return !activeKind || dish.kind === activeKind; 
                });
                
                filteredDishes.forEach(dish => {
                    const card = createDishCard(dish);
                    container.appendChild(card);
                });

                highlightSelectedCard(category);
            }
            
            if (filterConfigs[category]) {
                renderFilters(category);
            }
        });
    }

    /**
     * Создает и отображает кнопки фильтров для заданной категории.
     */
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
    // 4. Функции для обработки выбора блюд и расчета стоимости
    // ----------------------------------------------------

    /**
     * Обработчик выбора блюда.
     */
    function handleDishSelection(dish) {
        // Используем 'id' для сравнения (уникальный ключ из API)
        if (selectedDishes[dish.category] && selectedDishes[dish.category].id === dish.id) {
             selectedDishes[dish.category] = null;
        } else {
             selectedDishes[dish.category] = dish;
        }
       
        updateOrderSummary();
        highlightSelectedCard(dish.category);
    }

    /**
     * Подсвечивает выбранную карточку в категории.
     */
    function highlightSelectedCard(category) {
        const containerMap = {
            soup: 'soup_container',
            main_dish: 'main_dish_container',
            starter: 'starter_container',
            drink: 'drink_container',
            dessert: 'dessert_container',
            additive: 'additive_container'
        };
        const container = document.getElementById(containerMap[category]);
        const selectedDish = selectedDishes[category];

        if (container) {
            container.querySelectorAll('.food_card').forEach(card => {
                card.style.border = 'none';
                card.style.boxShadow = '0 0 10px 5px rgba(255, 255, 255, 0.644)'; 
            });

            if (selectedDish) {
                // Используем 'id' для поиска выбранной карточки
                const selectedCard = container.querySelector(`[data-dish-id="${selectedDish.id}"]`);
                if (selectedCard) {
                    selectedCard.style.border = '3px solid rgb(231, 43, 43)'; 
                    selectedCard.style.boxShadow = '0 0 15px 7px rgba(231, 43, 43, 0.8)'; 
                }
            }
        }
    }


    /**
     * Обновляет HTML-код раздела "Ваш заказ" и пересчитывает стоимость.
     */
    function updateOrderSummary() {
        let totalCost = 0;

        const categoryTitles = {
            soup: 'Суп',
            main_dish: 'Главное блюдо',
            starter: 'Салат или стартер',
            drink: 'Напиток',
            dessert: 'Десерт',
            additive: 'Добавки'
        };

        let summaryHTML = '';
        
        const essentialCategories = ['soup', 'main_dish', 'starter', 'drink'];
        const isAnyDishSelected = essentialCategories.some(cat => selectedDishes[cat] !== null);
        const hasAdditives = selectedDishes.additive !== null || selectedDishes.dessert !== null;

        if (!isAnyDishSelected && !hasAdditives) {
            summaryHTML = '<p style="font-weight: bold;">Ничего не выбрано</p>';
        } else {
            
            essentialCategories.forEach(category => {
                const dish = selectedDishes[category];
                const title = categoryTitles[category];
                
                if (dish) {
                    summaryHTML += `
                        <p style="font-weight: bold; margin-top: 10px;">${title}</p>
                        <p>${dish.name} ${dish.price}₽</p>
                    `;
                    totalCost += dish.price;
                } else {
                    let emptyMessage = category === 'drink' ? 'Напиток не выбран' : 'Блюдо не выбрано';
                    if (category === 'starter' || category === 'main_dish' || category === 'soup') {
                        // Оставляем пустые строки только для тех, что могут участвовать в комбо
                        summaryHTML += `
                            <p style="font-weight: bold; margin-top: 10px;">${title}</p>
                            <p>${emptyMessage}</p>
                        `;
                    }
                }
            });

            const optionalCategories = ['dessert', 'additive'];
            optionalCategories.forEach(category => {
                const dish = selectedDishes[category];
                const title = categoryTitles[category];
                if (dish) {
                    summaryHTML += `
                        <p style="font-weight: bold; margin-top: 10px;">${title}</p>
                        <p>${dish.name} ${dish.price}₽</p>
                    `;
                    totalCost += dish.price;
                }
            });

            summaryHTML += `
                <p style="font-weight: bold; margin-top: 20px;">Стоимость заказа</p>
                <p style="font-size: 1.2em; font-weight: bold;">${totalCost}₽</p>
            `;
        }

        orderSummaryElement.innerHTML = summaryHTML;
    }


    // ----------------------------------------------------
    // 5. Логика проверки комбо и уведомлений
    // ----------------------------------------------------

    // Массив доступных комбо-вариантов (только обязательные категории)
    const availableCombos = [
        ['soup', 'main_dish', 'starter', 'drink'],
        ['soup', 'main_dish', 'drink'],
        ['soup', 'starter', 'drink'],
        ['main_dish', 'starter', 'drink'],
        ['main_dish', 'drink']
    ];

    function checkComboValidity() {
        const dishes = selectedDishes;
        const requiredCategories = ['soup', 'main_dish', 'starter', 'drink'];
        
        const selectedRequiredCategories = requiredCategories.filter(cat => dishes[cat] !== null);
        
        const hasSoup = dishes.soup !== null;
        const hasMain = dishes.main_dish !== null;
        const hasStarter = dishes.starter !== null;
        const hasDrink = dishes.drink !== null;
        const hasDessertOrAdditive = dishes.dessert !== null || dishes.additive !== null;
        
        // Сценарий 1: Ничего не выбрано
        if (selectedRequiredCategories.length === 0 && !hasDessertOrAdditive) {
            return 'Ничего не выбрано. Выберите блюда для заказа';
        }
        
        // Сценарий 2: Выбран обязательный компонент (суп/главное/салат/стартер/десерт/добавка), но нет напитка.
        const essentialDishesSelected = hasSoup || hasMain || hasStarter || hasDessertOrAdditive;
        if (essentialDishesSelected && !hasDrink && (hasSoup || hasMain || hasStarter)) {
            // Если выбран суп, главное или стартер, напиток обязателен.
            return 'Выберите напиток'; 
        }

        // Сценарий 3: Выбран только напиток/десерт/добавки 
        if (hasDrink && !hasSoup && !hasMain && !hasStarter) {
            return 'Выберите суп, главное блюдо или салат/стартер для основного заказа';
        }
        if (selectedRequiredCategories.length === 0 && hasDessertOrAdditive) {
            return 'Выберите суп, главное блюдо или салат/стартер для основного заказа';
        }
        
        // Проверка соответствия комбо-вариантам
        
        // Формируем набор категорий без напитка для проверки
        const currentComboBase = selectedRequiredCategories.filter(c => c !== 'drink').sort();

        // Проверяем, соответствует ли база комбо одному из доступных
        const comboBaseFound = availableCombos.some(combo => {
            const comboBase = combo.filter(c => c !== 'drink').sort();
            return comboBase.length === currentComboBase.length &&
                   comboBase.every((val, index) => val === comboBase[index]);
        });

        if (comboBaseFound && hasDrink) {
            return null; // Успех: Комбо-база найдена И есть напиток
        } 
        
        if (currentComboBase.length === 0 && (hasDessertOrAdditive || hasDrink)) {
            return 'Выберите суп, главное блюдо или салат/стартер для основного заказа';
        }

        // Если дошли сюда, то выбрана некорректная комбинация (например, только суп + напиток)
        
        if (hasSoup && !hasMain && !hasStarter && hasDrink) {
            return 'Выберите главное блюдо или салат/стартер';
        }
        
        if (hasStarter && !hasSoup && !hasMain && hasDrink) {
            return 'Выберите суп или главное блюдо';
        }
        
        // Последний общий сбой, если не попадает ни в одно правило выше
        if (selectedRequiredCategories.length > 0) {
             return 'Некорректная комбинация блюд для заказа';
        }
        
        return null;
    }

    function showNotification(message) {
        if (document.querySelector('.notification-overlay')) {
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';

        const box = document.createElement('div');
        box.className = 'notification-box';

        const title = document.createElement('h3');
        title.textContent = message;

        const button = document.createElement('a');
        button.href = '#';
        button.className = 'notification-button';
        button.innerHTML = 'Окей <span role="img" aria-label="OK">👌</span>';

        button.addEventListener('click', (e) => {
            e.preventDefault();
            overlay.remove(); 
        });

        box.appendChild(title);
        box.appendChild(button);
        overlay.appendChild(box);

        document.body.appendChild(overlay);
    }

    // ----------------------------------------------------
    // 6. Функция загрузки и инициализации (Требование ЛР 7)
    // ----------------------------------------------------

    /**
     * Асинхронно загружает данные о блюдах с API.
     */
    async function loadDishes() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                // Если статус 4xx/5xx
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка при загрузке блюд:', error);
            showNotification('Не удалось загрузить данные о блюдах с сервера. Пожалуйста, запустите проект через **локальный веб-сервер** (например, Live Server в VS Code).');
            return []; 
        }
    }

    /**
     * Заполняет локальные объекты данными и запускает рендеринг.
     */
    function populateAndRenderDishes() {
        // Очищаем предыдущие данные
        for (const cat in dishesByCategory) {
            dishesByCategory[cat] = [];
        }

        // Распределение данных по категориям
        allDishes.forEach(dish => {
            // Приводим категорию к нижнему регистру, если API отдает с разным регистром
            const category = dish.category ? dish.category.toLowerCase() : ''; 

            if (dishesByCategory[category]) {
                dishesByCategory[category].push(dish);
            }
        });

        // Сортировка по имени
        for (const category in dishesByCategory) {
            dishesByCategory[category].sort((a, b) => a.name.localeCompare(b.name));
        }

        // Запуск рендеринга и фильтров
        Object.keys(dishesByCategory).forEach(category => {
            if (filterConfigs[category] || category === 'additive') {
                renderDishes(category);
            }
        });

        // Обновление сводки заказа
        updateOrderSummary();
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
             // Если данные не загрузились
             document.getElementById('soup_container').innerHTML = '<p style="color: white; font-size: 1.5em;">Блюда не загружены. Проверьте подключение к интернету и запуск через локальный сервер.</p>';
        }

        // Шаг 3: Настройка обработчика формы
        orderForm.addEventListener('submit', (e) => {
            const validationError = checkComboValidity();
            if (validationError) {
                e.preventDefault(); 
                showNotification(validationError); 
            } else {
                console.log("Комбо валидно, форма будет отправлена.");
            }
        });
    }

    // Запускаем инициализацию при загрузке DOM
    init();

});