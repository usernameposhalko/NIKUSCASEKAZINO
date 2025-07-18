const accounts = {
  "ARSEN123": "ARSENPDIDDY123",
  "MatviyVes": "TON618",
  "Timasueta": "SUETOLOG",
  "Tematiks": "Fdnfanatik",
  "Koyakolo": "GIGACHAD",
  "Aloharbitrahnik123": "ARBITRAJ3",
  "TESTAC": "TESTAC",
  "NAZARK": "Geometrydash1488",
  "Egoroblox": "undertale52",
  "SIGMA228": "ebubabalku",
  "BABULKA777": "skibidi7"
};

const promoCodes = {
  "TkNJU1VEMzc=": {used: true, reward: () => addBalance(100)},           // NICUSD37
  "R0lGVFRFTQ==": {used: false, reward: () => addCase("gift")},         // GIFTTEM
  "U1BJTkNPSU4=": {used: true, reward: () => alert("Спіни ще не реалізовано")}, // SPINCOIN
  "T1BFTkJBVExQQVM=": {used: true, reward: () => alert("Батл пас буде додано")}, // OPENBATLPAS
  "RE9OQVRMTjE0ODg=": {used: false, unlimited: true, reward: () => addBalance(100)}, // DONAT1488
  "SEFMQVZBMTAwMA==": {used: false, reward: () => addBalance(1000)},    // HALAVA1000
  "SEFMQVZYWlYwMDA=": {used: false, unlimited: true, reward: () => addBalance(1000)}, // HALAVAXXX
  "UkVBTEdJRlQ=": {used: false, unlimited: true, reward: () => addCase("gift")}       // REALGIFT
};

let currentUser = null;
let balance = 0;
let inventory = [];
let usedPromos = [];
let blockedItems = new Set();
let cart = [];
let selectedIndex = null;

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
  html += `<br><button onclick="mainMenu()">Назад</button>`;
  document.getElementById("app").innerHTML = html;
}

function getCaseName(type) {
  if (type === "autumn") return "Осінній кейс";
  if (type === "box") return "Коробка";
  if (type === "gift") return "Подарунок";
  return "Кейс";
}

function toggleBlockItem(index) {
  const item = inventory[index];
  if (!item) return;
  if (blockedItems.has(item.id)) {
    blockedItems.delete(item.id);
  } else {
    blockedItems.add(item.id);
  }
  saveData();
  showInventory();
}

function addToCart(index) {
  const item = inventory[index];
  if (!item) return;
  if (blockedItems.has(item.id)) {
    alert("Цей предмет заблоковано.");
    return;
  }
  cart.push(item);
  inventory.splice(index, 1); // Видаляємо з інвентаря
  saveData();
  showInventory();
}

function deleteItem(index) {
  if (!confirm("Видалити цей предмет?")) return;
  inventory.splice(index, 1);
  saveData();
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
    html += `</div>`;
  }
  html += `<br><button onclick="mainMenu()">Назад</button>`;
  document.getElementById("app").innerHTML = html;
}

function removeFromCart(index) {
  if (!confirm("Видалити цей предмет з кошика?")) return;
  cart.splice(index, 1);
  saveData();
  showCart();
}

function openCase(index) {
  const item = inventory[index];
  if (!item || item.type !== "case") {
    alert("Вибрано не кейс");
    return;
  }
  if (blockedItems.has(item.id)) {
    alert("Цей кейс заблоковано");
    return;
  }
  // Логіка відкриття кейсу:
  // Віднімаємо кейс з інвентаря
  inventory.splice(index, 1);

  // Визначення випадкового предмета з кейсу (спрощено)
  const drop = generateDrop(item.caseType);

  // Додаємо предмет у інвентар
  inventory.push(drop);

  saveData();
  alert(`Ви отримали: ${drop.name} (${drop.rarity}, якість: ${drop.quality}${drop.premium ? ', преміум' : ''})`);
  showInventory();
}

function generateDrop(caseType) {
  // Приклад реалізації (потрібно підлаштувати під твій проект)
  const rarities = ["Звичайна", "Виняткова", "Епічна", "Секретна"];
  const qualities = ["Зношена", "Після уроку", "Після консервації", "Прямо з цеху"];
  const qualityChances = [0.225, 0.40, 0.25, 0.125]; // Приклад

  // Визначення випадкової рідкості
  let rarityRoll = Math.random();
  let rarity = "Звичайна";
  if (rarityRoll < 0.01) rarity = "Секретна";
  else if (rarityRoll < 0.15) rarity = "Епічна";
  else if (rarityRoll < 0.50) rarity = "Виняткова";

  // Визначення якості
  let quality = "Зношена";
  let roll = Math.random();
  let acc = 0;
  for (let i = 0; i < qualityChances.length; i++) {
    acc += qualityChances[i];
    if (roll < acc) {
      quality = qualities[i];
      break;
    }
  }

  // Визначення преміум (7% шанс)
  const premium = Math.random() < 0.07 && quality !== "Зношена";

  // Підбір назви та зображення залежно від рідкості та якості
  const name = `${caseType} купюра`;
  const img = `${rarity.toLowerCase()}.png`;

  return {
    type: "bill",
    name: name,
    rarity: rarity,
    quality: quality,
    premium: premium,
    img: img,
    id: generateId()
  };
}

function generateId() {
  return Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
}

function goToPromoMenu() {
  let html = `<h2>Промо-коди</h2>
  <input id="promoInput" placeholder="Введіть промо-код" style="width: 200px;">
  <button onclick="applyPromo()">Активувати</button><br><br>
  <div id="promoList"></div>
  <br><button onclick="mainMenu()">Назад</button>`;
  document.getElementById("app").innerHTML = html;
  renderPromoList();
}

function renderPromoList() {
  let listHtml = "<ul>";
  for (const codeBase64 in promoCodes) {
    const decoded = atob(codeBase64);
    const promo = promoCodes[codeBase64];
    const status = promo.used ? "(використано)" : "(доступний)";
    listHtml += `<li><b>${decoded}</b> ${status}</li>`;
  }
  listHtml += "</ul>";
  document.getElementById("promoList").innerHTML = listHtml;
}

function applyPromo() {
  const input = document.getElementById("promoInput").value.trim();
  const encodedInput = btoa(input);

  if (!(encodedInput in promoCodes)) {
    alert("Промо-код не знайдено");
    return;
  }
  const promo = promoCodes[encodedInput];
  if (promo.used && !promo.unlimited) {
    alert("Промо-код вже використано");
    return;
  }
  promo.reward();
  if (!promo.unlimited) promo.used = true;
  usedPromos.push(encodedInput);
  saveData();
  alert("Промо-код активовано!");
  goToPromoMenu();
}

loginScreen();
