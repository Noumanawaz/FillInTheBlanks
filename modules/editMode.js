import { playSound, hideScreen, showScreen } from "./utils.js";

// ----------- //
//  EDIT MODE  //
// ----------- //
export const handleEditModeButtonClick = (params) => {
  playSound(params.clickSound);

  // Disable Editing Mode
  if (params.isEditing.value) {
    params.isEditing.value = false;

    // Show refresh button
    if (params.refreshBtn) {
      params.refreshBtn.style.display = "block";
    }

    // Hide the bin tooltip
    if (params.btnClicks !== null && params.btnClicks !== undefined) {
      params.binTooltip.style.display = "none";
      params.binTooltipRectangle.style.display = "none";
    }

    // Make the title & the description non-editable
    title.contentEditable = false;
    description.contentEditable = false;

    title.style.border = description.style.border = "2px solid transparent";

    // Update the item styles
    for (let i = 0; i < params.items.length; i++) {
      if (params.game === "cypher" || params.game === "skeleton" || params.game === "wrh") {
        params.items[i].style.cursor = params.items[i].id.includes("symbol") ? "default" : "grab";
      } else {
        params.items[i].style.cursor = params.cursorType;
      }

      params.items[i].style.border = "1px solid transparent";
    }

    params.items[0].style.cursor = "pointer";

    // Remove the Button's Resize boxes
    if (params.showTooltip.value) {
      for (let i = 0; i < 4; i++) {
        params.resizeBoxes[i].style.visibility = "hidden";
      }
    }

    // Remove the Resize boxes
    for (let i = 0; i < params.resizeBoxes.length; i++) {
      params.resizeBoxes[i].style.visibility = "hidden";
    }

    // Hide all edit mode buttons
    for (let i = 0; i < params.editModeBtns.length; i++) {
      params.editModeBtns[i].style.display = "none";
    }

    if (params.currSelectedElement) params.currSelectedElement.value = null;

    if (params.settingsScreen) {
      hideScreen(params.settingsScreen);
    }
  }

  // Enable Editing Mode
  else {
    params.isEditing.value = true;

    // Hide refresh button
    if (params.refreshBtn) {
      params.refreshBtn.style.display = "none";
    }

    // Show the bin tooltip
    if (params.btnClicks !== null && params.btnClicks !== undefined && params.btnClicks.value < 2) {
      params.btnClicks.value += 1;

      params.binTooltip.style.display = "block";
      params.binTooltipRectangle.style.display = "block";

      setTimeout(() => {
        params.binTooltip.style.display = "none";
        params.binTooltipRectangle.style.display = "none";
      }, 5000);
    }

    // Game Tooltip is open
    if (params.isTooltipOpen.value) {
      title.contentEditable = true;
      description.contentEditable = true;

      title.style.border = description.style.border = "2px solid #9fabc7";
      params.btnDiv.style.cursor = "default";
    }

    // Game Tooltip is not open
    else {
      // Update the Item's styles
      for (let i = 0; i < params.items.length; i++) {
        params.items[i].style.cursor = "move";
        params.items[i].style.border = "1px solid red";
      }

      // Show all edit mode buttons
      for (let i = 0; i < params.editModeBtns.length; i++) {
        params.editModeBtns[i].style.display = "block";
      }
    }
  }
};

export const handleSettingsButtonClick = (params) => {
  if (params.isAddingItems) handleAddItemsCloseButtonClick(params);
  if (params.saveScreen) handleSaveCloseButtonClick(params);
  // Show or hide other elements
  if (params.isAddingItems && params.isAddingItems.value) {
    handleAddItemsButtonClick({
      isAddingItems: params.isAddingItems,
      itemsAdditionScreen: params.itemsAdditionScreen,
      cleanUp: params.cleanUp,
      clickSound: params.clickSound,
      settingsScreen: params.settingsScreen,
    });
  }

  if (params.itemsAdditionScreen) hideScreen(params.itemsAdditionScreen);

  // Play the sound
  playSound(params.clickSound);

  // Show or hide the screen
  const isHidden = params.settingsScreen.style.display === "none" || parseInt(params.settingsScreen.style.zIndex || "-1") < 0;

  isHidden ? showScreen(params.settingsScreen) : hideScreen(params.settingsScreen);
};

export const handleSettingsCloseButtonClick = (params) => {
  playSound(params.clickSound);
  hideScreen(params.settingsScreen);
};

export const handleAddItemsButtonClick = (params) => {
  handleSettingsCloseButtonClick(params);
  handleSaveCloseButtonClick(params);
  params.isAddingItems.value = !params.isAddingItems.value;

  // Edit Mode button was clicked
  if (params.cleanUp) return;
  playSound(params.clickSound);

  // if (params.isAddingItems) {
  //   showScreen(params.itemsAdditionScreen);
  //   hideScreen(params.settingsScreen);
  // }

  // Show or hide the screen
  const isHidden = params.itemsAdditionScreen.style.display === "none" || parseInt(params.itemsAdditionScreen.style.zIndex || "-1") < 0;
  isHidden ? showScreen(params.itemsAdditionScreen) : hideScreen(params.itemsAdditionScreen);
};

export const handleAddItemsCloseButtonClick = (params) => {
  playSound(params.clickSound);
  params.isAddingItems.value = false;

  hideScreen(params.itemsAdditionScreen);
};

export const handleSaveButtonClick = (params) => {
  // Show or hide other elements
  // for (let i = 0; i < params.screensToHide.length; i++) {
  //   params.screensToHide[i].style.display = "none";
  // }
  if (params.isAddingItems) handleAddItemsCloseButtonClick(params);
  handleSettingsCloseButtonClick(params);

  // Play the sound
  playSound(params.clickSound);

  // Show or hide the screen
  const isHidden = params.saveScreen.style.display === "none" || parseInt(params.saveScreen.style.zIndex || "-1") < 0;

  isHidden ? showScreen(params.saveScreen) : hideScreen(params.saveScreen);
};

export const handleSaveCloseButtonClick = (params) => {
  playSound(params.clickSound);
  hideScreen(params.saveScreen);
};

export const addTagOrSetting = (params) => {
  // The input field is empty or max items have been added
  if (params.targetInput.value === "" || params.arr.length === 5) return;

  // Check if the item already exists
  for (let i = 0; i < params.arr.length; i++) {
    if (params.arr[i].dataset.value === params.targetInput.value) return;
  }

  // Create a container for the item and delete button
  const itemContainer = document.createElement("div");
  itemContainer.style.display = "flex";
  itemContainer.style.alignItems = "center";
  itemContainer.style.gap = "1rem";
  itemContainer.style.marginBottom = "0.5rem";
  itemContainer.style.position = "relative";

  // Create the item text
  const item = document.createElement("p");
  item.style.fontWeight = "200";
  item.style.fontSize = "30px";
  item.textContent = params.targetInput.value;
  item.dataset.value = params.targetInput.value;

  // Create delete button
  const deleteBtn = document.createElement("img");
  deleteBtn.src = "../assets/images/minus.webp";
  deleteBtn.width = 37.5;
  deleteBtn.height = 37.5;
  deleteBtn.style.cursor = "pointer";

  // Add event listener to delete button
  deleteBtn.addEventListener("click", () => {
    // Remove from DOM
    itemContainer.remove();

    // Remove from array
    const index = params.arr.findIndex((el) => el.dataset.value === item.dataset.value);
    if (index !== -1) {
      params.arr.splice(index, 1);
    }
  });

  // Assemble the container
  itemContainer.appendChild(item);
  itemContainer.appendChild(deleteBtn);

  // Append to the target div
  params.targetDiv.appendChild(itemContainer);

  // Add to the corresponding array
  params.arr.push(item);

  // Clear the input
  params.targetInput.value = "";
};
