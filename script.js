// js_files/script.js

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Инициализация и сортировка данных
    // ----------------------------------------------------

    // Разделение блюд по категориям и сортировка
    const dishesByCategory = {
        soup: [],
        main_dish: [],
        drink: [],
        additive: []
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

    // Объект для хранения выбранных блюд
    const selectedDishes = {
        soup: null,
        main_dish: null,
        drink: null,
        additive: null
    };

    const orderSummaryElement = document.getElementById('order_summary');


    // ----------------------------------------------------
    // 2. Функции для динамической генерации HTML
    // ----------------------------------------------------

    /**
     * Создает HTML-карточку блюда.
     * @param {object} dish - Объект блюда из массива allDishes.
     * @returns {HTMLElement} - Элемент food_card.
     */
    function createDishCard(dish) {
        const foodCard = document.createElement('div');
        foodCard.className = 'food_card';
        // Установка data-атрибута
        foodCard.setAttribute('data-dish-keyword', dish.keyword);
        foodCard.setAttribute('data-category', dish.category);

        foodCard.innerHTML = `
            <img src="../recources/Images/${dish.image}" alt="${dish.name}">
            <section>
                <p>${dish.name}</p>
                <p>${dish.price}rub.</p>
                <p style="font-size: 0.9em; font-style: italic;">${dish.count}</p>
            </section>
            <a class="add_to_lunch_button">Add to lunch</a>
        `;
        
        // Добавление обработчика клика
        foodCard.querySelector('.add_to_lunch_button').addEventListener('click', () => handleDishSelection(dish));
        foodCard.addEventListener('click', (event) => {
            // Предотвращаем срабатывание, если клик был по кнопке, так как уже есть обработчик
            if (event.target.tagName !== 'A') {
                handleDishSelection(dish);
            }
        });
        
        return foodCard;
    }

    /**
     * Отображает блюда на странице в соответствующих контейнерах.
     */
    function renderDishes() {
        const containerMap = {
            soup: 'soup_container',
            main_dish: 'main_dish_container',
            drink: 'drink_container',
            additive: 'additive_container'
        };

        for (const category in dishesByCategory) {
            const containerId = containerMap[category];
            const container = document.getElementById(containerId);

            if (container) {
                // Очистка контейнера перед вставкой
                container.innerHTML = '';
                
                dishesByCategory[category].forEach(dish => {
                    const card = createDishCard(dish);
                    container.appendChild(card);
                });
            }
        }
    }

    // Запуск отображения блюд при загрузке
    renderDishes();


    // ----------------------------------------------------
    // 3. Функции для обработки выбора блюд и расчета стоимости
    // ----------------------------------------------------

    /**
     * Обработчик выбора блюда.
     * @param {object} dish - Объект выбранного блюда.
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
        highlightSelectedCard(dish.category, dish.keyword);
    }

    /**
     * Подсвечивает выбранную карточку в категории.
     * @param {string} category - Категория блюда.
     * @param {string} keyword - Уникальный keyword выбранного блюда.
     */
    function highlightSelectedCard(category, keyword) {
        const containerMap = {
            soup: 'soup_container',
            main_dish: 'main_dish_container',
            drink: 'drink_container',
            additive: 'additive_container'
        };
        const container = document.getElementById(containerMap[category]);

        if (container) {
            // Сначала убираем подсветку со всех карточек в этой категории
            container.querySelectorAll('.food_card').forEach(card => {
                card.style.border = 'none';
                card.style.boxShadow = '0 0 10px 5px rgba(255, 255, 255, 0.644)'; // Возвращаем обычную тень
            });

            // Подсвечиваем выбранную карточку
            if (selectedDishes[category]) {
                const selectedCard = container.querySelector(`[data-dish-keyword="${selectedDishes[category].keyword}"]`);
                if (selectedCard) {
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
            drink: 'Напиток',
            additive: 'Добавки'
        };

        let summaryHTML = '';

        // Проверяем, выбрано ли хоть одно блюдо
        for (const category in selectedDishes) {
            if (selectedDishes[category]) {
                isAnyDishSelected = true;
                break;
            }
        }

        if (!isAnyDishSelected) {
            // Если ничего не выбрано, показываем только "Ничего не выбрано"
            summaryHTML = '<p style="font-weight: bold;">Ничего не выбрано</p>';
        } else {
            // Если выбрано хотя бы одно блюдо, формируем список категорий
            for (const category in selectedDishes) {
                const dish = selectedDishes[category];
                const title = categoryTitles[category];

                if (dish) {
                    summaryHTML += `
                        <p style="font-weight: bold; margin-top: 10px;">${title}</p>
                        <p>${dish.name} ${dish.price}₽</p>
                    `;
                    totalCost += dish.price;
                } else {
                    // Специальные сообщения для пустых категорий
                    let emptyMessage = 'Блюдо не выбрано';
                    if (category === 'drink') {
                        emptyMessage = 'Напиток не выбран';
                    } else if (category === 'additive') {
                        emptyMessage = 'Добавка не выбрана';
                    }

                    summaryHTML += `
                        <p style="font-weight: bold; margin-top: 10px;">${title}</p>
                        <p>${emptyMessage}</p>
                    `;
                }
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

    // Инициализация при загрузке: устанавливаем начальное состояние "Ничего не выбрано"
    updateOrderSummary();
});