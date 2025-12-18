
// js_files/data.js

const allDishes = [
    // ----------------------------------------------------------------------------------
    // СУПЫ (Soup) - 2 рыбных, 2 мясных, 2 вегетарианских
    // ----------------------------------------------------------------------------------
    {
        keyword: 'pumpkin_cheese_soup',
        name: 'Pumpkin and cheese soup',
        price: 199,
        category: 'soup',
        kind: 'veg',
        count: '300 ml',
        image: 'foods/pumpkin-and-cheese-soup-top-view-image.jpg'
    },
    {
        keyword: 'tomato_soup',
        name: 'Tomato soup',
        price: 175,
        category: 'soup',
        kind: 'veg',
        count: '300 ml',
        image: 'foods/tomato-soup.jpg'
    },
    {
        keyword: 'mushroom_soup',
        name: 'Mushroom soup',
        price: 255,
        category: 'soup',
        kind: 'meat',
        count: '300 ml',
        image: 'foods/mushroom-soup.jpg'
    },
    {
        keyword: 'shrimp_soup',
        name: 'Shrimp soup',
        price: 320,
        category: 'soup',
        kind: 'fish',
        count: '300 ml',
        image: 'foods/shrimp_soup.jpg'
    },
    {
        keyword: 'chicken_noodle_soup',
        name: 'Chicken noodle soup',
        price: 210,
        category: 'soup',
        kind: 'meat',
        count: '350 ml',
        image: 'foods/chicken_noodle_soup.jpg'
    },
    {
        keyword: 'salmon_cream_soup',
        name: 'Salmon cream soup',
        price: 350,
        category: 'soup',
        kind: 'fish',
        count: '300 ml',
        image: 'foods/salmon_cream_soup.jpg'
    },


    // ----------------------------------------------------------------------------------
    // ГЛАВНОЕ БЛЮДО (Main Dish) - 2 рыбных, 2 мясных, 2 вегетарианских
    // ----------------------------------------------------------------------------------
    {
        keyword: 'sashlik',
        name: 'Sashlik',
        price: 350,
        category: 'main_dish',
        kind: 'meat',
        count: '300 г',
        image: 'foods/Sashlik.jpg'
    },
    {
        keyword: 'soba_noodles',
        name: 'Soba noodles',
        price: 280,
        category: 'main_dish',
        kind: 'veg',
        count: '350 г',
        image: 'foods/Soba.jpg'
    },
    {
        keyword: 'chicken',
        name: 'Chicken',
        price: 300,
        category: 'main_dish',
        kind: 'meat',
        count: '300 г',
        image: 'foods/chicken.jpg'
    },
    {
        keyword: 'fish_cutlet_rice',
        name: 'Рыбная котлета с рисом',
        price: 320,
        category: 'main_dish',
        kind: 'fish',
        count: '270 г',
        image: 'foods/fish_cutlet_rice.jpg'
    },
    {
        keyword: 'shrimp_pasta',
        name: 'Паста с креветками',
        price: 340,
        category: 'main_dish',
        kind: 'fish',
        count: '280 г',
        image: 'foods/shrimp_pasta.jpg'
    },
    {
        keyword: 'fried_potatoes_mushrooms',
        name: 'Жареная картошка с грибами',
        price: 150,
        category: 'main_dish',
        kind: 'veg',
        count: '400 г',
        image: 'foods/fried_potatoes_mushrooms.jpg'
    },


    // ----------------------------------------------------------------------------------
    // САЛАТ ИЛИ СТАРТЕР (Starter) - 1 рыбный, 1 мясной, 4 вегетарианских
    // ----------------------------------------------------------------------------------
    {
        keyword: 'caesar_chicken',
        name: 'Салат "Цезарь" с курицей',
        price: 280,
        category: 'starter',
        kind: 'meat',
        count: '250 г',
        image: 'starters/caesar_chicken.jpg'
    },
    {
        keyword: 'greek_salad',
        name: 'Греческий салат',
        price: 220,
        category: 'starter',
        kind: 'veg',
        count: '250 г',
        image: 'starters/greek_salad.jpg'
    },
    {
        keyword: 'caprese',
        name: 'Капрезе',
        price: 250,
        category: 'starter',
        kind: 'veg',
        count: '200 г',
        image: 'starters/caprese.jpg'
    },
    {
        keyword: 'shrimp_cocktail',
        name: 'Креветочный коктейль',
        price: 310,
        category: 'starter',
        kind: 'fish',
        count: '180 г',
        image: 'starters/shrimp_cocktail.jpg'
    },
    {
        keyword: 'hummus',
        name: 'Хумус с овощами',
        price: 190,
        category: 'starter',
        kind: 'veg',
        count: '200 г',
        image: 'starters/hummus.jpg'
    },
    {
        keyword: 'coleslaw',
        name: 'Салат Коул Слоу',
        price: 150,
        category: 'starter',
        kind: 'veg',
        count: '200 г',
        image: 'starters/coleslaw.jpg'
    },

    // ----------------------------------------------------------------------------------
    // НАПИТКИ (Drink) - 3 холодных, 3 горячих
    // ----------------------------------------------------------------------------------
    {
        keyword: 'tea',
        name: 'Tea',
        price: 150,
        category: 'drink',
        kind: 'hot',
        count: '300 ml',
        image: 'drinks/tea.jpg'
    },
    {
        keyword: 'cola',
        name: 'Cola',
        price: 100,
        category: 'drink',
        kind: 'cold',
        count: '330 ml',
        image: 'drinks/Cola.jpg'
    },
    {
        keyword: 'apple_juice_main',
        name: 'Яблочный сок',
        price: 90,
        category: 'drink',
        kind: 'cold',
        count: '300 мл',
        image: 'drinks/apple_juice_main.jpg'
    },
    {
        keyword: 'orange_juice',
        name: 'Апельсиновый сок',
        price: 120,
        category: 'drink',
        kind: 'cold',
        count: '300 мл',
        image: 'drinks/orange_juice.jpg'
    },
    {
        keyword: 'coffee_latte',
        name: 'Кофе Латте',
        price: 220,
        category: 'drink',
        kind: 'hot',
        count: '300 ml',
        image: 'drinks/coffee_latte.jpg'
    },
    {
        keyword: 'hot_chocolate',
        name: 'Горячий шоколад',
        price: 250,
        category: 'drink',
        kind: 'hot',
        count: '250 ml',
        image: 'drinks/hot_chocolate.jpg'
    },


    // ----------------------------------------------------------------------------------
    // ДЕСЕРТЫ (Dessert) - 3 маленьких, 2 средних, 1 большой
    // ----------------------------------------------------------------------------------
    {
        keyword: 'chocolate_cake',
        name: 'Chocolate cake',
        price: 250,
        category: 'dessert',
        kind: 'medium_portion',
        count: '150 г',
        image: 'foods/chocolatecake.jpg'
    },
    {
        keyword: 'pancakes_syrup',
        name: 'Панкейки с сиропом',
        price: 180,
        category: 'dessert',
        kind: 'small_portion',
        count: '100 г',
        image: 'desserts/pancakes_syrup.jpg'
    },
    {
        keyword: 'macarons_set',
        name: 'Набор макаронс',
        price: 350,
        category: 'dessert',
        kind: 'small_portion',
        count: '80 г',
        image: 'desserts/macarons_set.jpg'
    },
    {
        keyword: 'cheesecake',
        name: 'Чизкейк',
        price: 260,
        category: 'dessert',
        kind: 'medium_portion',
        count: '180 г',
        image: 'desserts/cheesecake.jpg'
    },
    {
        keyword: 'tiramisu',
        name: 'Тирамису',
        price: 210,
        category: 'dessert',
        kind: 'small_portion',
        count: '120 г',
        image: 'desserts/tiramisu.jpg'
    },
    {
        keyword: 'family_pie',
        name: 'Семейный пирог',
        price: 590,
        category: 'dessert',
        kind: 'large_portion',
        count: '500 г',
        image: 'desserts/family_pie.jpg'
    },

    // ----------------------------------------------------------------------------------
    // ДОБАВКИ (Additive) - Не требуют фильтрации
    // ----------------------------------------------------------------------------------
    {
        keyword: 'apple_juice_add',
        name: 'Apple juice (additive)',
        price: 50,
        category: 'additive',
        kind: 'cold',
        count: '200 ml',
        image: 'drinks/applejuice.jpg'
    },
    {
        keyword: 'green_tea_add',
        name: 'Green tea (additive)',
        price: 150,
        category: 'additive',
        kind: 'hot',
        count: '300 ml',
        image: 'drinks/greentea.jpg'
    },
    {
        keyword: 'carrot_juice_add',
        name: 'Морковный сок (additive)',
        price: 110,
        category: 'additive',
        kind: 'cold',
        count: '300 мл',
        image: 'drinks/carrot_juice.jpg'
    }
];
