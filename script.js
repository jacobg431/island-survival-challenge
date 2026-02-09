// HTML Elements
const huntBtn = document.getElementById("hunt-button");
const gatherBtn = document.getElementById("gather-button");
const restBtn = document.getElementById("rest-button");
const sailBtn = document.getElementById("sail-button");
const craftBtn = document.getElementById("craft-button");
const allBtns = document.getElementsByTagName("button");

const progressBar = document.getElementById("energy-bar");

const inventory = document.getElementById("inventory");
const inventoryWood = document.getElementById("inventory-wood");
const inventoryVines = document.getElementById("inventory-vines");
const inventoryFood = document.getElementById("inventory-food");
const inventoryStone = document.getElementById("inventory-stone");
const inventoryObsidian = document.getElementById("inventory-obsidian");
const inventoryFang = document.getElementById("inventory-fang");

const toolInfoTitle = document.getElementById("tool-info-title");
const toolInfoDescription = document.getElementById("tool-info-description");
const toolInfoRequirements = document.getElementById("tool-info-requirements");
const toolInfoImg = document.getElementById("tool-info-img");

const itemSelect = document.getElementById("item-select");

// Other constants
const baseApiUrl = "https://island-survival-kit-builder.onrender.com/tools";

const playerDeathAudio = new Audio("sounds/lego-yoda-death-sound-effect.mp3");
const playerVictoryAudio = new Audio("sounds/celebrate-good-times.mp3");
const gatherAudio = new Audio("sounds/skyrim-quest-update.mp3");
const huntFirstAudio = new Audio("sounds/amongus-death-sound-effect.mp3");
const huntSecondAudio = new Audio("sounds/bone-crack-sound-effect.mp3");
const restAudio = new Audio("sounds/minecraft-eating-sound-effect.mp3");

// Objects
const startingResources = {
    wood: 20,
    vine: 10,
    food: 30,
    stone: 20,
    obsidian: 0,
    fang: 0,
    energy: 70
};

const currentResources = {
    wood: 0,
    vine: 0,
    food: 0,
    stone: 0,
    obsidian: 0,
    fang: 0,
    energy: 100
};

const actionRequirements = {
    huntRequirements: {
        wood: 0,
        vine: 0,
        food: 0,
        stone: 0,
        energy: 10
    },
    gatherRequirements: {
        wood: 0,
        vine: 0,
        food: 0,
        stone: 0,
        energy: 20
    },
    restRequirements: {
        wood: 0,
        vine: 0,
        food: 10,
        stone: 0,
        energy: 0
    },
    sailRequirements: {
        wood: 0,
        vine: 0,
        food: 0,
        stone: 0,
        energy: 40
    }
};

const effectToModifierMap = {
    "double_wood": ["wood", 2.0],
    "quadruple_wood": ["wood", 4.0],
    "double_hunt": ["food", 2.0],
    "quadruple_hunt": ["food", 4.0]
};

const startingModifiers = {
    wood: 1.0,
    food: 1.0
};

const currentModifiers = {
    wood: 1.0,
    food: 1.0
};

// Global variables
let apiData = {};
let gameActive = false;

// Collections
const inventoryItemIds = [];

// Functions
const fetchApiData = async () => {
    apiData = {};
    await fetch(baseApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            apiData = data;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error.message);
        });
};

const getItemById = (id) => {
    for (const tool of apiData) {
        if (tool.id === id) {
            return tool;
        }
    }
    return false;
};

const setSelectOptions = () => {
    apiData.forEach(tool => {
        const option = document.createElement("option");
        option.value = tool.id;
        option.textContent = tool.title;
        itemSelect.appendChild(option);
    });
};

const getItemSelected = () => {
    const itemSelectedId = parseInt(itemSelect.value);
    return getItemById(itemSelectedId);
};

const isActionRequirementListFulfilled = (actionKey) => {
    if (!Object.hasOwn(actionRequirements, actionKey)) {
        return false;
    }
    
    const actionObj = actionRequirements[actionKey];
    if (currentResources.wood < actionObj.wood ||
        currentResources.vine < actionObj.vine ||
        currentResources.food < actionObj.food ||
        currentResources.stone < actionObj.stone ||
        currentResources.energy < actionObj.energy
    ) {
        return false;
    }

    if (actionKey === "sailRequirements" && !inventoryItemIds.includes(5)) {
        return false;
    }

    return true;
};

const purchaseAction = (actionKey) => {
    if (!isActionRequirementListFulfilled(actionKey)) {
        return false;
    }

    const actionObj = actionRequirements[actionKey];
    const woodAmount = actionObj.wood;
    const vineAmount = actionObj.vine;
    const foodAmount = actionObj.food;
    const stoneAmount = actionObj.stone;
    const energyAmount = actionObj.energy;

    changeResource("wood", -woodAmount);
    changeResource("vine", -vineAmount);
    changeResource("food", -foodAmount);
    changeResource("stone", -stoneAmount);
    changeResource("energy", -energyAmount);

    return true;
};

const isItemCraftable = (id, requirements) => {
    if (inventoryItemIds.includes(parseInt(id))) {
        return false;
    }

    if (!Array.isArray(requirements)) {
        return false;
    }

    for (let i = 0; i < requirements.length; i++) {
        const resourceAmountArray = requirements[i].split(" ");
        const amount = parseInt(resourceAmountArray[0]);
        const resource = resourceAmountArray.at(-1);
        if (!Object.hasOwn(currentResources, resource)) {
            return false;
        }

        if (currentResources[resource] < amount) {
            return false;
        }
    }

    return true;
};

const updateDisplay = () => {
    progressBar.style.width = String(currentResources.energy) + "%";
    inventoryWood.innerText = currentResources.wood;
    inventoryVines.innerText = currentResources.vine;
    inventoryFood.innerText = currentResources.food;
    inventoryStone.innerText = currentResources.stone;
    inventoryObsidian.innerText = currentResources.obsidian;
    inventoryFang.innerText = currentResources.fang;
};

const updateToolInfoDisplay = () => {
    const itemSelected = getItemSelected(); 
    const title = itemSelected["title"];
    const description = itemSelected["description"];
    const requirementArray = itemSelected["requirements"];
    const imgUrl = itemSelected["img-url"];

    toolInfoTitle.innerText = title;
    toolInfoDescription.innerText = description;

    toolInfoRequirements.replaceChildren();
    for (const requirement of requirementArray) {
        const toolInfoRequirement = document.createElement("li");
        toolInfoRequirement.innerText = requirement;
        toolInfoRequirements.appendChild(toolInfoRequirement);
    }

    toolInfoImg.src = imgUrl;
};

const updateButtonClickability = () => {
    let isActionAvailableArray = [];

    if (isActionRequirementListFulfilled("huntRequirements")) {
        huntBtn.disabled = false;
        isActionAvailableArray.push(true);
    } else {
        huntBtn.disabled = true;
        isActionAvailableArray.push(false);
    }
    
    if (isActionRequirementListFulfilled("gatherRequirements")) {
        gatherBtn.disabled = false;
        isActionAvailableArray.push(true);
    } else {
        gatherBtn.disabled = true;
        isActionAvailableArray.push(false);
    }
    
    if (isActionRequirementListFulfilled("restRequirements")) {
        restBtn.disabled = false;
        isActionAvailableArray.push(true);
    } else {
        restBtn.disabled = true;
        isActionAvailableArray.push(false);
    }
    
    if (isActionRequirementListFulfilled("sailRequirements")) {
        sailBtn.disabled = false;
        isActionAvailableArray.push(true);
    } else {
        sailBtn.disabled = true;
        isActionAvailableArray.push(false);
    }

    const noActionsAvailable = isActionAvailableArray.every(element => element === false);
    if (noActionsAvailable && gameActive) {
        setTimeout(() => {
            gameOver();
        }, 200);
        return;
    }

    const item = getItemSelected();
    const itemId = item["id"];
    const itemRequirements = item["requirements"];
    if (isItemCraftable(itemId, itemRequirements)) {
        craftBtn.disabled = false;
    } else {
        craftBtn.disabled = true;
    }
};

const addItemToInventory = (id, imgUrl) => {
    let inventoryItemWrapper = document.createElement("div");
    let inventoryItem = document.createElement("img");

    inventoryItemWrapper.className = "inventory-item-wrapper";
    inventoryItem.className = "inventory-item"
    inventoryItem.src = imgUrl;
    inventoryItemWrapper.appendChild(inventoryItem);
    inventory.appendChild(inventoryItemWrapper);

    inventoryItemIds.push(parseInt(id));
};

const removeItemsFromInventory = () => {
    inventoryItemIds.length = 0;
    inventory.replaceChildren();
};

const resetGame = async () => {
    await fetchApiData();
    removeItemsFromInventory();
    Object.assign(currentResources, startingResources);
    Object.assign(currentModifiers, startingModifiers);
    gameActive = true;
    updateDisplay();
    updateButtonClickability();
};

const gameOver = () => {
    gameActive = false;
    setTimeout(() => {
        playerDeathAudio.play();
    }, 10);
    setTimeout(() => {
        alert("Game Over!");
        resetGame();
    }, 10);
};

const gameVictory = () => {
    gameActive = false;
    setTimeout(() => {
        playerVictoryAudio.play();
    }, 10)
    setTimeout(() => {
        alert("YOU WIN!");
        resetGame();
    }, 200);
};

const getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const changeEnergy = (amount) =>  {
    const energy = Math.floor(parseFloat(progressBar.style.width));
    const newEnergy = energy + amount;
    if (newEnergy <= 0) {
        currentResources.energy = 0;
        updateDisplay();
        gameOver();
        return false;
    }
    
    if (newEnergy > 100) {
        currentResources.energy = 100;
    } else {
        currentResources.energy = newEnergy;
    }
    updateDisplay();
    return true;
};

const changeResource = (resource, amount) => {
    if (!Object.hasOwn(currentResources, resource)) {
        return false;
    }

    if (resource === "energy") {
        return changeEnergy(amount);
    }
    
    const newAmount = currentResources[resource] + amount;
    if (newAmount < 0) {
        return false;
    }

    currentResources[resource] = newAmount;

    updateDisplay();
    return true;
};

const purchaseItem = (id, requirements) => {
    if(!isItemCraftable(id, requirements)) {
        return false;
    }

    for (let i = 0; i < requirements.length; i++) {
        const resourceAmountArray = requirements[i].split(" ");
        const amount = parseInt(resourceAmountArray[0]);
        const resource = resourceAmountArray.at(-1);
        changeResource(resource, -amount);
    }

    return true;
};

const getCurrentModifierAmount = (modifierKey) => {
    if (!Object.hasOwn(currentModifiers, modifierKey)) {
        return 1.0;
    }

    return currentModifiers[modifierKey];
};

const applyEffectModifer = (effect) => {
    if (!Object.hasOwn(effectToModifierMap, effect)) {
        return;
    }

    const modifierKey = effectToModifierMap[effect][0];
    const modifierAmount = effectToModifierMap[effect][1];
    if (currentModifiers[modifierKey] < modifierAmount) {
        currentModifiers[modifierKey] = modifierAmount; 
    }
};

const craftItem = () => {
    const itemSelected = getItemSelected();
    const id = itemSelected["id"];
    const requirements = itemSelected["requirements"];
    const effect = itemSelected["effect"];
    const url = itemSelected["img-url"];

    if (!purchaseItem(id, requirements)) {
        return;
    }
    applyEffectModifer(effect);
    addItemToInventory(id, url);
};

const performHuntAction = () => {
    if (!purchaseAction("huntRequirements")) {
        return false;
    }

    let foodAmount = getRandomIntInclusive(1, 20) * Math.floor(getCurrentModifierAmount("food"));
    let fangAmount = Math.floor(parseFloat(getRandomIntInclusive(1, 10)) / 10.0); // <-- 10% chance
    changeResource("food", foodAmount);
    changeResource("fang", fangAmount);
    return true;
};

const performGatherAction = () => {
    if (!purchaseAction("gatherRequirements")) {
        return false;
    }
    
    let woodAmount = getRandomIntInclusive(1, 10) * Math.floor(getCurrentModifierAmount("wood"));
    let vineAmount = getRandomIntInclusive(1, 10);
    let foodAmount = getRandomIntInclusive(1, 10) * Math.floor(getCurrentModifierAmount("food"));
    let stoneAmount = getRandomIntInclusive(1, 5);
    let obsidianAmount = Math.floor(parseFloat(getRandomIntInclusive(1, 10)) / 10.0); // <- 10% chance

    changeResource("wood", woodAmount);
    changeResource("vine", vineAmount);
    changeResource("food", foodAmount);
    changeResource("stone", stoneAmount);
    changeResource("obsidian", obsidianAmount);
    return true;
};

const performRestAction = () => {
    if (!purchaseAction("restRequirements")) {
        return false;
    }

    let energyAmount = getRandomIntInclusive(1, 20);
    changeResource("energy", energyAmount);
    return true;
};

const performSailAction = () => {
    return purchaseAction("sailRequirements");
};

const onHuntBtnClick = () => {
    if (!performHuntAction()) {
        return;
    }

    setTimeout(() => {
        huntFirstAudio.play();
    }, 10);
    setTimeout(() => {
        huntSecondAudio.play();
    }, 500);
};

const onGatherBtnClick = () => {
    if (!performGatherAction()) {
        return;
    }

    gatherAudio.play();
};

const onRestBtnClick = () => {
    if (!performRestAction()) {
        return;
    }

    restAudio.play();
};

const onSailBtnClick = () => {
    if (!performSailAction()) {
        return;
    }

    gameVictory();
};

const onCraftBtnClick = () => {
    craftItem();
    updateButtonClickability();
};

const onAnyBtnClick = () => {
    updateButtonClickability();
};

const onItemSelectChange = () => {
    updateButtonClickability();
    updateToolInfoDisplay();
};

huntBtn.addEventListener("click", onHuntBtnClick);
gatherBtn.addEventListener("click", onGatherBtnClick);
restBtn.addEventListener("click", onRestBtnClick);
sailBtn.addEventListener("click", onSailBtnClick);
craftBtn.addEventListener("click", onCraftBtnClick);

for (let i = 0; i < allBtns.length; i++) {
    allBtns[i].addEventListener("click", onAnyBtnClick);
}

itemSelect.addEventListener("change", onItemSelectChange);

window.onload = async () => {
    await resetGame();
    setSelectOptions();
    updateToolInfoDisplay();
    updateButtonClickability();
};