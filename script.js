const accounts = {
  "ARSEN123": "ARSENPDIDDY123",
  "MatviyVes": "TON618",
  "Timasueta": "SUETOLOG",
  "Tematiks": "Fdnfanatik",
  "Koyakolo": "GIGACHAD",
  "Aloharbitrahnik123": "ARBITRAJ3",
  "TESTAC": "TESTAC",
  "NAZARK": "Geometrydash1488"
};

const promoCodes = {
  "NICUSD37": { used: true, reward: () => addBalance(100) },
  "GIFTTEM": { used: false, reward: () => addCase("gift") },
  "SPINCOIN": { used: true, reward: () => alert("Спіни ще не реалізовано") },
  "OPENBATLPAS": { used: true, reward: () => alert("Батл пас буде додано") },
  "LVL1": { used: true, reward: () => alert("Рівень батл пасу буде додано") },
  "DONAT1488": { used: false, unlimited: true, reward: () => addBalance(100) },
  "HALAVA1000": { used: false, reward: () => addBalance(1000) },
  "HALAVAXXX": { used: false, unlimited: true, reward: () => addBalance(1000) },
  "REALGIFT": { used: false, unlimited: true, reward: () => addCase("gift") } // прихований промокод
};

let currentUser = null;
let balance = 0;
let inventory = [];
let usedPromos = [];
let selectedIndex = null;
let blockedItems = new Set(); // для блокування предметів
let cart = []; // кошик

function addBalance(amount) {
  balance += amount;
  saveData();
}

function saveData() {
  if (currentUser) {
    localStorage.setItem(currentUser + "_balance", balance);
    localStorage.setItem(currentUser + "_inventory", JSON.stringify(inventory));
    localStorage.setItem(currentUser + "_promos", JSON.stringify(usedPromos));
    localStorage.setItem(currentUser + "_blockedItems", JSON.stringify(Array.from(blockedItems)));
    localStorage.setItem(currentUser + "_cart", JSON.stringify(cart));
  }
}

function loadData() {
  if (currentUser) {
    balance = parseInt(localStorage.getItem(currentUser + "_balance")) || 0;
    inventory = JSON.parse(localStorage.getItem(currentUser + "_inventory")) || [];
    usedPromos = JSON.parse(localStorage.getItem(currentUser + "_promos")) || [];
    blockedItems = new Set(JSON.parse(localStorage.getItem(currentUser + "_blockedItems")) || []);
    cart = JSON.parse(localStorage.getItem(currentUser + "_cart")) || [];
    // Якщо тестовий акаунт TESTAC, очистити інвентар
    if (currentUser === "TESTAC") {
      inventory = [];
      saveData();
    }
  }
}

function loginScreen() {
  document.getElementById("app").innerHTML =
    `<h2>Вхід у акаунт</h2>
    <input id='login' placeholder='Логін'><br>
    <input id='password' placeholder='Пароль' type='password'><br>
    <button onclick='login()'>Увійти</button>`;
}

function login() {
  const login = document.getElementById("login").value.trim();
  const pass = document.getElementById("password").value;
  if (accounts[login] === pass) {
    currentUser = login;
    loadData();
    mainMenu();
  } else {
    alert("Невірний логін або пароль");
  }
}

function logout() {
  saveData();
  currentUser = null;
  loginScreen();
}

function mainMenu() {
  saveData();
  let html = `<h2>Вітаю, ${currentUser}</h2>`;
  html += `<p>Баланс: ${balance} нікусів</p>`;
  html += `<div style="display:flex; flex-wrap:wrap; justify-content:center;">`;

  html += `
    <div style="margin: 10px;">
      <img src="img/case_autumn.png" width="150"><br>
      <button onclick='buyCase("autumn")'>Кейс Осінь25 (40)</button>
    </div>
    <div style="margin: 10px;">
      <img src="img/case_box.png" width="150"><br>
      <button onclick='buyCase("box")'>Бокс Осінь25 (20)</button>
    </div>
    <div style="margin: 10px;">
      <img src="img/case_gift.png" width="150"><br>
      <button disabled>Подарунковий кейс (Тільки через промо-код)</button>
      <br><small>Одноразовий промо-код: GIFTTEM</small><br>
      <small style="user-select:none; color:#331f00;">Багаторазовий промо-код (секретний): REALGIFT</small>
    </div>
  `;

  html += `</div><br>`;

  html += `<button onclick='goToPromoMenu()'>🎁 Відкрити меню промо-кодів</button><br>`;
  html += `<button onclick='showInventory()'>🎒 Інвентар (${inventory.length})</button><br>`;
  html += `<button onclick='showCart()'>🛒 Кошик (${cart.length})</button><br>`;
  html += `<button onclick='logout()'>🚪 Вийти</button>`;

  document.getElementById("app").innerHTML = html;
}

function addCase(type) {
  if (inventory.length >= 100) {
    alert("Інвентар заповнений!");
    return;
  }
  inventory.push({ type: "case", caseType: type, id: generateId() });
  saveData();
}

function buyCase(type) {
  const price = type === "autumn" ? 40 : type === "box" ? 20 : 0;
  if (balance < price) {
    alert("Недостатньо нікусів!");
    return;
  }
  balance -= price;
  addCase(type);
  saveData();
  mainMenu();
}

function showInventory() {
  let html = `<h2>Інвентар</h2>`;
  if (inventory.length === 0) {
    html += `<p>Інвентар порожній.</p>`;
  } else {
    html += `<div class="flex-center">`;
    inventory.forEach((item, idx) => {
      const isBlocked = blockedItems.has(item.id);
      if (item.type === "case") {
        html += `
          <div class="inventory-item ${selectedIndex === idx ? 'selected' : ''}">
            <b>Кейс: ${getCaseName(item.caseType)}</b><br />
            <img src="img/case_${item.caseType}.png" width="120" /><br />
            <button onclick="openCase(${idx})" ${isBlocked ? "disabled" : ""}>Відкрити</button><br />
            <button onclick="toggleBlockItem(${idx}); event.stopPropagation();">
              ${isBlocked ? "Розблокувати" : "Заблокувати"}
            </button><br />
            <button onclick="addToCart(${idx}); event.stopPropagation();" ${isBlocked ? "disabled" : ""}>Додати в кошик</button><br />
            <button onclick="deleteItem(${idx}); event.stopPropagation();" style="margin-top:5px;">Видалити</button>
          </div>
        `;
      } else if (item.type === "bill") {
        const premium = item.premium ? "🌟Преміум" : "";
        html += `
          <div class="inventory-item ${selectedIndex === idx ? 'selected' : ''}" onclick="selectItem(${idx})" style="cursor:pointer;">
            <img src="img/${item.img}" width="120" /><br />
            <b>${item.name}</b><br />
            <i>${item.rarity}</i><br />
            Якість: ${item.quality} ${premium}<br />
            <button onclick="toggleBlockItem(${idx}); event.stopPropagation();">
              ${isBlocked ? "Розблокувати" : "Заблокувати"}
            </button><br />
            <button onclick="addToCart(${idx}); event.stopPropagation();" ${isBlocked ? "disabled" : ""}>Додати в кошик</button><br />
            <button onclick="deleteItem(${idx}); event.stopPropagation();" style="margin-top:5px;">Видалити</button>
          </div>
        `;
      }
    });
    html += `</div>`;
  }
  html += `<br /><button onclick="mainMenu()">← Назад</button>`;
  document.getElementById("app").innerHTML = html;
}

function selectItem(index) {
  selectedIndex = selectedIndex === index ? null : index;
  showInventory();
}

function toggleBlockItem(index) {
  if (index < 0 || index >= inventory.length) return;
  const item = inventory[index];
  if (blockedItems.has(item.id)) {
    blockedItems.delete(item.id);
  } else {
    blockedItems.add(item.id);
  }
  saveData();
  showInventory();
}

function addToCart(index) {
  if (index < 0 || index >= inventory.length) return;

  const item = inventory[index];

  if (blockedItems.has(item.id)) {
    alert("Цей предмет заблоковано і не може бути доданий до кошика.");
    return;
  }

  if (cart.length >= 50) {
    alert("Кошик заповнений!");
    return;
  }

  // Перевірка, чи вже є предмет у кошику
  if (cart.some(cartItem => cartItem.id === item.id)) {
    alert("Цей предмет уже є у кошику.");
    return;
  }

  // Копіюємо предмет для кошика
  const itemCopy = JSON.parse(JSON.stringify(item));
  cart.push(itemCopy);

  // Видаляємо предмет з інвентарю
  inventory.splice(index, 1);

  // Оновлюємо вибір, якщо потрібно
  if (selectedIndex === index) selectedIndex = null;
  else if (selectedIndex > index) selectedIndex--;

  saveData();

  alert(`"${item.type === "case" ? getCaseName(item.caseType) : item.name}" додано до кошика`);

  // Оновлюємо відображення інвентарю, щоб не плутати користувача
  showInventory();
}

function showCart() {
  let html = `<h2>Кошик</h2>`;
  if (cart.length === 0) {
    html += `<p>Кошик порожній.</p>`;
  } else {
    html += `<div class="flex-center">`;
    cart.forEach((item, idx) => {
      if (item.type === "case") {
        html += `
          <div class="inventory-item">
            <b>Кейс: ${getCaseName(item.caseType)}</b><br />
            <img src="img/case_${item.caseType}.png" width="120" /><br />
            <button onclick="removeFromCart(${idx})">Видалити з кошика</button>
          </div>
        `;
      } else if (item.type === "bill") {
        const premium = item.premium ? "🌟Преміум" : "";
        html += `
          <div class="inventory-item">
            <img src="img/${item.img}" width="120" /><br />
            <b>${item.name}</b><br />
            <i>${item.rarity}</i><br />
            Якість: ${item.quality} ${premium}<br />
            <button onclick="removeFromCart(${idx})">Видалити з кошика</button>
          </div>
        `;
      }
    });
    html += `</div><br>`;
    html += `<button onclick="buyCartItems()">Купити всі предмети з кошика</button><br>`;
  }
  html += `<br><button onclick="mainMenu()">← Назад</button>`;
  document.getElementById("app").innerHTML = html;
}

function removeFromCart(index) {
  if (index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  saveData();
  showCart();
}

function buyCartItems() {
  let totalPrice = 0;
  cart.forEach(item => {
    if (item.type === "case") {
      totalPrice += item.caseType === "autumn" ? 40 : item.caseType === "box" ? 20 : 0;
    }
  });
  if (balance < totalPrice) {
    alert(`Недостатньо нікусів! Потрібно ${totalPrice}, у вас ${balance}.`);
    return;
  }
  balance -= totalPrice;
  cart.forEach(item => {
    if (item.type === "case") {
      addCase(item.caseType);
      // Видалити предмет з інвентарю, щоб не було дублю (в даному випадку предмет вже видалений, тому тут пропускаємо)
    }
  });
  cart = [];
  saveData();
  alert(`Купівля успішна! Витрачено ${totalPrice} нікусів.`);
  showInventory();
}

function getCaseName(type) {
  return type === "autumn" ? "Осінь25" :
         type === "box" ? "Бокс Осінь25" :
         type === "gift" ? "Подарунковий кейс" : "Невідомо";
}

function openCase(index) {
  if (index < 0 || index >= inventory.length) return;
  if (blockedItems.has(inventory[index].id)) {
    alert("Цей кейс заблоковано!");
    return;
  }
  const caseType = inventory[index].caseType;
  const items = getDropPool(caseType);
  const selected = weightedRandom(items);
  const quality = getQuality();
  const premiumChance = 0.07; // 7% шанс преміум купюри
  const premium = quality !== "Зношена" && Math.random() < premiumChance;

  setTimeout(() => {
    alert(`Випало: ${selected.name}\nРідкість: ${selected.rarity}\nЯкість: ${quality}${premium ? "\n🌟 Преміум!" : ""}`);
    inventory.splice(index, 1);
    inventory.push({
      type: "bill",
      name: selected.name,
      rarity: selected.rarity,
      img: selected.img,
      quality,
      premium,
      id: generateId()
    });
    saveData();
    showInventory();
  }, 500);
}

function getDropPool(type) {
  if (type === "autumn") return [
    { name: "Пасхалочнік", rarity: "Звичайна", img: "green1.png", chance: 25 },
    { name: "Єнот", rarity: "Звичайна", img: "green2.png", chance: 25 },
    { name: "Хамстер", rarity: "Виняткова", img: "blue1.png", chance: 17.5 },
    { name: "Сатана", rarity: "Виняткова", img: "blue2.png", chance: 17.5 },
    { name: "Волтер Вайт", rarity: "Епічна", img: "purple1.png", chance: 7 },
    { name: "Сігма", rarity: "Епічна", img: "purple2.png", chance: 7 },
    { name: "Бомбордіро", rarity: "Секретна", img: "red1.png", chance: 1 }
  ];
  else if (type === "box") return getDropPool("autumn").filter(x => x.rarity !== "Секретна");
  else if (type === "gift") return [
    { name: "Тунг—Сахур", rarity: "Секретна", img: "red3.png", chance: 1.25 },
    { name: "Тралалеро", rarity: "Секретна", img: "red2.png", chance: 1.25 },
    { name: "Волтер Вайт", rarity: "Епічна", img: "purple1.png", chance: 18.75 },
    { name: "Сігма", rarity: "Епічна", img: "purple2.png", chance: 18.75 },
    { name: "Хамстер", rarity: "Виняткова", img: "blue1.png", chance: 30 },
    { name: "Сатана", rarity: "Виняткова", img: "blue2.png", chance: 30 }
  ];
  return [];
}

function getQuality() {
  const roll = Math.random() * 100;
  if (roll < 12.5) return "Прямо з цеху";
  if (roll < 37.5) return "Після консервації";
  if (roll < 77.5) return "Після уроку";
  return "Зношена";
}

function weightedRandom(pool) {
  const total = pool.reduce((acc, item) => acc + item.chance, 0);
  let roll = Math.random() * total;
  for (let item of pool) {
    if (roll < item.chance) return item;
    roll -= item.chance;
  }
  return pool[pool.length - 1];
}

function goToPromoMenu() {
  let html = `<h2>Меню промо-кодів</h2>`;
  html += `<p>Введи промо-код нижче:</p>`;
  html += `<input id="promoInput" placeholder="Введи промо-код" style="text-transform:uppercase;"><br><br>`;
  html += `<button onclick="usePromoFromInput()">Активувати</button><br><br>`;
  html += `<button onclick="mainMenu()">← Назад</button>`;
  document.getElementById("app").innerHTML = html;
}

function usePromoFromInput() {
  const codeInput = document.getElementById("promoInput").value.trim().toUpperCase();
  if (!codeInput) {
    alert("Введи промо-код");
    return;
  }
  const promo = promoCodes[codeInput];
  if (!promo) {
    alert("Невірний код");
    return;
  }
  if (!promo.unlimited && usedPromos.includes(codeInput)) {
    alert("Код вже використано");
    return;
  }
  promo.reward();
  if (!promo.unlimited) usedPromos.push(codeInput);
  saveData();
  alert("Промо-код активовано!");
  mainMenu();
}

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Старт програми
loginScreen();