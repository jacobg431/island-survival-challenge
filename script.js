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
    energy: 70
};

const currentResources = {
    wood: 0,
    vine: 0,
    food: 0,
    stone: 0,
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
}

// Collections
const inventoryItemIds = [];

// Functions
const fetchApiData = async () => {
    let resultObj;
    await fetch(baseApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            return resultObj = data;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error.message);
        });

    return resultObj;
}

const getToolItemById = async (id) => {
    let resultObj = await fetchApiData();
    if (!resultObj) {
        alert("There was an error getting the API data!");
        return;
    }
    for (const tool of resultObj) {
        if (tool.id === id) {
            return tool;
        }
    }
    return false;
}

const setSelectOptions = async () => {
    let resultObj = await fetchApiData();
    if (!resultObj) {
        alert("There was an error getting the API data!");
        return;
    }
    resultObj.forEach(tool => {
        const option = document.createElement("option");
        option.value = tool.id;
        option.textContent = tool.title
        itemSelect.appendChild(option);
    });
}

const getItemSelected = async () => {
    const itemSelectedId = parseInt(itemSelect.value);
    return await getToolItemById(itemSelectedId);
}

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
} 

const isItemCraftable = (id, requirements) => {
    if (inventoryItemIds.includes(parseInt(id))) {
        return;
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
}

const updateDisplay = () => {
    progressBar.style.width = String(currentResources.energy) + "%";
    inventoryWood.innerText = currentResources.wood;
    inventoryVines.innerText = currentResources.vine;
    inventoryFood.innerText = currentResources.food;
    inventoryStone.innerText = currentResources.stone;
}

const updateToolInfoDisplay = async () => {
    const itemSelected = await getItemSelected(); 
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
}

const updateButtonClickability = async (selectOptionChange = false) => {
    if (isActionRequirementListFulfilled("huntRequirements")) {
        huntBtn.disabled = false;
    } else {
        huntBtn.disabled = true;
    }
    
    if (isActionRequirementListFulfilled("gatherRequirements")) {
        gatherBtn.disabled = false;
    } else {
        gatherBtn.disabled = true;
    }
    
    if (isActionRequirementListFulfilled("restRequirements")) {
        restBtn.disabled = false;
    } else {
        restBtn.disabled = true;
    }
    
    if (isActionRequirementListFulfilled("sailRequirements")) {
        sailBtn.disabled = false;
    } else {
        sailBtn.disabled = true;
    }

    if (!selectOptionChange) {
        return;
    }

    const item = await getItemSelected();
    const itemId = item["id"];
    const itemRequirements = item["requirements"];
    if (isItemCraftable(itemId, itemRequirements)) {
        craftBtn.disabled = false;
    } else {
        craftBtn.disabled = true;
    }
}

const addItemToInventory = (id, requirements, imgUrl) => {
    if (!isItemCraftable(id, requirements, imgUrl)) {
        return;
    }

    let inventoryItemWrapper = document.createElement("div");
    let inventoryItem = document.createElement("img");

    inventoryItemWrapper.className = "inventory-item-wrapper";
    inventoryItem.className = "inventory-item"
    inventoryItem.src = imgUrl;
    inventoryItemWrapper.appendChild(inventoryItem);
    inventory.appendChild(inventoryItemWrapper);

    inventoryItemIds.push(parseInt(id));
}

const removeItemsFromInventory = () => {
    inventoryItemIds.length = 0;
    inventory.replaceChildren();
}

const resetGame = () => {
    removeItemsFromInventory();
    Object.assign(currentResources, startingResources);
    updateDisplay();
    updateButtonClickability(true);
}

const gameOver = () => {
    setTimeout(() => {
        playerDeathAudio.play();
        alert("Game Over!");
        resetGame();
    }, 10);
}

const gameVictory = () => {
    setTimeout(() => {
        playerVictoryAudio.play();
        alert("YOU WIN!");
        resetGame();
    }, 10);
}

const getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const changeWood = (amount) => {
    const newWood = currentResources.wood + amount;
    if (newWood < 0) {
        return false;
    }

    currentResources.wood = newWood;
    updateDisplay();
    return true;
}

const changeVines = (amount) => {
    const newVines = currentResources.vine + amount;
    if (newVines < 0) {
        return false;
    }

    currentResources.vine = newVines;
    updateDisplay();
    return true;
}

const changeFood = (amount) => {
    const newFood = currentResources.food + amount;
    if (newFood < 0) {
        return false;
    }

    currentResources.food = newFood;
    updateDisplay();
    return true;
}

const changeStone = (amount) => {
    const newStone = currentResources.stone + amount;
    if (newStone < 0) {
        return false;
    }

    currentResources.stone = newStone;
    updateDisplay();
    return true;
}

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
}

const onHuntBtnClick = () => {
    if (!changeEnergy(-20)) {
        return;
    }

    let foodAmount = getRandomIntInclusive(1, 20);
    changeFood(foodAmount);
}

const onGatherBtnClick = () => {
    if (!changeEnergy(-10)) {
        return;
    }

    let woodAmount = getRandomIntInclusive(1, 10);
    let vineAmount = getRandomIntInclusive(1, 10);
    let foodAmount = getRandomIntInclusive(1, 10);
    let stoneAmount = getRandomIntInclusive(1, 5);

    changeWood(woodAmount);
    changeVines(vineAmount);
    changeFood(foodAmount);
    changeStone(stoneAmount);
}

const onRestBtnClick = () => {
    if (!changeFood(-10)) {
        return;
    }

    let energyAmount = getRandomIntInclusive(1, 20);
    changeEnergy(energyAmount);
}

const onSailBtnClick = () => {
    if (!getToolItemById()) {
        return;
    }
    
    if (!changeEnergy(-40)) {
        return;
    }

    gameVictory();
}

const onCraftBtnClick = async () => {
    const itemSelected = await getItemSelected();
    const itemId = itemSelected["id"];
    const itemRequirements = itemSelected["requirements"];
    const itemUrl = itemSelected["img-url"];
    addItemToInventory(itemId, itemRequirements, itemUrl);
    updateButtonClickability();
}

const onAnyBtnClick = () => {
    updateButtonClickability();
}

const onItemSelectChange = async () => {
    await updateButtonClickability(true);
    await updateToolInfoDisplay();
}

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
    resetGame();
    await setSelectOptions();
    await updateToolInfoDisplay();
    updateButtonClickability();
}