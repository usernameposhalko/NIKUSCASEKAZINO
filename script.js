// Авторизація користувачів
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
  "SIGMA228": "KOT1488",
  "BABULKA777": "KOT52"
};

// Конвертація UTF-8 <-> Base64
function strToB64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}
function b64ToStr(b64) {
  return decodeURIComponent(escape(window.atob(b64)));
}

// Зашифровані промокоди Base64
const promoCodesBase64 = {
  "TklDVVMxMjM=": {type:"once", reward:()=>{addBalance(250); alert("Отримано 250 нікусів!");}},
  "TklLVVM0NTY=": {type:"once", reward:()=>{addBalance(100); alert("Отримано 100 нікусів!");}},
  "S0FWSUsxNTk=": {type:"once", reward:()=>{addBalance(100); alert("Отримано 100 нікусів!");}},
  "TklDVVMwMDE=": {type:"once", reward:()=>{addBalance(100); alert("Отримано 100 нікусів!");}},
  "TklDVVMwMDI=": {type:"once", reward:()=>{addBalance(100); alert("Отримано 100 нікусів!");}},
  "TklDVVMwMDM=": {type:"once", reward:()=>{addBalance(100); alert("Отримано 100 нікусів!");}},
  "TklDVVMwMDQ=": {type:"once", reward:()=>{addBalance(100); alert("Отримано 100 нікусів!");}},
  "TklDVVMwMDU=": {type:"once", reward:()=>{addBalance(100); alert("Отримано 100 нікусів!");}},
  "TklDVVMwMDY=": {type:"once", reward:()=>{addBalance(100); alert("Отримано 100 нікусів!");}},
  "TklDVVMwMDc=": {type:"once", reward:()=>{addBalance(100); alert("Отримано 100 нікусів!");}},
  "Q0FTRTc4OQ==": {type:"once", reward:()=>{addCase("box"); alert("Отримано кейс Бокс!");}},
  "R0lGVDY1NA==": {type:"once", reward:()=>{addCase("gift"); alert("Отримано подарунковий кейс!");}},
  "Qk9YMzIx": {type:"unlimited", reward:()=>{addCase("box"); alert("Отримано кейс Бокс!");}},
  "TU9ORVk5ODc=": {type:"unlimited", reward:()=>{addBalance(1000); alert("Отримано 1000 нікусів!");}},
  "UkVBTEdJUlQ=": {type:"unlimited", reward:()=>{addCase("gift"); alert("Отримано подарунковий кейс!");}}
};

// Змінні стану
let currentUser = null;
let balance = 0;
let inventory = [];
let usedPromos = [];
let blockedItems = new Set();
let cart = [];

// Збереження/завантаження прогресу
function saveData(){
  if(!currentUser) return;
  localStorage.setItem(currentUser+"_balance", balance);
  localStorage.setItem(currentUser+"_inventory", JSON.stringify(inventory));
  localStorage.setItem(currentUser+"_usedPromos", JSON.stringify(usedPromos));
  localStorage.setItem(currentUser+"_blockedItems", JSON.stringify(Array.from(blockedItems)));
  localStorage.setItem(currentUser+"_cart", JSON.stringify(cart));
}

function loadData(){
  if(!currentUser) return;
  balance = parseInt(localStorage.getItem(currentUser+"_balance")) || 0;
  inventory = JSON.parse(localStorage.getItem(currentUser+"_inventory")) || [];
  usedPromos = JSON.parse(localStorage.getItem(currentUser+"_usedPromos")) || [];
  blockedItems = new Set(JSON.parse(localStorage.getItem(currentUser+"_blockedItems")) || []);
  cart = JSON.parse(localStorage.getItem(currentUser+"_cart")) || [];
}

// Баланс
function addBalance(amount){
  balance += amount;
  saveData();
  updateBalanceUI();
}

// Додати кейс у інвентар
function addCase(type){
  inventory.push({type:"case", caseType:type, id:generateId()});
  saveData();
  showInventory();
}

// Генерація унікального ID
function generateId(){
  return Math.random().toString(36).substring(2,9);
}

// Пул дропу кейсів (box без секретних, gift з секретними)
function getDropPool(type){
  if(type==="box") return [
    {name:"Жовта купюра", rarity:"Звичайна", img:"yellow.png", chance:40},
    {name:"Голуба купюра", rarity:"Виняткова", img:"blue.png", chance:35},
    {name:"Фіолетова купюра", rarity:"Епічна", img:"purple.png", chance:24},
  ];
  if(type==="gift") return [
    {name:"Жовта купюра", rarity:"Звичайна", img:"yellow.png", chance:40},
    {name:"Голуба купюра", rarity:"Виняткова", img:"blue.png", chance:35},
    {name:"Фіолетова купюра", rarity:"Епічна", img:"purple.png", chance:15},
    {name:"Сахур", rarity:"Секретна", img:"red3.png", chance:5},
    {name:"Тралалеро", rarity:"Секретна", img:"red2.png", chance:5},
  ];
  return [];
}

// Вибір випадкового предмету за шансом
function weightedRandom(items){
  let total = items.reduce((acc,i)=>acc+i.chance,0);
  let r = Math.random()*total;
  for(let i of items){
    if(r < i.chance) return i;
    r -= i.chance;
  }
  return items[0];
}

// Відкрити кейс
function openCase(caseItem){
  const pool = getDropPool(caseItem.caseType);
  const selected = weightedRandom(pool);

  // Видалити кейс з інвентаря
  const idx = inventory.findIndex(i=>i.id === caseItem.id);
  if(idx>=0) inventory.splice(idx,1);

  // Додати отриманий предмет
  inventory.push({
    type:"bill",
    name:selected.name,
    rarity:selected.rarity,
    img:selected.img,
    id:generateId()
  });

  saveData();
  showInventory();
  alert(`Ви отримали: ${selected.name} (${selected.rarity})`);
}

// Оновлення балансу в UI
function updateBalanceUI(){
  const balEl = document.getElementById("balance");
  if(balEl) balEl.textContent = `Баланс: ${balance} нікусів`;
}

// Показати інвентар у UI
function showInventory(){
  const invEl = document.getElementById("inventory");
  if(!invEl) return;
  invEl.innerHTML = "";
  for(let item of inventory){
    const div = document.createElement("div");
    div.className = "inventory-item";
    div.innerHTML = `<img src="img/${item.img}" alt="${item.name}" width="50" height="30"> ${item.name} (${item.rarity})`;
    invEl.appendChild(div);
  }
  updateBalanceUI();
}

// Застосувати промокод
function applyPromo(){
  const input = document.getElementById("promoInput");
  if(!input) return;
  const code = input.value.trim().toUpperCase();
  if(!code){
    alert("Введіть промокод");
    return;
  }
  const codeB64 = strToB64(code);
  const promo = promoCodesBase64[codeB64];
  if(!promo){
    alert("Промокод не знайдено");
    return;
  }
  if(promo.type==="once" && usedPromos.includes(code)){
    alert("Цей промокод вже використано");
    return;
  }

  promo.reward();

  if(promo.type==="once") usedPromos.push(code);
  saveData();
  alert("Промокод успішно застосовано");
  document.getElementById("promoInput").value = "";
}

// Логін
function loginScreen(){
  document.body.innerHTML = `
    <h2>Вхід</h2>
    <input id="loginInput" placeholder="Логін">
    <input id="passwordInput" placeholder="Пароль" type="password">
    <button onclick="login()">Увійти</button>
  `;
}

function login(){
  const loginInput = document.getElementById("loginInput").value.trim();
  const passwordInput = document.getElementById("passwordInput").value.trim();
  if(accounts[loginInput] && accounts[loginInput] === passwordInput){
    currentUser = loginInput;
    loadData();
    mainMenu();
  } else {
    alert("Невірний логін або пароль");
  }
}

// Головне меню
function mainMenu(){
  document.body.innerHTML = `
    <h1>NICUS CASE</h1>
    <div id="balance">Баланс: ${balance} нікусів</div>
    <button onclick="goToPromoMenu()">Ввести промокод</button>
    <button onclick="showInventory()">Інвентар</button>
    <button onclick="showCases()">Відкрити кейс</button>
    <button onclick="logout()">Вийти</button>
    <div id="inventory" style="margin-top:20px;"></div>
  `;
  updateBalanceUI();
}

// Показати кейси для відкриття
function showCases(){
  const cases = inventory.filter(i=>i.type==="case");
  if(cases.length===0){
    alert("У вас немає кейсів для відкриття");
    return;
  }
  let html = "<h2>Виберіть кейс для відкриття</h2>";
  cases.forEach(c=>{
    html += `<button onclick="openCaseById('${c.id}')">${c.caseType.toUpperCase()} кейс</button><br>`;
  });
  html += `<button onclick="mainMenu()">Назад</button>`;
  document.body.innerHTML = html;
}

// Відкрити кейс за ID
function openCaseById(id){
  const caseItem = inventory.find(i=>i.id===id);
  if(!caseItem) return;
  openCase(caseItem);
  mainMenu();
}

function logout(){
  currentUser = null;
  balance = 0;
  inventory = [];
  usedPromos = [];
  blockedItems.clear();
  cart = [];
  loginScreen();
}

// Відкрити меню промокодів
function goToPromoMenu(){
  document.body.innerHTML = `
    <h2>Введіть промокод</h2>
    <input id="promoInput" placeholder="Промокод">
    <button onclick="applyPromo()">Активувати</button>
    <br><button onclick="mainMenu()">← Назад</button>
  `;
}

window.onload = () => {
  loginScreen();
};
