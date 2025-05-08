import { handleAudioUpload } from "./modules/audioUpload.js";
// import { handleItemContextMenu } from "./modules/contextMenu.js";
// import { handleDragStart, handleDragEnd } from "./modules/dragHandlers.js";
import { handleEditModeButtonClick, handleSettingsButtonClick, handleSettingsCloseButtonClick, handleAddItemsButtonClick, handleAddItemsCloseButtonClick, handleSaveButtonClick, handleSaveCloseButtonClick, addTagOrSetting } from "./modules/editMode.js";
import { handleSingleImageUpload, handleChangeImageUpload, handleImageUpload } from "./modules/imageUpload.js";
import { handleResizeStart } from "./modules/resizeHandlers.js";
import { handleButtonClick, handleDescriptionInput, handleDescriptionKeyDown, handleTitleInput, handleTitleKeyDown, btnOffHandler, btnOnHandler, btnBlackHandler, btnWhiteHandler } from "./modules/tooltip.js";
import { playSound, pauseSound, hideScreen, handleDownScaling, handleUpScaling, handleElementClick, addItemOnScreen, disallowDelete } from "./modules/utils.js";
const Data = [
  {
    image: "./assets/apple.webp",
    audio: "./assets/audio/munch.mp3",
    answer: "APPLE",
    letters: ["A", "P", "L", "P", "B", "E"],
    letterColors: ["#e74c3c", "#3498db", "#27ae60", "#9b59b6", "#f39c12", "#e67e22"],
  },

  {
    image: "./assets/bee.webp",
    audio: "./assets/audio/buzz.mp3",
    answer: "BEE",
    letters: ["E", "H", "G", "I", "B", "E"],
    letterColors: ["#f39c12", "#9b59b6", "#2ecc71", "#e74c3c", "#3498db", "#e67e22"],
  },

  {
    image: "./assets/cat.webp",
    audio: "./assets/audio/meow.mp3",
    answer: "CAT",
    letters: ["A", "T", "W", "C", "T", "O"],
    letterColors: ["#3498db", "#e74c3c", "#9b59b6", "#f39c12", "#27ae60", "#e67e22"],
  },

  {
    image: "./assets/dog.webp",
    audio: "./assets/audio/woof.mp3",
    answer: "DOG",
    letters: ["Q", "O", "G", "D", "R", "S"],
    letterColors: ["#e74c3c", "#3498db", "#27ae60", "#9b59b6", "#f39c12", "#e67e22"],
  },

  {
    image: "./assets/kite.webp",
    audio: "./assets/audio/woosh.wav",
    answer: "KITE",
    letters: ["T", "O", "K", "E", "I", "S"],
    letterColors: ["#27ae60", "#3498db", "#9b59b6", "#e74c3c", "#f39c12", "#e67e22"],
  },
];

function addItemsDynamically() {
  const container = document.getElementById("gameContainer"); // The parent container for your items

  Data.forEach((item, index) => {
    // Adding index to identify each item
    const divItem = document.createElement("div");
    divItem.style.position = "absolute";
    divItem.style.left = "-400px";
    divItem.style.width = "50px";
    divItem.style.height = "fit-content";
    divItem.style.top = "0px";
    divItem.style.display = "inline-block";
    divItem.style.position = "relative";
    divItem.style.justifyContent = "space-between";
    divItem.setAttribute("draggable", "true");
    divItem.dataset.index = index; // Store original index

    // Add drag event listeners
    divItem.addEventListener("dragstart", handleDivItem);
    divItem.addEventListener("dragover", handleDivItemDragOver);
    divItem.addEventListener("drop", handleDivItemDrop);
    divItem.addEventListener("dragend", handleDivItemDragEnd);

    // Create the delete button
    const deleteButton = document.createElement("div");
    deleteButton.style.position = "absolute";
    deleteButton.style.right = "-840px";
    deleteButton.style.top = "7px";
    deleteButton.style.width = "20px";
    deleteButton.style.height = "5px";
    deleteButton.style.backgroundColor = "red";
    deleteButton.style.cursor = "pointer";
    deleteButton.innerText = ""; // Adding text to make the button more visible
    deleteButton.style.display = "none";
    deleteButton.id = `deleteButton${index}`;
    divItem.appendChild(deleteButton);

    // Add event listener to the delete button
    deleteButton.addEventListener("click", () => {
      // Remove the item from the Data array
      Data.splice(index, 1);

      // Remove the divItem from the DOM
      divItem.remove();
    });

    // Create the item content container
    const item1 = document.createElement("div");
    item1.style.display = "flex";
    item1.style.flexDirection = "row";
    item1.style.width = "900px";
    item1.style.height = "100px";
    item1.style.border = "2px solid #ccc";
    item1.style.padding = "20px";
    item1.style.boxSizing = "border-box";
    item1.style.alignItems = "center";
    item1.style.justifyContent = "space-between";

    // Picture cell
    const pictureCell = document.createElement("div");
    pictureCell.style.flexShrink = "0";

    const img = document.createElement("img");

    img.src = item.image instanceof File ? URL.createObjectURL(item.image) : item.image;
    img.alt = item.answer;
    img.style.width = "80px";
    img.style.height = "80px";
    img.style.borderRadius = "8px";
    img.style.transition = "transform 0.2s"; // Smooth scale animation

    // RIGHT CLICK TO REPLACE IMAGE
    img.addEventListener("contextmenu", (e) => {
      e.preventDefault(); // Prevent default context menu

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";

      fileInput.addEventListener("change", () => {
        const newFile = fileInput.files[0];
        if (newFile) {
          item.image = newFile; // Update in Data
          img.src = URL.createObjectURL(newFile); // Update preview
        }
      });

      // Trigger file selection
      fileInput.click();
    });

    if (item.audio) {
      const audio = new Audio(item.audio instanceof File ? URL.createObjectURL(item.audio) : item.audio);
      audio.preload = "auto";

      img.addEventListener("mouseenter", () => {
        // Play audio and scale image
        audio.currentTime = 0;
        audio.play().catch((e) => console.log("Audio play failed:", e));
        img.style.transform = "scale(1.05)";
      });

      img.addEventListener("mouseleave", () => {
        // Stop audio and reset image size
        audio.pause();
        audio.currentTime = 0;
        img.style.transform = "scale(1)";
      });
    }

    pictureCell.appendChild(img);

    item1.appendChild(pictureCell);

    // Content cell (letters and colors display)
    const contentCell = document.createElement("div");
    contentCell.style.display = "flex";
    contentCell.style.gap = "8px";
    contentCell.style.flexWrap = "wrap";
    contentCell.style.alignItems = "start";
    contentCell.style.justifyContent = "start";
    contentCell.style.flexGrow = "1";
    contentCell.style.marginLeft = "100px";
    contentCell.className = "letter-container"; // Add a class for easy selection

    item.letters.forEach((letter, letterIndex) => {
      const letterBlock = document.createElement("span");
      letterBlock.innerText = letter;
      letterBlock.style.width = "40px";
      letterBlock.style.height = "40px";
      letterBlock.style.backgroundColor = item.letterColors[letterIndex];
      letterBlock.style.display = "inline-block";
      letterBlock.style.textAlign = "center";
      letterBlock.style.lineHeight = "40px";
      letterBlock.style.color = "white";
      letterBlock.style.fontWeight = "bold";
      letterBlock.style.cursor = "pointer";
      letterBlock.style.borderRadius = "25px";
      letterBlock.setAttribute("draggable", "true");

      // 👇 Hover effect
      letterBlock.addEventListener("mouseover", () => {
        letterBlock.style.boxShadow = "0 0 8px rgba(0, 0, 0, 0.5)";
        letterBlock.style.transform = "scale(1.1)";
        letterBlock.style.transition = "all 0.2s";
      });

      letterBlock.addEventListener("mouseout", () => {
        letterBlock.style.boxShadow = "none";
        letterBlock.style.transform = "scale(1)";
      });

      // 👇 CLICK EVENT TO INSERT INTO NEXT EMPTY INPUT AND LOCK BLOCK
      letterBlock.addEventListener("click", () => {
        const inputs = inputContainer.querySelectorAll("input");

        for (let input of inputs) {
          if (!input.value) {
            input.value = letter.toUpperCase(); // Add the letter to first empty input
            letterBlock.style.opacity = "0.5"; // Dim the block to show it's used
            letterBlock.style.pointerEvents = "none"; // Disable future clicks
            break;
          }
        }
      });

      contentCell.appendChild(letterBlock);
    });

    item1.appendChild(contentCell);

    // Input boxes
    const inputContainer = document.createElement("div");
    inputContainer.style.display = "flex";
    inputContainer.style.gap = "8px";
    inputContainer.style.flexWrap = "wrap";
    inputContainer.style.alignItems = "end";
    inputContainer.style.marginTop = "16px";

    // Create input fields for each letter
    for (let i = 0; i < item.answer.length; i++) {
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = "1";
      input.style.width = "40px";
      input.style.height = "40px";
      input.style.textAlign = "center";
      input.style.fontWeight = "bold";
      inputContainer.appendChild(input);
    }

    item1.appendChild(inputContainer);
    divItem.appendChild(item1);

    // Append the item to the container
    container.appendChild(divItem);
  });
}
let draggedItem = null;

function enableColorChangeForContextMenu(event) {
  const contextMenu = document.getElementById("ButtonColor");
  const colorPicker = document.getElementById("changeColoR");
  const divItem2 = document.getElementById("checkResultsBtn");

  // Position the color picker near the context menu
  const contextMenuRect = contextMenu.getBoundingClientRect();
  colorPicker.style.left = "500px";
  colorPicker.style.top = "800px";

  // Show the color picker
  colorPicker.style.display = "block";

  // Event listener for color change
  colorPicker.addEventListener("input", (e) => {
    const newColor = e.target.value;
    divItem2.style.backgroundColor = newColor; // Change the background color of divItem2
  });

  // Hide the context menu after a color is selected
  colorPicker.addEventListener("change", () => {
    contextMenu.style.display = "none"; // Hide the context menu after the color is selected
    colorPicker.style.display = "none"; // Optionally hide the color picker after use
  });

  // Also hide the context menu if the user clicks outside
  document.addEventListener("click", (e) => {
    if (!contextMenu.contains(e.target) && !colorPicker.contains(e.target)) {
      contextMenu.style.display = "none"; // Hide context menu if clicked outside
      colorPicker.style.display = "none"; // Hide color picker if clicked outside
    }
  });
}

// Trigger the context menu and color picker
document.getElementById("checkResultsBtn").addEventListener("contextmenu", (e) => {
  e.preventDefault();
  enableColorChangeForContextMenu(e); // Pass the event to the function
});

function handleDivItem(e) {
  draggedItem = this;
  e.dataTransfer.effectAllowed = "move";
}

function handleDivItemDragOver(e) {
  e.preventDefault();
}

function handleDivItemDrop(e) {
  e.preventDefault();
  e.stopPropagation();

  if (draggedItem !== this) {
    const container = document.getElementById("gameContainer");

    const draggedIndex = parseInt(draggedItem.dataset.index);
    const dropIndex = parseInt(this.dataset.index);

    // Update DOM order
    if (draggedIndex < dropIndex) {
      container.insertBefore(draggedItem, this.nextSibling);
    } else {
      container.insertBefore(draggedItem, this);
    }

    // Reorder Data array
    const movedItem = Data.splice(draggedIndex, 1)[0];
    Data.splice(dropIndex, 0, movedItem);

    // Re-index all divs
    [...container.children].forEach((child, i) => {
      child.dataset.index = i;
    });
  }
}

function handleDivItemDragEnd() {
  this.style.opacity = "1";
}

document.getElementById("itemLetters").addEventListener("input", () => {
  const container = document.getElementById("colorPickersContainer");
  container.innerHTML = ""; // Clear old inputs

  const letters = document.getElementById("itemLetters").value.trim().split(",");

  letters.forEach((letter, index) => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.marginBottom = "6px";

    const label = document.createElement("span");
    label.textContent = `${letter.trim() || "?"}:`;
    label.style.marginRight = "10px";
    label.style.width = "30px";

    const input = document.createElement("input");
    input.type = "color";
    input.value = getRandomColor(); // default value
    input.className = "color-picker";
    input.setAttribute("data-index", index);

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    container.appendChild(wrapper);
  });
});

const showDeleteButtons = (a) => {
  if (a) {
    Data.forEach((_, index) => {
      const deleteBtn = document.getElementById(`deleteButton${index}`);
      if (deleteBtn) {
        deleteBtn.style.display = "block";
      }
    });
  } else {
    Data.forEach((_, index) => {
      const deleteBtn = document.getElementById(`deleteButton${index}`);
      if (deleteBtn) {
        deleteBtn.style.display = "none";
      }
    });
  }
};

// Helper function for random colors
function getRandomColor() {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
}

// -------------- //
//  Letter Drag   //
// -------------- //
function enableDragAndDrop() {
  document.querySelectorAll(".letter-container").forEach((container) => {
    let draggedItem = null;

    // Add drag events to each letter block within the container
    container.querySelectorAll('span[draggable="true"]').forEach((letterBlock) => {
      // When drag starts
      letterBlock.addEventListener("dragstart", (e) => {
        draggedItem = letterBlock;
        // Add some visual feedback
        setTimeout(() => {
          letterBlock.style.opacity = "0.4";
        }, 0);
      });

      // When drag ends
      letterBlock.addEventListener("dragend", () => {
        draggedItem.style.opacity = "1";
        draggedItem = null;
      });

      // When dragging over another letter
      letterBlock.addEventListener("dragover", (e) => {
        e.preventDefault(); // Necessary to allow dropping
      });

      // When entering another letter's area
      letterBlock.addEventListener("dragenter", (e) => {
        e.preventDefault();
        // Visual feedback
        if (draggedItem !== letterBlock) {
          letterBlock.style.transform = "scale(1.05)";
        }
      });

      // When leaving another letter's area
      letterBlock.addEventListener("dragleave", () => {
        letterBlock.style.transform = "scale(1)";
      });

      // When dropping
      letterBlock.addEventListener("drop", (e) => {
        e.preventDefault();
        letterBlock.style.transform = "scale(1)";

        if (draggedItem && draggedItem !== letterBlock) {
          // Replace the text/content of the letterBlock with the dragged item's content
          const draggedText = draggedItem.innerText; // Get the text/content of the dragged item
          draggedItem.innerText = letterBlock.innerText; // Replace dragged item's content with the letterBlock's content
          letterBlock.innerText = draggedText; // Replace letterBlock's content with the dragged item's content
        }
      });
    });
  });
}

function EditLetters(a) {
  if (a) {
    document.querySelectorAll(".letter-container").forEach((container) => {
      container.querySelectorAll('span[draggable="true"]').forEach((letterBlock) => {
        //Function to edit Block
        letterBlock.addEventListener("contextmenu", (e) => {
          e.preventDefault(); // Prevent the default right-click menu

          const input = document.createElement("input");
          input.type = "text";
          input.value = letterBlock.innerText;
          input.maxLength = 1; // Limit to one character
          input.style.width = "40px";
          input.style.height = "40px";
          input.style.textAlign = "center";
          input.style.fontWeight = "bold";
          input.style.fontSize = "18px";

          // Replace content with input field
          letterBlock.innerHTML = "";
          letterBlock.appendChild(input);

          input.focus();

          input.addEventListener("blur", () => {
            letterBlock.innerText = input.value.toUpperCase();
          });

          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              letterBlock.innerText = input.value.toUpperCase();
            }
          });
        });
      });
    });
  } else {
    document.querySelectorAll(".letter-container").forEach((container) => {
      container.querySelectorAll('span[draggable="true"]').forEach((letterBlock) => {
        letterBlock.removeEventListener("contextmenu", (e) => {});
      });
    });
  }
}
addItemsDynamically();
// ---------------- //
//  ITEMS DELETION  //
// ---------------- //

// const deleteItem = (index) => {
//   delItemCount++;
//   delItems.push(itemDivs[index]);

//   itemDivs[index].style.display = "none";

//   for (let i = 0; i < 4; i++) {
//     resizeBoxes[index * 4 + i].style.display = "none";
//   }
// };

function checkAnswer(index) {
  const item = Data[index];
  const container = document.getElementById("gameContainer");
  const itemDiv = container.children[index];
  const inputContainer = itemDiv.querySelector("div > div:last-child");
  const inputs = inputContainer.querySelectorAll("input");

  const correctAnswer = item.answer.toUpperCase();
  let userAnswer = "";
  for (let input of inputs) {
    userAnswer += input.value.toUpperCase();
  }

  const isCorrect = userAnswer === correctAnswer;

  if (isCorrect) {
    inputContainer.style.backgroundColor = "rgba(46, 204, 113, 0.2)";
    inputs.forEach((input) => {
      input.style.border = "2px solid #2ecc71";
      input.disabled = true;
    });
  } else {
    inputContainer.style.backgroundColor = "rgba(231, 76, 60, 0.2)";
    inputs.forEach((input) => {
      input.style.border = "2px solid #e74c3c";
    });

    setTimeout(() => {
      inputContainer.style.backgroundColor = "";
      inputs.forEach((input) => {
        input.style.border = "";
        input.value = "";
      });

      const letterBlocks = itemDiv.querySelectorAll(".letter-container span");
      letterBlocks.forEach((block) => {
        block.style.opacity = "1";
        block.style.pointerEvents = "auto";
      });
    }, 1500);
  }

  return isCorrect;
}

function checkAllAnswers() {
  let allCorrect = true;

  for (let i = 0; i < Data.length; i++) {
    const isCorrect = checkAnswer(i);
    allCorrect = allCorrect && isCorrect;
  }

  return allCorrect;
}

document.getElementById("checkResultsBtn").addEventListener("click", () => {
  const allCorrect = checkAllAnswers();
  if (allCorrect) {
    const audio = new Audio("./assets/audio/win.wav"); // Replace with your audio file path or URL
    audio.play().catch((e) => console.log("Audio play failed:", e));
  } else {
    const audio = new Audio("./assets/audio/lose.wav"); // Replace with your audio file path or URL
    audio.play().catch((e) => console.log("Audio play failed:", e));
  }
});

const getDraggedItemIndex = () => {
  // Get the item being dragged
  for (let i = 0; i < allowItemMove.length; i++) {
    if (allowItemMove[i]) {
      allowItemMove[i] = false;
      isDragging.value = false;

      return i;
    }
  }

  return null;
};

const handleDeleteBtnMouseUp = () => {
  // Nothing is being dragged || Something is being resized || The tooltip button is being moved || Only one item is left
  if (!isDragging.value || isResizing.value || allowItemMove[0] || remainingItems === 1) {
    playSound(wrongSound);

    // The bin was just simply clicked
    if (!isDragging.value) {
      binTooltip.style.display = binTooltipRectangle.style.display = "block";

      setTimeout(() => {
        binTooltip.style.display = binTooltipRectangle.style.display = "none";
      }, 5000);
    }

    // The game tooltip btn was being moved
    else if (allowItemMove[0]) {
      disallowDelete({ targetDiv: btnDiv, lastX: btnLastX, lastY: btnLastY, i: 0, type: "button", isDragging, savedX, savedY, allowItemMove });
    }

    // Only one item is left
    else if (remainingItems === 1) {
      let itemIndex = getDraggedItemIndex();
      disallowDelete({ targetDiv: itemDivs[itemIndex], lastX: savedX, lastY: savedY, i: itemIndex, type: "item", isDragging, savedX, savedY, allowItemMove });
    }

    return;
  }

  // Get the item being dragged
  let targetIndex = getDraggedItemIndex();

  // Delete it now
  playSound(deleteSound);
  deleteItem(targetIndex);

  remainingItems -= 1;
  itemsLeftNumber.innerHTML = remainingItems;
};

// ----------- //
//  SAVE GAME  //
// ----------- //
const toggleSaveChangesBtn = (isDisabled = false, cursorType = "pointer", opacity = 1) => {
  saveChangesBtn.disabled = isDisabled;
  saveChangesBtn.style.cursor = cursorType;
  saveChangesBtn.style.opacity = opacity;
};

const saveGame = (e, type) => {
  if (e) e.preventDefault();

  // Disable the save changes button
  if (type === "game data") toggleSaveChangesBtn(true, "not-allowed", 0.7);

  // Generic Elements
  gameData = {
    tooltip: {
      title: title.innerText,
      description: description.innerText,
      btnX: btnLastX.value,
      btnY: btnLastY.value,
      showTooltip: showTooltip.value,
      btnScale: lastScales[0],
    },

    elements: [],

    // Unique Elements
    uncommon: {
      remainingItems,
      delItemCount,
    },

    base64Strings: [bgImg.src, btn.src, collectSound.src, winSound.src, wrongSound.src, clickSound.src, deleteSound.src],
  };

  // Item Divs
  for (let i = 1; i < items.length; i++) {
    gameData.elements.push({
      x: itemDivs[i].style.left,
      y: itemDivs[i].style.top,
      scale: lastScales[i],
      width: items[i].offsetWidth,
      height: items[i].offsetHeight,
    });

    gameData.base64Strings.push(items[i].src);
  }

  window.parent.postMessage({ type, gameData, gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
  if (type === "game data") areChangesSaved.value = true;
};

const initializeGame = (recievedData) => {
  // Check if the game has been saved before
  if (!recievedData) return;

  // Background
  if (recievedData.assetUrls && recievedData.assetUrls.length > 0) {
    background.src = bgImg.src = recievedData.assetUrls[0];
    btn.src = btnSrc.value = recievedData.assetUrls[1];

    collectSound.src = recievedData.assetUrls[2];
    winSound.src = recievedData.assetUrls[3];
    wrongSound.src = recievedData.assetUrls[4];
    clickSound.src = recievedData.assetUrls[5];
    deleteSound.src = recievedData.assetUrls[6];
  }

  // Game Tooltip
  if (recievedData.tootlip) {
    title.innerText = recievedData.tooltip.title;
    description.innerText = recievedData.tooltip.description;

    btnLastX.value = recievedData.tooltip.btnX;
    btnLastY.value = recievedData.tooltip.btnY;

    btnDiv.style.left = `${btnLastX.value}px`;
    btnDiv.style.top = `${btnLastY.value}px`;

    lastScales[0] = recievedData.tooltip.btnScale;
    btnDiv.style.transform = `scale(${lastScales[0]})`;

    showTooltip.value = recievedData.tooltip.showTooltip;
    if (!showTooltip.value) btnOffHandler({ showTooltip, btnOff, btnOn, btnDiv, resizeBoxes });
  }

  // Elements
  if (recievedData.elements.length > 0) {
    for (let i = 1; i < items.length; i++) {
      // URL
      items[i].src = recievedData.assetUrls[i + 6];

      // Position
      itemDivs[i].style.left = recievedData.elements[i - 1].x;
      itemDivs[i].style.top = recievedData.elements[i - 1].y;

      // Dimensions
      items[i].width = recievedData.elements[i - 1].width;
      items[i].height = recievedData.elements[i - 1].height;

      // Scale
      lastScales[i] = recievedData.elements[i - 1].scale;
      itemDivs[i].style.transform = `scale(${lastScales[i]})`;
    }

    // Now, we have to create all the elements that were added to the game through game UI
    for (let i = items.length; i <= recievedData.elements.length; i++) {
      const theImg = new Image();

      // Give the image an src, width & height when it is loaded
      theImg.onload = () => {
        theImg.style.width = recievedData.elements[i - 1].width;
        theImg.style.height = recievedData.elements[i - 1].height;

        theImg.style.left = recievedData.elements[i - 1].x;
        theImg.style.top = recievedData.elements[i - 1].y;

        handleAddItems(theImg, recievedData.elements[i - 1].scale);

        // Hide the new resize boxes
        for (let j = resizeBoxes.length - 4; j < resizeBoxes.length; j++) {
          resizeBoxes[j].style.visibility = "hidden";
          resizeBoxes[j].style.visibility = "hidden";
          resizeBoxes[j].style.visibility = "hidden";
          resizeBoxes[j].style.visibility = "hidden";
        }

        // Hide the new border
        items[items.length - 1].style.border = "1px solid transparent";
        items[items.length - 1].style.cursor = "default";
      };

      theImg.src = recievedData.assetUrls[i + 6];
    }
  }

  // Set the unique elements
  if (recievedData.uncommon) {
    remainingItems = recievedData.uncommon.remainingItems;
    delItemCount = recievedData.uncommon.delItemCount;
  }

  itemsLeftNumber.innerHTML = remainingItems;
};

// --------- //
//  GENERAL  //
// --------- //

let currSelectedElement = { value: null };
let gameWon = false;

// Elements
let items = [document.getElementById("btn")];
let itemDivs = [document.getElementById("btnDiv")];
let resizeBoxes = [];
let isItemCollected = [];

let delItems = [];
let remainingItems = 4;
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
const addItemBtn = document.getElementById("addItemBtn");

const itemsAdditionCloseBtn = document.getElementById("itemsAdditionCloseBtn");
const itemsAdditionScreen = document.getElementById("itemsAddition");

const addableImg = document.getElementById("addableImg");
const addableImgInput = document.getElementById("addableImgInput");

// -------------- //
//  CONTEXT MENU  //
// -------------- //
let currentItemCM = null;

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

let gameData = {};

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

  // Items
  for (let i = 0; i <= 2; i++) {
    const itemDiv = document.getElementById(`divItem${i}`);
    if (!itemDiv) continue;
    itemDivs.push(itemDiv);
    items.push(itemDiv);
    isItemCollected.push(false);
  }
  console.log(items);
  // Resize Boxes
  for (let i = 0; i < items.length; i++) {
    resizeBoxes.push(document.getElementById(`resizeBox${i}TL`));
    resizeBoxes.push(document.getElementById(`resizeBox${i}TR`));
    resizeBoxes.push(document.getElementById(`resizeBox${i}BL`));
    resizeBoxes.push(document.getElementById(`resizeBox${i}BR`));
  }

  // Add event listeners to all items
  for (let i = 0; i < items.length; i++) {
    items[i].addEventListener("click", () => {
      if (isEditing.value) return;
      handleItemClick(items[i]);
    });
  }
  // Items Addition
  addableImgInput.addEventListener("change", (e) => handleImageUpload(e, { targetImg: addableImg }));

  addItemBtn.addEventListener("click", () => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
      toggleSaveChangesBtn();
    }

    handleAddItems();
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

  window.onload = function () {
    const itemDivs = document.querySelectorAll(".itemDivClass");
    if (itemDivs.length > 0) {
      for (let i = 0; i < itemDivs.length; i++) {
        if (itemDivs[i]) {
          itemDivs[i].addEventListener("mousedown", (e) => {
            if (isTooltipOpen.value || !isEditing.value) return;
            if (areChangesSaved.value) {
              window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
              areChangesSaved.value = false;
              toggleSaveChangesBtn();
            }
            handleDragStart(e, { i, targetDiv: itemDivs[i], isDragging, isResizing, gameWon, savedX, savedY, allowItemMove, teleporationFix, deltaX, deltaY, isEditing, type: i === 0 ? "button" : "item", placeBack: true, btnLastX, btnLastY });
          });
          itemDivs[i].addEventListener("mouseup", (e) => {
            if (isTooltipOpen.value || !isEditing.value) return;
            handleDragEnd(e, { i, targetDiv: itemDivs[i], isDragging, isResizing, gameWon, savedX, savedY, allowItemMove, teleporationFix, deltaX, deltaY, isEditing, type: i === 0 ? "button" : i === 1 ? "targetObject" : "item", placeBack: true, btnLastX, btnLastY });
          });
          itemDivs[i].addEventListener("click", () => handleElementClick({ currSelectedElement, element: itemDivs[i], isEditing, isTooltipOpen }));
        }
      }
    }
  };

  // Edit Mode
  let cursorType = { value: "default" };

  editModeBtns.push(addItemsBtn);
  editModeBtns.push(settingsBtn);
  editModeBtns.push(saveBtn);

  // editModeBtn.addEventListener("click", () => handleEditModeButtonClick({ clickSound, isEditing, items, resizeBoxes, showTooltip, isTooltipOpen, btnDiv, editModeBtns, currSelectedElement, settingsScreen, btnClicks, binTooltip, binTooltipRectangle }));
  editModeBtn.addEventListener("click", () => {
    enableDragAndDrop();
    EditLetters(true);
    showDeleteButtons(true);
    hideScreen(settingsScreen);
    hideScreen(itemsAdditionScreen);
    for (let i = 0; i < resizeBoxes.length; i++) {
      resizeBoxes[i].style.visibility = "visible";
    }
    handleEditModeButtonClick({ game: "wrh", cursorType, clickSound, isEditing, items, resizeBoxes, isItemCollected, remainingItems, showTooltip, isTooltipOpen, btnDiv, editModeBtns, currSelectedElement, settingsScreen, btnClicks, binTooltip, binTooltipRectangle, refreshBtn });
  });

  refreshBtn.addEventListener("click", () => {
    const itemsLeftNumber = document.getElementById("itemsLeftNumber");

    remainingItems = items.length - 1 - delItemCount;
    itemsLeftNumber.innerHTML = remainingItems;

    // Make all items visible again
    for (let i = 1; i < items.length; i++) {
      items[i].style.opacity = 1;
      items[i].style.display = "block";
    }
    if (isItemCollected) {
      // Reset collection state of all items
      for (let i = 1; i < items.length; i++) {
        isItemCollected[i] = false;
      }
    }
  });

  // Add Items screen
  addItemsBtn.addEventListener("click", () => handleAddItemsButtonClick({ isAddingItems, itemsAdditionScreen, cleanUp: false, clickSound, settingsScreen, saveScreen }));
  itemsAdditionCloseBtn.addEventListener("click", () => handleAddItemsCloseButtonClick({ clickSound, isAddingItems, itemsAdditionScreen }));
  document.getElementById("addItemBtn").addEventListener("click", () => {
    const imageInput = document.getElementById("addableImgInput");
    const audioInput = document.getElementById("addableAudioInput");
    const answer = document.getElementById("itemAnswer").value.trim().toUpperCase();
    const letters = document.getElementById("itemLetters").value.trim().split(",");
    const colorInputs = document.querySelectorAll("#colorPickersContainer .color-picker");
    const colors = Array.from(colorInputs).map((input) => input.value);

    if (!imageInput.files[0] || !audioInput.files[0] || !answer || letters.length === 0 || colors.length !== letters.length) {
      alert("Please fill all fields correctly, including image and audio.");
      return;
    }

    const imageURL = URL.createObjectURL(imageInput.files[0]);
    const audioURL = URL.createObjectURL(audioInput.files[0]);

    const newItem = {
      image: imageURL,
      audio: audioURL,
      answer,
      letters,
      letterColors: colors,
    };

    Data.push(newItem);

    // Clear the existing items before re-rendering
    const container = document.getElementById("gameContainer");
    container.innerHTML = "";

    addItemsDynamically(); // Re-render the game container with updated Data

    // Play success sound
    const addSound = document.getElementById("addSound");
    addSound.currentTime = 0;
    addSound.play();

    // Close the modal
    document.getElementById("itemsAddition").style.display = "none";
  });

  // Game Settings
  bgImgInput.addEventListener("change", (e) => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
      toggleSaveChangesBtn();
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
      toggleSaveChangesBtn();
    }

    btnOnHandler({ showTooltip, btnOn, btnOff, btnDiv, resizeBoxes });
  });

  btnOff.addEventListener("click", () => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
      toggleSaveChangesBtn();
    }

    btnOffHandler({ showTooltip, btnOff, btnOn, btnDiv, resizeBoxes });
  });

  btnBlack.addEventListener("click", () => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
      toggleSaveChangesBtn();
    }

    btnBlackHandler({ btnWhite, btnBlack, btnSrc, btn });
  });

  btnWhite.addEventListener("click", () => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
      toggleSaveChangesBtn();
    }

    btnWhiteHandler({ btnWhite, btnBlack, btnSrc, btn });
  });

  // Audio Upload
  for (let i = 0; i < 4; i++) {
    audioInputs[i].addEventListener("change", (e) => {
      if (areChangesSaved.value) {
        window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
        areChangesSaved.value = false;
        toggleSaveChangesBtn();
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

  // On Board Images Resizing
  for (let i = 0; i < resizeBoxes.length; i++) {
    console.log(resizeBoxes.length);
    resizeBoxes[i].addEventListener("mousedown", (e) => handleResizeStart(e, { i: parseInt(i / 4), direction: i % 4 === 0 ? "TL" : i % 4 === 1 ? "TR" : i % 4 === 2 ? "BL" : "BR", isResizing, lastScales, allowItemResize, resizeLastX, item: items[parseInt(i / 4)], itemDiv: itemDivs[parseInt(i / 4)], lastDirection, resizeScale }));
  }

  // Context Menu
  for (let i = 1; i < items.length; i++) {
    items[i].addEventListener("contextmenu", (e) => {
      currentItemCM = i;
      handleItemContextMenu(e, { isEditing, contextMenu, changeImageBtn });
    });
  }

  changeImageInput.addEventListener("change", (e) => handleChangeImageUpload(e, items[currentItemCM]));

  document.addEventListener("DOMContentLoaded", () => {
    document.body.style.userSelect = "none"; // Disable selection for the whole document
  });

  changeImageBtn.addEventListener("click", () => changeImageInput.click());

  // Game Tooltip
  title.addEventListener("input", () => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
      toggleSaveChangesBtn();
    }

    handleTitleInput();
  });

  title.addEventListener("keydown", (e) => handleTitleKeyDown(e));

  description.addEventListener("input", () => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
      toggleSaveChangesBtn();
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
      if (event.data.type === "game data") {
        initializeGame(event.data.gameData);
      } else if (event.data.type === "game data request") {
        saveGame(null, "game data request");
      } else if (event.data.type === "enable button") {
        areChangesSaved.value = false;
        toggleSaveChangesBtn();
      }
    } else {
      console.error("Untrusted origin:", event.origin);
    }
  });

  // Initialize the game
  // initializeGame();

  if (urlParams.get("isediting") === "true") {
    editModeBtn.click();
  }

  // Hide the edit mode button if the game is not being edited
  if (urlParams.get("isediting") === "false") editModeBtn.style.display = "none";
  else saveBtn.style.left = saveBtn.style.top = "-1000px";
}
