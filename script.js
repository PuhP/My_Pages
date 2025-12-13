// js_files/script.js

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Инициализация и сортировка данных
    // ----------------------------------------------------

    // Объект для хранения выбранных фильтров
    const activeFilters = {}; 

    // Разделение блюд по категориям и сортировка
    const dishesByCategory = {
        soup: [],
        main_dish: [],
        starter: [], // Новая категория
        drink: [],
        dessert: [], // Новая категория
        additive: []
    };
    
    // Объект для хранения выбранных блюд
    const selectedDishes = {
        soup: null,
        main_dish: null,
        starter: null, // Новая категория
        drink: null,
        dessert: null, // Новая категория
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
        ],
        // additive не требует фильтров
    };

    /**
     * Создает и отображает кнопки фильтров для заданной категории.
     * @param {string} category - Название категории (например, 'soup').
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
     * @param {string} category - Название категории.
     * @param {string} kind - Значение data-kind.
     */
    function handleFilterClick(category, kind) {
        const currentActiveFilter = activeFilters[category];
        
        if (currentActiveFilter === kind) {
            // Если кликнули по активному фильтру, деактивируем его
            activeFilters[category] = null;
        } else {
            // Активируем новый фильтр
            activeFilters[category] = kind;
        }

        // Обновляем рендеринг карточек и фильтров
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
        foodCard.setAttribute('data-kind', dish.kind); // Добавляем kind

        foodCard.innerHTML = `
            <img src="../recources/Images/${dish.image}" alt="${dish.name}">
            <section>
                <p>${dish.name}</p>
                <p>${dish.price}₽</p>
                <p style="font-size: 0.9em; font-style: italic;">${dish.count}</p>
            </section>
            <a class="add_to_lunch_button">Add to lunch</a>
        `;
        
        // Добавление обработчика клика
        const clickHandler = (event) => {
            // Избегаем двойного срабатывания
            if (event.target.tagName !== 'A' || event.target.classList.contains('add_to_lunch_button')) {
                handleDishSelection(dish);
            }
        };

        foodCard.addEventListener('click', clickHandler);
        foodCard.querySelector('.add_to_lunch_button').addEventListener('click', clickHandler);
        
        return foodCard;
    }

    /**
     * Отображает блюда на странице в соответствующих контейнерах, с учетом фильтрации.
     * @param {string|null} singleCategory - Категория для перерисовки, или null для всех.
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

                // Перезапуск подсветки для данной категории
                highlightSelectedCard(category);
            }
            
            // Рендеринг фильтров (если это не additive)
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
        // Проверяем, если блюдо уже выбрано, то убираем его (повторный клик)
        if (selectedDishes[dish.category] && selectedDishes[dish.category].keyword === dish.keyword) {
             selectedDishes[dish.category] = null;
        } else {
             // Иначе выбираем новое блюдо в этой категории
             selectedDishes[dish.category] = dish;
        }
       
        updateOrderSummary();
        highlightSelectedCard(dish.category);
    }

    /**
     * Подсвечивает выбранную карточку в категории.
     * @param {string} category - Категория блюда.
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
                card.style.boxShadow = '0 0 10px 5px rgba(255, 255, 255, 0.644)'; // Возвращаем обычную тень
            });

            // Подсвечиваем выбранную карточку
            if (selectedDish) {
                const selectedCard = container.querySelector(`[data-dish-keyword="${selectedDish.keyword}"]`);
                if (selectedCard) {
                    // Используем CSS-класс для подсветки, если он есть, или инлайновые стили
                    selectedCard.style.border = '3px solid rgb(231, 43, 43)'; // Красная рамка
                    selectedCard.style.boxShadow = '0 0 15px 7px rgba(231, 43, 43, 0.8)'; // Усиленная тень
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

        // Определения заголовков категорий на русском
        const categoryTitles = {
            soup: 'Суп',
            main_dish: 'Главное блюдо',
            starter: 'Салат или стартер',
            drink: 'Напиток',
            dessert: 'Десерт',
            additive: 'Добавки'
        };

        let summaryHTML = '';
        
        // Проверяем, выбрано ли хоть одно блюдо (кроме additive)
        for (const category in selectedDishes) {
            if (selectedDishes[category] && category !== 'additive') {
                isAnyDishSelected = true;
                break;
            }
        }
        
        // Добавки считаем, но не используем для определения "Ничего не выбрано"
        if (!isAnyDishSelected && !selectedDishes.additive) {
            // Если ничего не выбрано, показываем только "Ничего не выбрано"
            summaryHTML = '<p style="font-weight: bold;">Ничего не выбрано</p>';
        } else {
            // Если выбрано хотя бы одно блюдо, формируем список категорий
            
            // Категории, которые всегда отображаются в списке заказа
            const requiredCategories = ['soup', 'main_dish', 'starter', 'drink', 'dessert'];
            
            requiredCategories.forEach(category => {
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

                    summaryHTML += `
                        <p style="font-weight: bold; margin-top: 10px;">${title}</p>
                        <p>${emptyMessage}</p>
                    `;
                }
            });

            // Дополнительно отображаем Добавки, если они выбраны
            if (selectedDishes.additive) {
                const dish = selectedDishes.additive;
                summaryHTML += `
                    <p style="font-weight: bold; margin-top: 10px;">${categoryTitles.additive}</p>
                    <p>${dish.name} ${dish.price}₽</p>
                `;
                totalCost += dish.price;
            }

            // Блок итоговой стоимости
            summaryHTML += `
                <p style="font-weight: bold; margin-top: 20px;">Стоимость заказа</p>
                <p style="font-size: 1.2em; font-weight: bold;">${totalCost}₽</p>
            `;
        }

        // Обновляем DOM
        orderSummaryElement.innerHTML = summaryHTML;
    }

    // Инициализация при загрузке: устанавливаем начальное состояние
    updateOrderSummary();
    
    // Перерисовка карточек и фильтров для всех категорий
    Object.keys(dishesByCategory).forEach(category => {
        if (filterConfigs[category]) {
            renderFilters(category);
        }
    });

});