// js_files/order_script.js

document.addEventListener('DOMContentLoaded', async () => {
    
    // API URL для загрузки данных (Должен быть тот же, что и в script.js)
    const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
    
    const dishesListContainer = document.getElementById('dishes_list_container');
    const emptyOrderMessage = document.getElementById('empty_order_message');
    const orderSummaryElement = document.getElementById('order_summary');
    const orderForm = document.getElementById('order_form');
    const submitButton = document.getElementById('submit_order_button');

    let allDishesData = [];
    
    // selectedDishes: { category: dish_object, ... }
    let selectedDishes = {
        soup: null,
        main_dish: null,
        starter: null,
        drink: null,
        dessert: null,
        additive: null
    };

    // ----------------------------------------------------
    // 1. Утилиты для localStorage
    // ----------------------------------------------------

    /**
     * Загружает выбранные ID блюд из localStorage.
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
     */
    function saveSelectedDishes() {
        const idsToStore = {};
        for (const category in selectedDishes) {
            if (selectedDishes[category]) {
                idsToStore[category] = selectedDishes[category].id; 
            }
        }
        try {
            localStorage.setItem('selectedDishes', JSON.stringify(idsToStore));
        } catch (e) {
            console.error("Ошибка при сохранении данных в localStorage", e);
        }
    }
    
    /**
     * Удаляет блюдо из заказа и обновляет UI.
     */
    function removeDish(category) {
        selectedDishes[category] = null;
        saveSelectedDishes();
        
        // Перерендеринг всего
        renderOrderComposition();
        updateOrderSummary();
    }

    // ----------------------------------------------------
    // 2. Рендеринг и логика страницы "Оформить заказ"
    // ----------------------------------------------------

    /**
     * Создает HTML-карточку блюда для страницы "Оформить заказ".
     */
    function createOrderDishCard(dish) {
        const foodCard = document.createElement('div');
        foodCard.className = 'food_card selected'; // Все выбранные
        foodCard.setAttribute('data-dish-id', dish.id);
        foodCard.setAttribute('data-category', dish.category);
        
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
            e.stopPropagation(); 
            removeDish(dish.category);
        });
        
        return foodCard;
    }


    /**
     * Рендерит список выбранных блюд в разделе "Состав заказа".
     */
    function renderOrderComposition() {
        dishesListContainer.innerHTML = '';
        let dishCount = 0;
        
        // Перебираем категории в нужном порядке
        const orderedCategories = ['soup', 'main_dish', 'starter', 'drink', 'dessert', 'additive'];

        orderedCategories.forEach(category => {
            const dish = selectedDishes[category];
            if (dish) {
                const card = createOrderDishCard(dish);
                dishesListContainer.appendChild(card);
                dishCount++;
            }
        });

        if (dishCount === 0) {
            emptyOrderMessage.style.display = 'block';
        } else {
            emptyOrderMessage.style.display = 'none';
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
            starter: 'Салат/стартер',
            drink: 'Напиток',
            dessert: 'Десерт',
            additive: 'Добавки'
        };

        let summaryHTML = '';
        const orderedCategories = ['soup', 'main_dish', 'starter', 'drink', 'dessert', 'additive'];
        
        orderedCategories.forEach(category => {
            const dish = selectedDishes[category];
            const title = categoryTitles[category];
            
            summaryHTML += `<p style="font-weight: bold; margin-top: 10px;">${title}</p>`;
            
            if (dish) {
                summaryHTML += `<p>${dish.name} ${dish.price}₽</p>`;
                totalCost += dish.price;
            } else {
                let emptyMessage = category === 'drink' ? 'Напиток не выбран' : (category === 'main_dish' ? 'Блюдо не выбрано' : 'Не выбран');
                summaryHTML += `<p style="font-style: italic;">${emptyMessage}</p>`;
            }
        });

        summaryHTML += `
            <p style="font-weight: bold; margin-top: 20px;">Стоимость заказа</p>
            <p style="font-size: 1.2em; font-weight: bold;">${totalCost}₽</p>
        `;

        orderSummaryElement.innerHTML = summaryHTML;
        
        // Валидация для кнопки отправки
        checkFormValidity();
    }
    
    /**
     * Проверяет валидность комбо и включает/отключает кнопку отправки.
     */
    function checkFormValidity() {
        // Используем функцию проверки комбо из script.js
        const validationError = window.checkComboValidity ? window.checkComboValidity(selectedDishes) : 'Ошибка валидации (JS)';
        
        if (validationError === null) {
            submitButton.disabled = false;
            submitButton.textContent = 'Отправить';
        } else {
            submitButton.disabled = true;
            submitButton.textContent = `Отправить (Некорректный заказ: ${validationError})`;
        }
    }


    // ----------------------------------------------------
    // 3. Загрузка и инициализация
    // ----------------------------------------------------

    /**
     * Асинхронно загружает данные о блюдах с API.
     */
    async function loadAllDishesData() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Ошибка при загрузке блюд:', error);
            alert('Не удалось загрузить данные о блюдах с сервера. Проверьте запуск через локальный сервер.');
            return []; 
        }
    }

    /**
     * Восстанавливает выбранные блюда из localStorage.
     */
    function restoreSelectedDishes() {
        const selectedIds = loadSelectedDishIds();
        
        // Очищаем текущий выбор
        for (const cat in selectedDishes) {
            selectedDishes[cat] = null;
        }

        // Восстанавливаем объекты блюд по ID из allDishesData
        allDishesData.forEach(dish => {
            const category = dish.category ? dish.category.toLowerCase() : ''; 
            if (selectedIds[category] === dish.id) {
                selectedDishes[category] = dish;
            }
        });
    }

    /**
     * Основная функция инициализации страницы.
     */
    async function initOrderPage() {
        // Шаг 1: Загрузка всех данных с API
        allDishesData = await loadAllDishesData();
        
        if (allDishesData.length > 0) {
            // Шаг 2: Восстановление выбранных блюд
            restoreSelectedDishes(); 

            // Шаг 3: Рендеринг и обновление сводки
            renderOrderComposition();
            updateOrderSummary();
        } 
        
        // Шаг 4: Настройка обработчика формы
        orderForm.addEventListener('submit', (e) => {
            const validationError = window.checkComboValidity ? window.checkComboValidity(selectedDishes) : 'Ошибка валидации (JS)';
            
            if (validationError) {
                e.preventDefault(); 
                alert(`Ошибка заказа: ${validationError}`);
            } else {
                // Если валидно, форма отправляется на https://httpbin.org/post
                console.log("Комбо валидно, форма отправляется.");
            }
        });
    }

    initOrderPage();

});