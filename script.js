const accounts = {
  "ARSEN123":"ARSENPDIDDY123",
  "MatviyVes":"TON618",
  "Timasueta":"SUETOLOG",
  "Tematiks":"Fdnfanatik",
  "Koyakolo":"GIGACHAD",
  "Aloharbitrahnik123":"ARBITRAJ3",
  "TESTAC":"TESTAC",
  "NAZARK":"Geometrydash1488",
  "Egoroblox":"undertale52",
  "SIGMA228":"ebubabalku",
  "BABULKA777":"skibidi7"
};

const promoCodes = {
  "TkNJU1VEMzc=":{used:true,reward:()=>addBalance(100)},
  "R0lGVFRFTQ==":{used:false,reward:()=>addCase("gift")},
  "U1BJTkNPSU4=":{used:true,reward:()=>alert("Спіни ще не реалізовано")},
  "T1BFTkJBVExQQVM=":{used:true,reward:()=>alert("Батл пас буде додано")},
  "RE9OQVRMTjE0ODg=":{used:false,unlimited:true,reward:()=>addBalance(100)},
  "SEFMQVZBMTAwMA==":{used:false,reward:()=>addBalance(1000)},
  "SEFMQVZaWFgwMDA=":{used:false,unlimited:true,reward:()=>addBalance(1000)},
  "UkVBTEdJRlQ=":{used:false,unlimited:true,reward:()=>addCase("gift")}
};

let currentUser=null;
let balance=0;
let inventory=[];
let usedPromos=[];
let blockedItems=new Set();
let cart=[];
let selectedIndex=null;

function addBalance(amount){
  balance+=amount;
  saveData();
}

function saveData(){
  if(currentUser){
    localStorage.setItem(currentUser+"_balance",balance);
    localStorage.setItem(currentUser+"_inventory",JSON.stringify(inventory));
    localStorage.setItem(currentUser+"_promos",JSON.stringify(usedPromos));
    localStorage.setItem(currentUser+"_blockedItems",JSON.stringify(Array.from(blockedItems)));
    localStorage.setItem(currentUser+"_cart",JSON.stringify(cart));
  }
}

function loadData(){
  if(currentUser){
    balance=parseInt(localStorage.getItem(currentUser+"_balance"))||0;
    inventory=JSON.parse(localStorage.getItem(currentUser+"_inventory"))||[];
    usedPromos=JSON.parse(localStorage.getItem(currentUser+"_promos"))||[];
    blockedItems=new Set(JSON.parse(localStorage.getItem(currentUser+"_blockedItems"))||[]);
    cart=JSON.parse(localStorage.getItem(currentUser+"_cart"))||[];
    if(currentUser==="TESTAC"){
      inventory=[];
      saveData();
    }
  }
}

function loginScreen(){
  document.getElementById("app").innerHTML=`
    <h2>Вхід у акаунт</h2>
    <input id='login' placeholder='Логін'><br>
    <input id='password' placeholder='Пароль' type='password'><br>
    <button onclick='login()'>Увійти</button>
  `;
}

function login(){
  const login=document.getElementById("login").value.trim();
  const pass=document.getElementById("password").value;
  if(accounts[login]===pass){
    currentUser=login;
    loadData();
    mainMenu();
  } else alert("Невірний логін або пароль");
}

function logout(){
  saveData();
  currentUser=null;
  loginScreen();
}

function mainMenu(){
  saveData();
  let html=`<h2>Вітаю, ${currentUser}</h2>`;
  html+=`<p>Баланс: ${balance} нікусів</p><div style="display:flex; flex-wrap:wrap; justify-content:center;">`;
  html+=`
    <div style="margin:10px;">
      <img src="img/case_autumn.png" width="150"><br>
      <button onclick='buyCase("autumn")'>Кейс Осінь25 (40)</button>
    </div>
    <div style="margin:10px;">
      <img src="img/case_box.png" width="150"><br>
      <button onclick='buyCase("box")'>Бокс Осінь25 (20)</button>
    </div>
    <div style="margin:10px;">
      <img src="img/case_gift.png" width="150"><br>
      <button disabled>Подарунковий кейс (Тільки через промо-код)</button><br>
      <small>Одноразовий промо-код: GIFTTEM</small><br>
      <small style="user-select:none; color:#331f00;">Багаторазовий промо-код (секретний): REALGIFT</small>
    </div>
  `;
  html+=`</div><br>`;
  html+=`<button onclick='goToPromoMenu()'>🎁 Відкрити меню промо-кодів</button><br>`;
  html+=`<button onclick='showInventory()'>🎒 Інвентар (${inventory.length})</button><br>`;
  html+=`<button onclick='showCart()'>🛒 Кошик (${cart.length})</button><br>`;
  html+=`<button onclick='logout()'>🚪 Вийти</button>`;
  document.getElementById("app").innerHTML=html;
}

function addCase(type){
  if(inventory.length>=100){
    alert("Інвентар заповнений!");
    return;
  }
  inventory.push({type:"case",caseType:type,id:generateId()});
  saveData();
}

function buyCase(type){
  const price=type==="autumn"?40:type==="box"?20:0;
  if(balance<price){
    alert("Недостатньо нікусів!");
    return;
  }
  balance-=price;
  addCase(type);
  saveData();
  mainMenu();
}

function showInventory(){
  let html=`<h2>Інвентар</h2>`;
  if(inventory.length===0)html+=`<p>Інвентар порожній.</p>`;
  else{
    html+=`<div class="flex-center">`;
    inventory.forEach((item,idx)=>{
      const isBlocked=blockedItems.has(item.id);
      if(item.type==="case"){
        html+=`
          <div class="inventory-item ${selectedIndex===idx?'selected':''}">
            <b>Кейс: ${getCaseName(item.caseType)}</b><br />
            <img src="img/case_${item.caseType}.png" width="120" /><br />
            <button onclick="openCase(${idx})" ${isBlocked?"disabled":""}>Відкрити</button><br />
            <button onclick="toggleBlockItem(${idx}); event.stopPropagation();">${isBlocked?"Розблокувати":"Заблокувати"}</button><br />
            <button onclick="addToCart(${idx}); event.stopPropagation();" ${isBlocked?"disabled":""}>Додати в кошик</button><br />
            <button onclick="deleteItem(${idx}); event.stopPropagation();" style="margin-top:5px;">Видалити</button>
          </div>
        `;
      } else if(item.type==="bill"){
        const premium=item.premium?"🌟Преміум":"";
        html+=`
          <div class="inventory-item ${selectedIndex===idx?'selected':''}" onclick="selectItem(${idx})" style="cursor:pointer;">
            <img src="img/${item.img}" width="120" /><br />
            <b>${item.name}</b><br />
            <i>${item.rarity}</i><br />
            Якість: ${item.quality} ${premium}<br />
            <button onclick="toggleBlockItem(${idx}); event.stopPropagation();">${isBlocked?"Розблокувати":"Заблокувати"}</button><br />
            <button onclick="addToCart(${idx}); event.stopPropagation();" ${isBlocked?"disabled":""}>Додати в кошик</button><br />
            <button onclick="deleteItem(${idx}); event.stopPropagation();" style="margin-top:5px;">Видалити</button>
          </div>
        `;
      }
    });
    html+=`</div>`;
  }
  html+=`<br /><button onclick="mainMenu()">← Назад</button>`;
  document.getElementById("app").innerHTML=html;
}

function selectItem(index){
  selectedIndex=selectedIndex===index?null:index;
  showInventory();
}

function toggleBlockItem(index){
  if(index<0||index>=inventory.length)return;
  const item=inventory[index];
  if(blockedItems.has(item.id))blockedItems.delete(item.id);
  else blockedItems.add(item.id);
  saveData();
  showInventory();
}

function addToCart(index){
  if(index<0||index>=inventory.length)return;
  const item=inventory[index];
  if(blockedItems.has(item.id)){
    alert("Цей предмет заблоковано і не може бути доданий до кошика.");
    return;
  }
  if(cart.length>=50){
    alert("Кошик заповнений!");
    return;
  }
  cart.push(item);
  inventory.splice(index,1);
  saveData();
  alert(`"${item.type==="case"?getCaseName(item.caseType):item.name}" додано до кошика`);
  showInventory();
}

function showCart(){
  let html=`<h2>Кошик</h2>`;
  if(cart.length===0)html+=`<p>Кошик порожній.</p>`;
  else{
    html+=`<div class="flex-center">`;
    cart.forEach((item,idx)=>{
      if(item.type==="case"){
        html+=`
          <div class="inventory-item">
            <b>Кейс: ${getCaseName(item.caseType)}</b><br />
            <img src="img/case_${item.caseType}.png" width="120" /><br />
            <button onclick="removeFromCart(${idx})">Видалити з кошика</button>
          </div>
        `;
      } else if(item.type==="bill"){
        const premium=item.premium?"🌟Преміум":"";
        html+=`
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
    html+=`</div><br>`;
    html+=`<button onclick="buyCartItems()">Купити всі предмети з кошика</button><br>`;
  }
  html+=`<br><button onclick="mainMenu()">← Назад</button>`;
  document.getElementById("app").innerHTML=html;
}

function removeFromCart(index){
  if(index<0||index>=cart.length)return;
  inventory.push(cart[index]);
  cart.splice(index,1);
  saveData();
  showCart();
}

function buyCartItems(){
  let totalPrice=0;
  cart.forEach(item=>{
    if(item.type==="case"){
      totalPrice+=item.caseType==="autumn"?40:item.caseType==="box"?20:0;
    }
  });
  if(balance<totalPrice){
    alert(`Недостатньо нікусів! Потрібно ${totalPrice}, у вас ${balance}.`);
    return;
  }
  balance-=totalPrice;
  cart.forEach(item=>{
    if(item.type==="case")addCase(item.caseType);
  });
  cart=[];
  saveData();
  alert(`Купівля успішна! Витрачено ${totalPrice} нікусів.`);
  showInventory();
}

function getCaseName(type){
  return type==="autumn"?"Осінній кейс 2025":type==="box"?"Бокс 2025":"Подарунковий кейс";
}

function openCase(index){
  if(index<0||index>=inventory.length)return;
  const item=inventory[index];
  if(item.type!=="case"){
    alert("Цей предмет не можна відкрити");
    return;
  }
  let drop;
  if(item.caseType==="autumn")drop=dropFromAutumnCase();
  else if(item.caseType==="box")drop=dropFromBoxCase();
  else{
    alert("Невідомий кейс");
    return;
  }
  if(!drop){
    alert("Помилка при відкритті кейсу");
    return;
  }
  inventory.splice(index,1);
  inventory.push(drop);
  saveData();
  alert(`Ви отримали: ${drop.name} (${drop.quality})!`);
  showInventory();
}

function dropFromAutumnCase(){
  // Приклад логіки дропу
  // Шанси:
  // Зелений - 40% (5 монет або зелена купюра 50%)
  // Голубий - 35%
  // Фіолетовий - 20%
  // Червоний - 5%
  let rand=Math.random()*100;
  if(rand<40){
    // зелений
    let subRand=Math.random();
    if(subRand<0.5){
      return {type:"bill",name:"Зелена купюра",rarity:"Зелений",quality:"Стандартна",img:"green_bill.png",premium:false,id:generateId()};
    } else {
      addBalance(5);
      alert("Вам додано 5 нікусів замість предмета!");
      return null;
    }
  } else if(rand<75){
    return {type:"bill",name:"Голуба купюра",rarity:"Голубий",quality:"Стандартна",img:"blue_bill.png",premium:false,id:generateId()};
  } else if(rand<95){
    return {type:"bill",name:"Фіолетова купюра",rarity:"Фіолетовий",quality:"Стандартна",img:"purple_bill.png",premium:false,id:generateId()};
  } else {
    return {type:"bill",name:"Червона купюра",rarity:"Червоний",quality:"Секретна",img:"red_bill.png",premium:false,id:generateId()};
  }
}

function dropFromBoxCase(){
  // Простий приклад
  let items=[
    {name:"Виняткова сатана",rarity:"Виняткова",quality:"Прямо з цеху",img:"satan.png",premium:true,id:generateId()},
    {name:"Звичайна купюра",rarity:"Звичайна",quality:"Стандартна",img:"green_bill.png",premium:false,id:generateId()},
    {name:"Епічний арбітражнік",rarity:"Епічна",quality:"Преміум",img:"epic_arb.png",premium:true,id:generateId()},
  ];
  return items[Math.floor(Math.random()*items.length)];
}

function generateId(){
  return Math.random().toString(36).substr(2,9);
}

function goToPromoMenu(){
  let html=`<h2>Промо-коди</h2>
    <input id="promoInput" placeholder="Введіть промокод"><br>
    <button onclick="applyPromo()">Активувати</button><br><br>
    <button onclick="mainMenu()">← Назад</button>
    <div id="promoResult" style="margin-top:10px;"></div>`;
  document.getElementById("app").innerHTML=html;
}

function applyPromo(){
  const code=document.getElementById("promoInput").value.trim();
  if(!code){
    alert("Введіть промокод");
    return;
  }
  const encoded=btoa(code.toUpperCase());
  const promo=promoCodes[encoded];
  if(!promo){
    alert("Промокод не знайдено");
    return;
  }
  if(promo.used&&!promo.unlimited){
    alert("Промокод вже використаний");
    return;
  }
  promo.reward();
  if(!promo.unlimited){
    promo.used=true;
    usedPromos.push(encoded);
  }
  saveData();
  document.getElementById("promoResult").innerText="Промокод застосовано!";
}

window.onload=()=>{
  loginScreen();
};
