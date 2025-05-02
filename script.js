import { handleAudioUpload } from "./modules/audioUpload.js";
import { handleItemContextMenu } from "./modules/contextMenu.js";
import { handleDragStart, handleDragEnd } from "./modules/dragHandlers.js";
import { handleEditModeButtonClick, handleSettingsButtonClick, handleSettingsCloseButtonClick, handleAddItemsButtonClick, handleAddItemsCloseButtonClick, handleSaveButtonClick, handleSaveCloseButtonClick, addTagOrSetting } from "./modules/editMode.js";
import { handleSingleImageUpload, handleChangeImageUpload } from "./modules/imageUpload.js";
import { handleResizeStart } from "./modules/resizeHandlers.js";
import { handleButtonClick, handleDescriptionInput, handleDescriptionKeyDown, handleTitleInput, handleTitleKeyDown, btnOffHandler, btnOnHandler, btnBlackHandler, btnWhiteHandler } from "./modules/tooltip.js";
import { playSound, hideScreen, handleDownScaling, handleUpScaling, handleElementClick, disallowDelete } from "./modules/utils.js";

// ------------------ //
//  HELPER FUNCTIONS  //
// ------------------ //
function initializeDropzones() {
  document.querySelectorAll(".dropzone").forEach((zone) => {
    zone.removeEventListener("dragover", handleDragOver);
    zone.removeEventListener("dragleave", handleDragLeave);
    zone.removeEventListener("drop", handleDrop);

    zone.addEventListener("dragover", handleDragOver);
    zone.addEventListener("dragleave", handleDragLeave);
    zone.addEventListener("drop", handleDrop);
  });
}

function makeItemsDraggable() {
  // Function to handle making an element draggable when resize handles are visible
  function setUpDraggableElement(element) {
    // Get the resize handles for this element
    const resizeHandles = Array.from(document.querySelectorAll(`[id^="resizeBox${element.id.replace("divItem", "")}"]`));

    // Check if any resize handle is visible
    if (resizeHandles.some((handle) => handle && window.getComputedStyle(handle).visibility === "visible")) {
      // Make this element draggable
      element.draggable = true;

      // Remove existing listeners to avoid duplicates
      element.removeEventListener("dragstart", handleElementDragStart);
      element.removeEventListener("dragend", handleElementDragEnd);

      // Add new drag listeners
      element.addEventListener("dragstart", handleElementDragStart);
      element.addEventListener("dragend", handleElementDragEnd);
    }

    // Make sure it's not draggable if handles aren't visible
    else element.draggable = false;
  }

  // Handler for drag start
  function handleElementDragStart(e) {
    if (!isEditing.value) return;

    // Set data transfer
    e.dataTransfer.setData("text/plain", this.id);
    e.dataTransfer.effectAllowed = "move";

    // Set visual cue
    this.style.opacity = "0.5";
    isDragging.value = this.id;
  }

  // Handler for drag end
  function handleElementDragEnd() {
    if (!isEditing.value) return;

    // Reset visual state
    this.style.opacity = "1";
    isDragging.value = false;
  }

  // Make words in the word pool draggable
  document.querySelectorAll("#wordPool > div").forEach(setUpDraggableElement);

  // Make the category headers draggable
  document.querySelectorAll("#categoryTableHead > div").forEach((header) => {
    const updateHeader = (a, b) => {
      header.style.opacity = a;
      isDragging.value = b;
    };

    if (isEditing.value) {
      header.draggable = true;

      header.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", header.id); // Use full ID (e.g., "th-Fruits")
        updateHeader("0.5", header.id); // Use full ID
      });

      header.addEventListener("dragend", () => updateHeader("1", false));
    } else header.draggable = false;
  });

  // Set up document to accept drops anywhere
  document.body.addEventListener("dragover", (e) => {
    if (!isEditing.value) return;
    e.preventDefault(); // Allow drop

    return false;
  });

  document.body.addEventListener("drop", (e) => {
    if (!isEditing.value) return;
    e.preventDefault();

    const elementId = e.dataTransfer.getData("text/plain");
    const draggedElement = document.getElementById(elementId);

    if (!draggedElement) return;

    // Position the element at drop location - Need to adjust for any offset from the original mousedown position
    draggedElement.style.position = "absolute";
    draggedElement.style.left = `${e.clientX}px`;
    draggedElement.style.top = `${e.clientY}px`;

    // If it's a word from a category, move it to the document body so it can be freely positioned
    if (draggedElement.parentElement.classList.contains("dropzone")) document.body.appendChild(draggedElement);
    return false;
  });
}

document.querySelectorAll(".word").forEach((word) => word.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", e.target.id)));

function handleDragOver(e) {
  e.preventDefault();
  this.style.backgroundColor = "#e0e0e0";
}

function toggleBouncing(isTooltipOpen) {
  document.querySelectorAll(".word").forEach((word) => {
    // Stop the bouncing animation & trigger reflow to reset the animation
    if (isTooltipOpen) {
      word.style.animation = "none";
      void word.offsetHeight;
    }

    // Resume the bouncing animation
    else word.style.animation = "bounce 1.2s infinite alternate ease-in-out";
  });
}

const handleDragLeave = () => (this.style.backgroundColor = "");

function handleDrop(e) {
  e.preventDefault();
  this.style.backgroundColor = "";

  const wordId = e.dataTransfer.getData("text/plain");
  const wordEl = document.getElementById(wordId);

  if (!wordEl) {
    console.error(`Element with id "${wordId}" not found.`);
    return;
  }

  // Green
  if (categoryMap[this.id]?.includes(wordEl.textContent.trim())) {
    this.appendChild(wordEl);
    score += 10;
    droppedWords++;
  }

  // Red
  else {
    wordEl.style.backgroundColor = "#f7c5c5";
    score -= 5;
  }
  document.getElementById("scoreDisplay").textContent = `Score: ${score}`;
  if (droppedWords === totalWords) {
    setTimeout(() => {
      alert("🎉 You win! Final Score: " + score);
    }, 100);
  }
}

const categoryMap = { Fruits: ["Apple", "Banana", "Cherry", "Lemon"], Animals: ["Dolphin", "Eagle", "Frog"], Objects: ["Kite", "Guitar", "House", "Notebook", "Ocean"] };

// ------------------- //
//  CATEGORY ADDITION  //
// ------------------- //
window.addCategoryColumn = function (name, words = []) {
  // Add new category column - fix window.addCategoryColumn function to work with divs
  if (!name || typeof name !== "string") {
    console.error("Invalid category name:", name);
    return;
  }

  const id = name.trim().replace(/\s+/g, "-"); // Replace spaces with hyphens for consistency
  categoryMap[id] = words;

  const headerRow = document.querySelector("#categoryTableHead");
  const bodyRow = document.querySelector("#categoryTableBody");

  // Create header div with absolute positioning
  const headerDiv = document.createElement("div");
  headerDiv.id = `th-${id}`;
  headerDiv.innerText = name;
  headerDiv.className = "category-header";
  headerDiv.style.cssText = ` position: absolute; padding: 10px; width: 150px; text-align: center; font-weight: bold; border: 1px solid #000; background-color: #f0f0f0; cursor: move; z-index: 10; left: ${headerRow.children.length * 170}px;`;
  headerRow.appendChild(headerDiv);

  // Create body div with absolute positioning
  const bodyDiv = document.createElement("div");
  bodyDiv.className = "dropzone";
  bodyDiv.id = id;
  bodyDiv.style.cssText = `position: absolute; width: 150px; min-height: 150px; border: 1px solid #000; background-color: white; overflow-y: auto; z-index: 5; left: ${bodyRow.children.length * 170}px; top: ${headerDiv.offsetHeight + 5}px;`;
  bodyRow.appendChild(bodyDiv);

  // Add drag functionality to the header
  makeHeaderDraggable(headerDiv, bodyDiv);

  // Reattach drop event handlers
  initializeDropzones();
};

function makeHeaderDraggable(headerDiv, bodyDiv) {
  function dragMouseDown(e) {
    if (!isEditing.value) return;
    e.preventDefault();

    offsetX = e.offsetX;
    offsetY = e.offsetY;

    headerDiv.style.zIndex = "2000";
    bodyDiv.style.zIndex = "1999";

    headerDiv.style.opacity = bodyDiv.style.opacity = "0.8";

    document.onmousemove = elementDrag;
    document.onmouseup = closeDragElement;
  }

  function elementDrag(e) {
    e.preventDefault();
    const parentRect = headerDiv.parentElement.getBoundingClientRect();

    const newX = e.clientX - parentRect.left - offsetX;
    const newY = e.clientY - parentRect.top - offsetY;

    moveAt(newX, newY);
  }

  function moveAt(pageX, pageY) {
    headerDiv.style.left = bodyDiv.style.left = `${pageX}px`;
    headerDiv.style.top = `${pageY}px`;
    bodyDiv.style.top = `${pageY + headerDiv.offsetHeight + 5}px`;
  }

  function closeDragElement() {
    headerDiv.style.opacity = bodyDiv.style.opacity = "1";
    headerDiv.style.zIndex = "10";
    bodyDiv.style.zIndex = "5";

    document.onmousemove = document.onmouseup = null;

    if (areChangesSaved && areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
      toggleSaveChangesBtn();
    }
  }

  let offsetX, offsetY;
  headerDiv.onmousedown = dragMouseDown;
}

function updateLayoutForFreeMovement() {
  const categoryTableHead = document.getElementById("categoryTableHead");
  const categoryTableBody = document.getElementById("categoryTableBody");

  // Update container styles
  if (categoryTableHead) {
    categoryTableHead.style.position = "relative";
    categoryTableHead.style.height = "50px";
    categoryTableHead.style.width = "100%";
  }

  if (categoryTableBody) {
    categoryTableBody.style.position = "relative";
    categoryTableBody.style.minHeight = "200px";
    categoryTableBody.style.width = "100%";
  }

  // Convert existing headers and dropzones to absolute positioning

  document.querySelectorAll("#categoryTableHead > div").forEach((header, index) => {
    header.style.position = "absolute";
    header.style.width = "150px";
    header.style.left = index * 170 + "px";
    header.className = "category-header";

    // Find corresponding dropzone
    const categoryId = header.id.replace("th-", "");
    const dropzone = document.getElementById(categoryId);

    if (dropzone) {
      dropzone.style.position = "absolute";
      dropzone.style.width = "150px";
      dropzone.style.left = index * 170 + "px";
      dropzone.style.top = header.offsetHeight + 5 + "px";

      // Make this pair draggable
      makeHeaderDraggable(header, dropzone);
    }
  });
}

// Update the CSS to add some styling
function addFreeMovementStyles() {
  const styleEl = document.createElement("style");

  styleEl.innerHTML = `
    .category-header { cursor: move; user-select: none; transition: background-color 0.2s, box-shadow 0.2s; }
    .category-header:hover { background-color: #e0e0e0; }
    .category-header:active { background-color: #d0d0d0; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); }
    .dropzone { transition: background-color 0.2s; height:auto; }
  `;

  document.head.appendChild(styleEl);
}

// Initialize everything when edit mode is enabled
function initializeFreeMovement() {
  updateLayoutForFreeMovement();
  addFreeMovementStyles();

  // Add double-click to edit feature for category headers
  document.querySelectorAll(".category-header").forEach((header) => {
    header.addEventListener("dblclick", function () {
      if (!isEditing.value) return;

      const currentName = this.innerText;
      const newName = prompt("Edit category name:", currentName);

      if (newName && newName !== currentName) {
        // Update the category name in the map
        const oldId = this.id.replace("th-", "");

        delete categoryMap[oldId];
        categoryMap[newName] = categoryMap[oldId];

        // Update the DOM
        this.innerText = newName;
        this.id = `th-${newName}`;

        // Update the corresponding dropzone id
        const dropzone = document.getElementById(oldId);
        if (dropzone) dropzone.id = newName;

        // Signal unsaved changes
        if (areChangesSaved.value) {
          areChangesSaved.value = false;
          toggleSaveChangesBtn();
        }
      }
    });
  });
}

// ---------------- //
//  ITEMS ADDITION  //
// ---------------- //
window.addWordToPool = function (wordText, id) {
  const wordDiv = document.createElement("div");
  wordDiv.id = `divItem${id}`;
  wordDiv.style.cssText = `position: relative; display: inline-block; margin: 5px; background-color: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 10px;`;

  const span = document.createElement("span");
  span.className = "word";
  span.id = `item${id}`;
  span.draggable = true;
  span.innerText = wordText;

  span.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", span.id));
  wordDiv.appendChild(span);

  // Add Resize Handle Divs (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
  ["TL", "TR", "BL", "BR"].forEach((dir) => {
    const resizeBox = document.createElement("div");
    resizeBox.id = `resizeBox${id}${dir}`;
    resizeBox.style.cssText = `position: absolute; ${dir.includes("T") ? "top: -6px;" : "bottom: -6px;"} ${dir.includes("L") ? "left: -6px;" : "right: -6px;"} width: 14px; height: 14px; cursor: ${dir === "TL" || dir === "BR" ? "nwse-resize" : "nesw-resize"}; border-radius: 100%; visibility: hidden; background-color: white; border: 1px solid red; z-index: 4001;`;
    wordDiv.appendChild(resizeBox);

    // Add the resize box to the global resizeBoxes array
    resizeBoxes.push(resizeBox);
  });

  const wordPool = document.getElementById("wordPool");
  if (wordPool) {
    wordPool.appendChild(wordDiv);
    totalWords++;
  } else console.error("Word pool container not found.");
};

function initializeCategoryDrag() {
  // Optional: Remove reordering logic if free movement is the only requirement - if reordering is still needed, ensure it doesn't interfere with free dragging
  document.querySelectorAll("#categoryTableHead > div").forEach((header) => {
    // Remove existing drag listeners to avoid conflicts
    header.removeEventListener("dragstart", handleDragStart);
    header.removeEventListener("dragend", handleDragEnd);
    header.removeEventListener("dragover", handleDragOver);
    header.removeEventListener("dragleave", handleDragLeave);
    header.removeEventListener("drop", handleDrop);
  });
}

// ---------------- //
//  ITEMS MOVEMENT  //
// ---------------- //

// Populate the category dropdown with available categoryMap
function populateCategoryDropdown() {
  const categoryDropdown = document.getElementById("categoryDropdown");
  categoryDropdown.innerHTML = "";

  Object.keys(categoryMap).forEach((categoryId) => {
    const option = document.createElement("option");
    option.value = categoryId;
    option.textContent = categoryId.replace(/-/g, " ");
    categoryDropdown.appendChild(option);
  });
}

// Event listener for the "Add Category" button
document.getElementById("addCategoryBtn").addEventListener("click", () => {
  const categoryName = document.getElementById("newCategoryName").value.trim();

  if (!categoryName) {
    alert("Please enter a category name.");
    return;
  }

  window.addCategoryColumn(categoryName, []);
  itemsAdditionScreen.style.display = "none";

  document.getElementById("newCategoryName").value = "";
  populateCategoryDropdown();
});

// Add event listener for the "Add Word" button
document.getElementById("addWordBtn").addEventListener("click", () => {
  const wordText = document.getElementById("newWordText").value.trim();
  const selectedCategory = document.getElementById("categoryDropdown").value;

  if (!wordText) {
    alert("Please enter a word.");
    return;
  }

  if (!selectedCategory) {
    alert("Please select a category.");
    return;
  }

  if (categoryMap[selectedCategory]) {
    categoryMap[selectedCategory].push(wordText);
    window.addWordToPool(wordText, Date.now()); // Use a unique ID for the word

    // Close the items addition screen
    const itemsAdditionScreen = document.getElementById("itemsAddition");
    itemsAdditionScreen.style.display = "none";

    // Clear the input field
    document.getElementById("newWordText").value = "";
  }

  // Remove this alert, add some other visual indication inside the game
  else alert("Selected category does not exist.");
});

// Toggle between category and word input sections
document.querySelectorAll('input[name="itemType"]').forEach((radio) => {
  const inputSectionChange = (a, b) => {
    document.getElementById("categoryInputSection").style.display = a;
    document.getElementById("wordInputSection").style.display = b;
  };

  radio.addEventListener("change", (e) => {
    if (e.target.value === "category") inputSectionChange("block", "none");
    else if (e.target.value === "word") inputSectionChange("none", "block");
  });
});

// ----------- //
// Delete Item //
// ----------- //
const handleDeleteBtnMouseUp = () => {
  if (!isDragging.value || isResizing.value || allowItemMove[0] || remainingItems === 1) {
    playSound(wrongSound);

    // Not dragging
    if (!isDragging.value) {
      binTooltip.style.display = binTooltipRectangle.style.display = "block";
      setTimeout(() => (binTooltip.style.display = binTooltipRectangle.style.display = "none"), 5000);
    }

    // Tooltip is being moved
    else if (allowItemMove[0]) disallowDelete({ targetDiv: btnDiv, lastX: btnLastX, lastY: btnLastY, i: 0, type: "button", isDragging, savedX, savedY, allowItemMove });
    // Only one word is left
    else if (remainingItems === 1) {
      let itemIndex = getDraggedItemIndex();
      disallowDelete({ targetDiv: itemDivs[itemIndex], lastX: savedX, lastY: savedY, i: itemIndex, type: "item", isDragging, savedX, savedY, allowItemMove });
    }

    return;
  }

  playSound(deleteSound);
};

function handleDeleteWord(draggedElement) {
  if (!draggedElement) {
    console.error("No element to delete.");
    return;
  }

  let wordElement = null;
  let wordText = "";

  // Check if it's a divItem containing a word inside
  if (draggedElement.id.startsWith("divItem")) {
    wordElement = draggedElement.querySelector(".word"); // find the <span> inside the div

    if (!wordElement) {
      console.error("No word element found inside divItem.");
      return;
    }

    wordText = wordElement.textContent.trim();
  }

  // It's a direct word
  else if (draggedElement.classList.contains("word")) {
    wordElement = draggedElement;
    wordText = draggedElement.textContent.trim();
  }

  // Error
  else {
    console.error("Unknown dragged element type.");
    return;
  }

  console.log(`Deleting word: "${wordText}"`);

  // Remove word from categoryMap
  Object.keys(categoryMap).forEach((categoryId) => {
    const words = categoryMap[categoryId];
    const wordIndex = words.indexOf(wordText);

    if (wordIndex !== -1) {
      words.splice(wordIndex, 1);
      console.log(`Word "${wordText}" removed from category "${categoryId}".`);
    }
  });

  // Remove the full div
  if (draggedElement.id.startsWith("divItem")) draggedElement.remove();
  // Remove just the span.word
  else wordElement.remove();
}

// --------- //
//  GENERAL  //
// --------- //

// Populate the dropdown when the items addition screen is shown
populateCategoryDropdown();

let currSelectedElement = { value: null };
let gameWon = false;
let totalWords = 0;
let droppedWords = 0;
// Elements
let items = [document.getElementById("btn")];
let itemDivs = [document.getElementById("btnDiv")];
let resizeBoxes = [];
let isItemCollected = [];

let delItems = [];
let remainingItems = 12;
let delItemCount = 0;

// ------ //
//  DRAG  //
// ------ //
let isDragging = { value: false };
let allowItemMove = [false, false, false, false, false];
let savedX = { value: null };
let savedY = { value: null };
let deltaX = { value: null };
let deltaY = { value: null };
let teleporationFix = { value: 0 };

// -------- //
//  RESIZE  //
// -------- //
let allowItemResize = [null, null, null, null, null];
let resizeLastX = { value: 0 };
let lastScales = [1.0, 1.0, 1.0, 1.0, 1.0];
let resizeScale = { value: null };
let isResizing = { value: false };
let lastDirection = { value: null };

// --------- //
//  TOOLTIP  //
// --------- //
let isTooltipOpen = { value: false };
let btnLastX = { value: 50 };
let btnLastY = { value: 50 };
let showTooltip = { value: true };
let btnSrc = { value: "assets/infoDark.webp" };

const gameTooltip = document.getElementById("gameTooltip");

const btnDiv = document.getElementById("btnDiv");
const btn = document.getElementById("btn");

const btnOn = document.getElementById("btnOn");
const btnOff = document.getElementById("btnOff");

const btnWhite = document.getElementById("btnWhite");
const btnBlack = document.getElementById("btnBlack");

// ----------- //
//  EDIT MODE  //
// ----------- //
let isEditing = { value: false };
let btnClicks = { value: 1 };
let editModeBtns = [];

const editModeBtn = document.getElementById("editModeBtn");
const addItemsBtn = document.getElementById("addItemsBtn");
const refreshBtn = document.getElementById("refreshBtn");
const deleteBtn = document.getElementById("deleteBtn");

const binTooltip = document.getElementById("binTooltip");
const binTooltipRectangle = document.getElementById("binTooltipRectangle");

deleteBtn.addEventListener("dragover", (e) => {
  e.preventDefault();
  deleteBtn.style.backgroundColor = "#ffcccc";
});

deleteBtn.addEventListener("dragleave", () => (deleteBtn.style.backgroundColor = ""));

deleteBtn.addEventListener("drop", (e) => {
  e.preventDefault();
  deleteBtn.style.backgroundColor = "";

  const draggedId = e.dataTransfer.getData("text/plain");
  let draggedElement = document.getElementById(draggedId);

  if (!draggedElement) {
    console.error(`Dragged element with ID "${draggedId}" not found.`);
    return;
  }

  handleDeleteWord(draggedElement);
  playSound(deleteSound);
});

// Event listener to show the delete panel when deleteBtn is clicked - function to populate the dropdown with categories
const deletePanel = document.getElementById("deletePanel");
const deleteCategoryDropdown = document.getElementById("deleteCategoryDropdown");
const confirmDeleteCategoryBtn = document.getElementById("confirmDeleteCategoryBtn");

function populateDeleteCategoryDropdown() {
  const categoryDropdown = document.getElementById("deleteCategoryDropdown");
  categoryDropdown.innerHTML = ""; // Clear existing options

  const categories = Object.keys(categoryMap);

  if (categories.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No categories available";

    categoryDropdown.appendChild(option);
    return;
  }

  categories.forEach((categoryId) => {
    const option = document.createElement("option");
    option.value = categoryId;
    option.textContent = categoryId.replace(/-/g, " ");
    categoryDropdown.appendChild(option);
  });

  categoryDropdown.style.display = "block"; // Show the dropdown
}

// Populate the dropdown on page load
document.addEventListener("DOMContentLoaded", () => populateDeleteCategoryDropdown());

// Event listener to show the delete panel when deleteBtn is clicked
deleteBtn.addEventListener("click", () => {
  // Ensure the dropdown is up-to-date
  populateDeleteCategoryDropdown();

  // Show the dropdown
  deletePanel.style.display = deleteCategoryDropdown.style.display = "block";
  document.getElementById("deleteCategoryHeading").Heading.style.display = deleteCategoryDropdown.style.color = "black";
  deleteCategoryDropdown.style.backgroundColor = "white";
});

// Event listener to delete the selected category
confirmDeleteCategoryBtn.addEventListener("click", () => {
  const selectedCategory = document.getElementById("deleteCategoryDropdown").value;

  if (!selectedCategory) {
    alert("Please select a category to delete.");
    return;
  }

  // Call the existing handleDeleteCategory function
  handleDeleteCategory(selectedCategory);

  // Update the dropdown after deletion
  populateDeleteCategoryDropdown();

  // Hide the delete panel after deletion
  deletePanel.style.display = "none";
});

// Event listener to cancel and hide the delete panel - hide the delete panel
cancelDeleteBtn.addEventListener("click", () => (deletePanel.style.display = "none"));

function handleDeleteCategory(categoryName) {
  // Use the same name for consistency
  const categoryId = categoryName;
  const categoryIdWithMap = categoryMap[categoryId];
  console.log(categoryMap);
  if (categoryIdWithMap) {
    console.error(`Category "${categoryName}" not found in categoryMap.`);
    return;
  }

  // Remove the category from the categoryMap
  delete categoryMap[categoryId];

  // Remove the category column and dropzone from the DOM
  const headerDiv = document.querySelector(`#categoryTableHead > div[id="th-${categoryId}"]`);
  const dropzoneDiv = document.querySelector(`#categoryTableBody > div[id="${categoryId}"]`);

  if (headerDiv) headerDiv.remove();
  if (dropzoneDiv) dropzoneDiv.remove();

  // Remove the words from the word pool
  categoryIdWithMap.forEach((word) => {
    const wordElement = Array.from(document.querySelectorAll(".word")).find((el) => el.innerText.trim() === word);

    // Remove the word's parent div
    if (wordElement) wordElement.parentElement.remove();
  });
}

// --------------- //
//  GAME SETTINGS  //
// --------------- //
const settingsBtn = document.getElementById("settingsBtn");
const settingsCloseBtn = document.getElementById("settingsCloseBtn");
const settingsScreen = document.getElementById("settingsScreen");

const bgImg = document.getElementById("bgImage");
const bgImgInput = document.getElementById("bgImgInput");

// ---------------- //
//  ITEMS ADDITION  //
// ---------------- //
let isAddingItems = { value: false };

const itemsAdditionCloseBtn = document.getElementById("itemsAdditionCloseBtn");
const itemsAdditionScreen = document.getElementById("itemsAddition");

// -------------- //
//  CONTEXT MENU  //
// -------------- //
let currentItemCM = null;
let score = 0;
const contextMenu = document.getElementById("contextMenu");
const changeImageBtn = document.getElementById("changeImage");
const changeImageInput = document.getElementById("changeImageInput");

// -------- //
//  AUDIOS  //
// -------- //
let audioInputs = [];
let audioElements = [];
let playableAudios = [];

const collectSound = document.getElementById("collectSound");
const winSound = document.getElementById("winSound");
const wrongSound = document.getElementById("wrongSound");
const clickSound = document.getElementById("clickSound");
const deleteSound = document.getElementById("deleteSound");

// ----------- //
//  SAVE GAME  //
// ----------- //
let areChangesSaved = { value: true };

let tags = [];
let configurableSettings = [];

const saveBtn = document.getElementById("saveBtn");
const saveChangesBtn = document.getElementById("saveChangesBtn");
const saveGameBtn = document.getElementById("saveGameBtn");
const saveScreen = document.getElementById("saveScreen");
const saveCloseBtn = document.getElementById("saveCloseBtn");

const addTagBtn = document.getElementById("addTagBtn");
const tagInput = document.getElementById("tagsInput");
const tagsDiv = document.getElementById("tags");

const addSettingBtn = document.getElementById("addSettingBtn");
const settingInput = document.getElementById("settingsInput");
const settingsDiv = document.getElementById("configSettings");

if (snapshot !== "true" && snapshot !== true) {
  // ------------------- //
  //  DOCUMENT ELEMENTS  //
  // ------------------- //

  // Dynamically add categoryMap to the table
  Object.keys(categoryMap).forEach((categoryName) => {
    const words = categoryMap[categoryName]; // Get the words for the category
    window.addCategoryColumn(categoryName, words);
  });

  // Add words to the word pool
  let wordId = 1; // Unique ID for each word
  Object.keys(categoryMap).forEach((category) => {
    const words = categoryMap[category]; // Get the array of words for the category
    words.forEach((word) => {
      window.addWordToPool(word, wordId++);

      // Push the word element into items, itemDivs, and isItemCollected
      const wordElement = document.getElementById(`item${wordId - 1}`);
      const wordDivElement = document.getElementById(`divItem${wordId - 1}`);

      if (wordElement && wordDivElement) {
        items.push(wordElement);
        itemDivs.push(wordDivElement);
        isItemCollected.push(false);
      } else console.warn(`Word element or div not found for word ID: ${wordId - 1}`);
    });
  });

  // Resize Boxes
  for (let i = 0; i < items.length; i++) {
    ["TL", "TR", "BL", "BR"].forEach((dir) => resizeBoxes.push(document.getElementById(`resizeBox${i}${dir}`)));
  }

  // Initialize dropzones for drag-and-drop functionality
  initializeDropzones();

  // Add event listeners for dynamically added words
  document.querySelectorAll(".word").forEach((word) => {
    word.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", e.target.id));
  });

  // Add event listeners for dynamically added dropzones
  document.querySelectorAll(".dropzone").forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.style.backgroundColor = "#e0e0e0";
    });

    zone.addEventListener("dragleave", () => (zone.style.backgroundColor = ""));

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.style.backgroundColor = "";

      const wordEl = document.getElementById(e.dataTransfer.getData("text/plain"));

      // Check if the word is correct for this category
      if (categoryMap[zone.id]?.includes(wordEl.textContent.trim())) {
        zone.appendChild(wordEl); // Move the word into the dropzone
        wordEl.style.backgroundColor = "#c8f7c5"; // Light green for correct
        wordEl.innerHTML = wordEl.innerHTML.substring(0, 4).concat(".."); // Truncate the word
      } else {
        wordEl.style.backgroundColor = "#f7c5c5"; // Light red for incorrect
      }
    });
  });

  // Audios
  playableAudios.push(clickSound);
  playableAudios.push(collectSound);
  playableAudios.push(winSound);
  playableAudios.push(deleteSound);

  for (let i = 1; i <= 4; i++) {
    audioInputs.push(document.getElementById(`audioInput${i}`));
    audioElements.push(document.getElementById(`audioElement${i}`));
  }

  for (let i = 0; i < itemDivs.length; i++) {
    if (itemDivs[i]) {
      // Ensure the element exists
      itemDivs[i].addEventListener("mousedown", (e) => {
        if (isTooltipOpen.value || !isEditing.value) return;

        if (areChangesSaved.value) {
          window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
          areChangesSaved.value = false;
        }

        handleDragStart(e, { i, targetDiv: itemDivs[i], isDragging, isResizing, gameWon, savedX, savedY, allowItemMove, teleporationFix, deltaX, deltaY, isEditing, type: i === 0 ? "button" : "item", placeBack: true, btnLastX, btnLastY });
      });
    } else console.warn(`itemDivs[${i}] is null or undefined.`);

    itemDivs[i].addEventListener("mouseup", (e) => {
      if (isTooltipOpen.value || !isEditing.value) return;
      handleDragEnd(e, { i, targetDiv: itemDivs[i], isDragging, isResizing, gameWon, savedX, savedY, allowItemMove, teleporationFix, deltaX, deltaY, isEditing, type: i === 0 ? "button" : i === 1 ? "targetObject" : "item", placeBack: true, btnLastX, btnLastY });
    });

    itemDivs[i].addEventListener("click", () => {
      handleElementClick({ currSelectedElement, element: itemDivs[i], isEditing, isTooltipOpen });
      makeItemsDraggable();
    });
  }

  // Edit Mode
  let cursorType = { value: "default" };

  editModeBtns.push(addItemsBtn);
  editModeBtns.push(settingsBtn);
  editModeBtns.push(saveBtn);
  editModeBtns.push(deleteBtn);

  editModeBtn.addEventListener("click", () => {
    const itemsLeftNumber = document.getElementById("itemsLeftNumber");
    initializeCategoryDrag();

    remainingItems = items.length - 1 - delItemCount;
    itemsLeftNumber.innerHTML = remainingItems;

    // Make all items visible again
    for (let i = 1; i < items.length; i++) {
      items[i].style.opacity = 1;
      items[i].style.display = "block";
    }

    // Reset collection state of all items
    if (isItemCollected)
      for (let i = 1; i < items.length; i++) {
        isItemCollected[i] = false;
      }

    btnDiv.style.display = btn.style.display = itemsLeft.style.display = itemsLeftNumber.style.display = "block";

    hideScreen(settingsScreen);
    hideScreen(itemsAdditionScreen);

    // Handle edit mode
    handleEditModeButtonClick({ cursorType, clickSound, isEditing, items, resizeBoxes, isItemCollected, remainingItems, showTooltip, isTooltipOpen, btnDiv, editModeBtns, currSelectedElement, settingsScreen, btnClicks, binTooltip, binTooltipRectangle, refreshBtn });

    // Make items draggable when in edit mode and their resize handles are visible
    if (isEditing.value) {
      makeItemsDraggable();
      initializeFreeMovement();
      toggleBouncing(true);

      // Monitor for changes in resize handle visibility and update draggable state
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          // A resize handle's style has changed, check if we need to update draggable state
          if (mutation.attributeName === "style" && mutation.target.id && mutation.target.id.startsWith("resizeBox")) {
            const elementId = mutation.target.id.replace(/resizeBox(\d+)[A-Z]{2}/, "$1");
            if (document.getElementById(`divItem${elementId}`)) makeItemsDraggable();
          }
        });
      });

      // Observe all resize handles
      document.querySelectorAll('[id^="resizeBox"]').forEach((handle) => observer.observe(handle, { attributes: true }));
    } else toggleBouncing(false);
  });

  refreshBtn.addEventListener("click", () => {
    remainingItems = items.length - 1 - delItemCount;
    document.getElementById("itemsLeftNumber").innerHTML = remainingItems;

    // Make all items visible again
    for (let i = 1; i < items.length; i++) {
      items[i].style.opacity = 1;
      items[i].style.display = "block";
    }

    if (isItemCollected)
      // Reset collection state of all items
      for (let i = 1; i < items.length; i++) {
        isItemCollected[i] = false;
      }
  });

  // Add Items screen
  if (addItemsBtn) addItemsBtn.addEventListener("click", () => handleAddItemsButtonClick({ isAddingItems, itemsAdditionScreen, cleanUp: false, clickSound, settingsScreen, saveScreen }));
  else console.error("addItemsBtn element not found.");

  if (itemsAdditionCloseBtn) itemsAdditionCloseBtn.addEventListener("click", () => handleAddItemsCloseButtonClick({ clickSound, isAddingItems, itemsAdditionScreen }));
  else console.error("itemsAdditionCloseBtn element not found.");

  // Game Settings
  bgImgInput.addEventListener("change", (e) => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
    }

    handleSingleImageUpload(e, { targetImg: background, newImg: bgImg });
  });

  settingsBtn.addEventListener("click", () => handleSettingsButtonClick({ isAddingItems, itemsAdditionScreen, cleanUp: false, clickSound, settingsScreen, saveScreen }));
  settingsCloseBtn.addEventListener("click", () => handleSettingsCloseButtonClick({ clickSound, settingsScreen }));

  // Button
  btn.addEventListener("click", () => handleButtonClick({ clickSound, isTooltipOpen, btn, btnDiv, btnLastX, btnLastY, gameTooltip, title, description, isEditing, lastScales, btnSrc }));

  // Mouse enter
  btn.addEventListener("mouseenter", () => {
    if (isEditing.value) return;

    // Scale up the image
    btn.style.transition = "transform 0.3s ease-in-out";
    btn.style.transform = "scale(1.1)";
  });

  // Mouse leave
  btn.addEventListener("mouseleave", () => {
    if (isEditing.value) return;

    // Scale down the image
    btn.style.transform = "scale(1)";
  });

  // Game Tooltip
  btnOn.addEventListener("click", () => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
    }

    btnOnHandler({ showTooltip, btnOn, btnOff, btnDiv, resizeBoxes });
  });

  btnOff.addEventListener("click", () => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
    }

    btnOffHandler({ showTooltip, btnOff, btnOn, btnDiv, resizeBoxes });
  });

  btnBlack.addEventListener("click", () => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
    }

    btnBlackHandler({ btnWhite, btnBlack, btnSrc, btn });
  });

  btnWhite.addEventListener("click", () => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
    }

    btnWhiteHandler({ btnWhite, btnBlack, btnSrc, btn });
  });

  // Audio Upload
  for (let i = 0; i < 4; i++) {
    audioInputs[i].addEventListener("change", (e) => {
      if (areChangesSaved.value) {
        window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
        areChangesSaved.value = false;
      }

      handleAudioUpload(e, { audioElement: audioElements[i], playableAudio: playableAudios[i] });
    });
  }

  let tooltipTimeout; // Variable to store timeout reference

  // Mouse enter
  editModeBtn.addEventListener("mouseenter", () => handleUpScaling(editModeBtn));
  addItemsBtn.addEventListener("mouseenter", () => handleUpScaling(addItemsBtn));
  settingsBtn.addEventListener("mouseenter", () => handleUpScaling(settingsBtn));
  saveBtn.addEventListener("mouseenter", () => handleUpScaling(saveBtn));

  deleteBtn.addEventListener("mouseenter", () => {
    handleUpScaling(deleteBtn);
    tooltipTimeout = setTimeout(() => (binTooltip.style.display = binTooltipRectangle.style.display = "block"), 500);
  });

  refreshBtn.addEventListener("mouseenter", () => handleUpScaling(refreshBtn));

  // Mouse leave
  editModeBtn.addEventListener("mouseleave", () => handleDownScaling(editModeBtn));
  addItemsBtn.addEventListener("mouseleave", () => handleDownScaling(addItemsBtn));
  settingsBtn.addEventListener("mouseleave", () => handleDownScaling(settingsBtn));
  saveBtn.addEventListener("mouseleave", () => handleDownScaling(saveBtn));

  deleteBtn.addEventListener("mouseleave", () => {
    handleDownScaling(deleteBtn);
    clearTimeout(tooltipTimeout); // Cancel showing tooltip if mouse leaves early
    binTooltip.style.display = binTooltipRectangle.style.display = "none";
  });

  refreshBtn.addEventListener("mouseleave", () => handleDownScaling(refreshBtn));

  // Items Deletion
  deleteBtn.addEventListener("mouseup", handleDeleteBtnMouseUp);

  // First, let's make sure our arrays are properly initialized
  const initializeArrays = () => {
    // Make sure these arrays match the number of items
    if (!lastScales || lastScales.length < items.length) lastScales = new Array(items.length).fill(1.0);
    if (!allowItemResize || allowItemResize.length < items.length) allowItemResize = new Array(items.length).fill(false);
  };

  // Call this function to ensure our arrays are ready
  initializeArrays();

  // Now, let's fix the resize box event binding
  for (let i = 0; i < resizeBoxes.length; i++) {
    const itemIndex = Math.floor(i / 4);

    // Skip if either the resize box doesn't exist or there's no corresponding item
    if (!resizeBoxes[i] || !items[itemIndex] || !itemDivs[itemIndex]) continue;

    // Store the item index directly in the DOM element for reliable reference
    resizeBoxes[i].dataset.itemIndex = itemIndex;

    // Add the event listener with a more reliable approach
    resizeBoxes[i].addEventListener("mousedown", function (e) {
      // Use the stored itemIndex from the dataset rather than recalculating
      const actualItemIndex = parseInt(this.dataset.itemIndex) + 1;

      // Calculate the corner position (TL, TR, BL, BR)
      const cornerPosition = i % 4 === 0 ? "TL" : i % 4 === 1 ? "TR" : i % 4 === 2 ? "BL" : "BR";

      // Call the resize handler with the correct parameters
      handleResizeStart(e, { i: actualItemIndex, direction: cornerPosition, isResizing, lastScales, allowItemResize, resizeLastX, item: items[actualItemIndex], itemDiv: itemDivs[actualItemIndex], lastDirection, resizeScale });
    });
  }

  // Context Menu
  for (let i = 1; i < items.length; i++) {
    items[i].addEventListener("contextmenu", (e) => {
      currentItemCM = i;
      handleItemContextMenu(e, { isEditing, contextMenu, changeImageBtn });
    });
  }

  changeImageInput.addEventListener("change", (e) => handleChangeImageUpload(e, items[currentItemCM]));

  document.addEventListener("click", () => (contextMenu.style.display = "none"));
  document.addEventListener("DOMContentLoaded", () => (document.body.style.userSelect = "none"));

  changeImageBtn.addEventListener("click", () => changeImageInput.click());

  // Game Tooltip
  title.addEventListener("input", () => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
    }

    handleTitleInput();
  });

  title.addEventListener("keydown", (e) => handleTitleKeyDown(e));

  description.addEventListener("input", () => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
    }

    handleDescriptionInput;
  });

  description.addEventListener("keydown", (e) => handleDescriptionKeyDown(e));

  // Save Game
  saveBtn.addEventListener("click", () => handleSaveButtonClick({ isAddingItems, itemsAdditionScreen, cleanUp: false, clickSound, settingsScreen, saveScreen }));
  saveChangesBtn.addEventListener("click", (e) => saveGame(e, "game data"));

  saveCloseBtn.addEventListener("click", () => handleSaveCloseButtonClick({ clickSound, saveScreen }));
  saveGameBtn.addEventListener("click", (e) => saveGame(e, "game data"));

  addTagBtn.addEventListener("click", () => addTagOrSetting({ targetDiv: tagsDiv, targetInput: tagInput, arr: tags }));
  addSettingBtn.addEventListener("click", () => addTagOrSetting({ targetDiv: settingsDiv, targetInput: settingInput, arr: configurableSettings }));

  window.addEventListener("message", function (event) {
    // Always check the origin of the message for security purposes
    if (event.origin === parentUrl) {
      if (event.data.type === "game data") initializeGame(event.data.gameData);
      else if (event.data.type === "game data request") saveGame(null, "game data request");
      else if (event.data.type === "enable button") {
        areChangesSaved.value = false;
        toggleSaveChangesBtn();
      }
    } else console.error("Untrusted origin:", event.origin);
  });

  if (urlParams.get("isediting") === "true") editModeBtn.click();

  // Hide the edit mode button if the game is not being edited
  if (urlParams.get("isediting") === "false") editModeBtn.style.display = "none";
  else saveBtn.style.left = saveBtn.style.top = "-1000px";
}
