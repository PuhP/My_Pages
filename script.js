// js_files/script.js

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------
    // 1. Инициализация и сортировка данных
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
    
    const selectedDishes = {
        soup: null,
        main_dish: null,
        starter: null,
        drink: null,
        dessert: null,
        additive: null
    };

    allDishes.forEach(dish => {
        if (dishesByCategory[dish.category]) {
            dishesByCategory[dish.category].push(dish);
        }
    });

    // Сортировка блюд в каждой категории по названию (алфавитный порядок)
    for (const category in dishesByCategory) {
        dishesByCategory[category].sort((a, b) => a.name.localeCompare(b.name));
    }

    const orderSummaryElement = document.getElementById('order_summary');
    const orderForm = document.getElementById('order_form');


    // ----------------------------------------------------
    // 2. Настройка фильтров
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
        // additive не требует фильтров
    };

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
    // 3. Функции для динамической генерации HTML и рендеринга блюд
    // ----------------------------------------------------

    /**
     * Создает HTML-карточку блюда.
     */
    function createDishCard(dish) {
        const foodCard = document.createElement('div');
        foodCard.className = 'food_card';
        foodCard.setAttribute('data-dish-keyword', dish.keyword);
        foodCard.setAttribute('data-category', dish.category);
        foodCard.setAttribute('data-kind', dish.kind); 

        foodCard.innerHTML = `
            <img src="../recources/Images/${dish.image}" alt="${dish.name}">
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
            e.stopPropagation(); // Предотвращаем двойное срабатывание от родительского click
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

    // Запуск отображения блюд и фильтров при загрузке
    renderDishes(); 
    
    // ----------------------------------------------------
    // 4. Функции для обработки выбора блюд и расчета стоимости
    // ----------------------------------------------------

    /**
     * Обработчик выбора блюда.
     */
    function handleDishSelection(dish) {
        // Убираем/добавляем блюдо
        if (selectedDishes[dish.category] && selectedDishes[dish.category].keyword === dish.keyword) {
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
            // Сначала убираем подсветку со всех карточек в этой категории
            container.querySelectorAll('.food_card').forEach(card => {
                card.style.border = 'none';
                card.style.boxShadow = '0 0 10px 5px rgba(255, 255, 255, 0.644)'; 
            });

            // Подсвечиваем выбранную карточку
            if (selectedDish) {
                const selectedCard = container.querySelector(`[data-dish-keyword="${selectedDish.keyword}"]`);
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
        let isAnyDishSelected = false;

        const categoryTitles = {
            soup: 'Суп',
            main_dish: 'Главное блюдо',
            starter: 'Салат или стартер',
            drink: 'Напиток',
            dessert: 'Десерт',
            additive: 'Добавки'
        };

        let summaryHTML = '';
        
        // Проверяем, выбрано ли хоть одно блюдо из основных категорий (кроме dessert и additive)
        const essentialCategories = ['soup', 'main_dish', 'starter', 'drink'];
        isAnyDishSelected = essentialCategories.some(cat => selectedDishes[cat] !== null);
        
        const hasAdditives = selectedDishes.additive !== null || selectedDishes.dessert !== null;

        if (!isAnyDishSelected && !hasAdditives) {
            // Если ничего не выбрано, показываем только "Ничего не выбрано"
            summaryHTML = '<p style="font-weight: bold;">Ничего не выбрано</p>';
        } else {
            // Формируем список категорий
            
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
                        summaryHTML += `
                            <p style="font-weight: bold; margin-top: 10px;">${title}</p>
                            <p>${emptyMessage}</p>
                        `;
                    }
                }
            });

            // Дополнительно отображаем Десерт и Добавки, если они выбраны
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

            // Блок итоговой стоимости
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

    /**
     * Проверяет, соответствует ли набор выбранных блюд одному из комбо-вариантов.
     * @returns {string|null} - Текст ошибки или null, если комбо найдено.
     */
    function checkComboValidity() {
        const dishes = selectedDishes;
        const requiredCategories = ['soup', 'main_dish', 'starter', 'drink'];
        
        // Получаем список категорий, которые были выбраны пользователем из ОБЯЗАТЕЛЬНЫХ
        const selectedRequiredCategories = requiredCategories.filter(cat => dishes[cat] !== null);
        
        const hasSoup = dishes.soup !== null;
        const hasMain = dishes.main_dish !== null;
        const hasStarter = dishes.starter !== null;
        const hasDrink = dishes.drink !== null;
        const hasDessertOrAdditive = dishes.dessert !== null || dishes.additive !== null;
        
        // Сценарий 1: Ничего не выбрано (включая dessert/additive)
        if (selectedRequiredCategories.length === 0 && !hasDessertOrAdditive) {
            return 'Ничего не выбрано. Выберите блюда для заказа';
        }
        
        // Сценарий 2: Выбраны все необходимые блюда, кроме напитка
        // Если выбрано что-то из soup/main/starter/dessert/additive, но нет drink.
        if (selectedRequiredCategories.length > 0 && !hasDrink) {
            return 'Выберите напиток';
        }
        
        // Сценарий 5: Выбран только напиток/десерт/добавки (именно только они)
        if (selectedRequiredCategories.length === 1 && hasDrink && !hasSoup && !hasMain && !hasStarter) {
            return 'Выберите главное блюдо';
        }
        if (selectedRequiredCategories.length === 0 && hasDessertOrAdditive) {
            return 'Выберите главное блюдо';
        }
        
        // Проверка соответствия комбо-вариантам
        let comboFound = false;
        
        // Сортируем выбранные категории для точного сравнения с комбо
        const sortedSelected = [...selectedRequiredCategories].sort();
        
        for (const combo of availableCombos) {
            const sortedCombo = [...combo].sort(); 
            
            if (sortedSelected.length === sortedCombo.length && 
                sortedSelected.every((val, index) => val === sortedCombo[index])) {
                comboFound = true;
                break;
            }
        }

        if (comboFound) {
            return null; // Успех
        }
        
        // Если комбо не найдено, проверяем остальные сценарии ошибок, которые могли не сработать выше
        
        // Сценарий 3: Выбран суп, но не выбраны главное блюдо/салат/стартер (Напиток уже есть, т.к. Сценарий 2 отработал)
        if (hasSoup && !hasMain && !hasStarter) {
            return 'Выберите главное блюдо/салат/стартер';
        }
        
        // Сценарий 4: Выбран салат/стартер, но не выбраны суп/главное блюдо (Напиток уже есть)
        if (hasStarter && !hasSoup && !hasMain) {
            return 'Выберите суп или главное блюдо';
        }
        
        // В случае, если все проверки пройдены, но комбо не найдено, это невалидная комбинация,
        // которая должна быть поймана ранее. В качестве запасного варианта:
        if (selectedRequiredCategories.length > 0) {
            // Если выбран напиток, но нет основного блюда, супа или салата (промежуточная невалидная комбинация)
            if (hasDrink && !hasSoup && !hasMain && !hasStarter) {
                return 'Выберите главное блюдо'; // Сценарий 5 (как наиболее приоритетный для минимального заказа)
            }
            // Например, выбраны суп+главное, но нет напитка -> Сценарий 2 (уже отработал)
        }
        
        return null; // Если форма прошла все проверки, но не попала в комбо (может быть ошибка в логике, но для ТЗ возвращаем null)
    }

    /**
     * Создает и отображает модальное окно уведомления.
     */
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
    
    // Перехват отправки формы
    orderForm.addEventListener('submit', (e) => {
        const validationError = checkComboValidity();

        if (validationError) {
            e.preventDefault(); // Предотвращаем отправку формы
            showNotification(validationError); // Показываем уведомление об ошибке
        } else {
            // Комбо валидно, форма отправится на https://httpbin.org/post
            // e.preventDefault(); // Закомментируйте, чтобы проверить отправку на httpbin
        }
    });

    // Инициализация при загрузке: устанавливаем начальное состояние
    updateOrderSummary();
    
    // Перерисовка карточек и фильтров для всех категорий
    Object.keys(dishesByCategory).forEach(category => {
        if (filterConfigs[category] || category === 'additive') {
            renderDishes(category);
        }
    });
});