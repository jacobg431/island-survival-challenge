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
const updateDisplay = () => {
    progressBar.style.width = String(currentResources.energy) + "%";
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
const onCraftBtnClick = () => {
    addItemToInventory("https://res.cloudinary.com/dvwpcohmk/image/upload/v1770034511/Axe_yrbpm2.png");
}

huntBtn.addEventListener("click", onHuntBtnClick);
gatherBtn.addEventListener("click", onGatherBtnClick);
restBtn.addEventListener("click", onRestBtnClick);
sailBtn.addEventListener("click", onSailBtnClick);
craftBtn.addEventListener("click", onCraftBtnClick);

resetGame();