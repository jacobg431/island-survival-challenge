// HTML Elements
const huntBtn = document.getElementById("hunt-button");
const gatherBtn = document.getElementById("gather-button");
const restBtn = document.getElementById("rest-button");
const sailBtn = document.getElementById("sail-button");
const craftBtn = document.getElementById("craft-button");

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

const baseApiUrl = "https://island-survival-kit-builder.onrender.com/tools";
const playerDeathAudio = new Audio("sounds/lego-yoda-death-sound-effect.mp3");

// Objects
const startingResources = {
    wood: 20,
    vines: 10,
    food: 30,
    stone: 20,
    energy: 70
}

const currentResources = {
    wood: 0,
    vines: 0,
    food: 0,
    stone: 0,
    energy: 100
}

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
    alert("Item does not exist!")
    return;
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

const updateDisplay = () => {
    progressBar.style.width = String(currentResources.energy) + "%";
    inventoryWood.innerText = currentResources.wood;
    inventoryVines.innerText = currentResources.vines;
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

const resetGame = () => {
    Object.assign(currentResources, startingResources);
    updateDisplay();
}

const gameOver = () => {
    setTimeout(() => {
        playerDeathAudio.play();
        alert("Game Over!");
        resetGame();
    }, 10);
}

const changeEnergy = async (amount) =>  {
    const energy = Math.floor(parseFloat(progressBar.style.width));
    const newEnergy = energy + amount;
    if (newEnergy <= 0) {
        currentResources.energy = 0;
        updateDisplay();
        gameOver();
        return;
    }
    
    if (newEnergy > 100) {
        currentResources.energy = 100;
    } else {
        currentResources.energy = newEnergy;
    }
    updateDisplay();
}

const addItemToInventory = (imgUrl) => {
    let inventoryItemWrapper = document.createElement("div");
    let inventoryItem = document.createElement("img");
    inventoryItemWrapper.className = "inventory-item-wrapper";
    inventoryItem.className = "inventory-item"
    inventoryItem.src = imgUrl;
    inventoryItemWrapper.appendChild(inventoryItem);
    inventory.appendChild(inventoryItemWrapper);
}

const onHuntBtnClick = () => {
    changeEnergy(-10);
}
const onGatherBtnClick = () => {
    console.log("Gather button was clicked!");
}
const onRestBtnClick = () => {
    console.log("Rest button was clicked!");
}
const onSailBtnClick = () => {
    console.log("Sail button was clicked!");
}
const onCraftBtnClick = async () => {
    const itemSelected = await getItemSelected();
    const itemUrl = itemSelected["img-url"];
    addItemToInventory(itemUrl);
}

const onItemSelectChange = async () => {
    await updateToolInfoDisplay();
}

huntBtn.addEventListener("click", onHuntBtnClick);
gatherBtn.addEventListener("click", onGatherBtnClick);
restBtn.addEventListener("click", onRestBtnClick);
sailBtn.addEventListener("click", onSailBtnClick);
craftBtn.addEventListener("click", onCraftBtnClick);
itemSelect.addEventListener("change", onItemSelectChange);

window.onload = async () => {
    resetGame();
    await setSelectOptions();
    await updateToolInfoDisplay();
}