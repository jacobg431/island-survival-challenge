const huntBtn = document.getElementById("huntBtn");
const gatherBtn = document.getElementById("gatherBtn");
const restBtn = document.getElementById("restBtn");
const sailBtn = document.getElementById("sailBtn");
const craftBtn = document.getElementById("craftBtn");

let onHuntBtnClick = () => {
    console.log("Hunt button was clicked!");
}
let onGatherBtnClick = () => {
    console.log("Gather button was clicked!");
}
let onRestBtnClick = () => {
    console.log("Rest button was clicked!");
}
let onSailBtnClick = () => {
    console.log("Sail button was clicked!");
}
let onCraftBtnClick = () => {
    console.log("Craft button was clicked!");
}

huntBtn.addEventListener("click", onHuntBtnClick);
gatherBtn.addEventListener("click", onGatherBtnClick);
restBtn.addEventListener("click", onRestBtnClick);
sailBtn.addEventListener("click", onSailBtnClick);
craftBtn.addEventListener("click", onCraftBtnClick);