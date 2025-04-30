// ------- //
//  UTILS  //
// ------- //
export const pauseSound = (sound) => {
  sound.pause();
  sound.currentTime = 0;
};

export const playSound = (sound) => {
  pauseSound(sound);
  sound.play();
};

export const handleUpScaling = (target) => {
  target.style.transition = "transform 0.3s ease-in-out";
  target.style.transform = "scale(1.1)";
};

export const handleDownScaling = (target) => {
  target.style.transform = "scale(1)";
};

export const showResizeHandlers = (resizeBoxes) => {
  for (let i = 0; i < resizeBoxes.length; i++) {
    resizeBoxes[i].style.visibility = "visible";
  }
};

export const hideResizeHandlers = (resizeBoxes) => {
  for (let i = 0; i < resizeBoxes.length; i++) {
    resizeBoxes[i].style.visibility = "hidden";
  }
};

export const showBorders = (items) => {
  items.forEach((item) => {
    item.style.border = "1px solid red";
  });
};

export const hideBorders = () => {
  items.forEach((item) => {
    item.style.border = "1px solid transparent";
  });
};

export const handleResizeBoxStyles = (params) => {
  params.resizeBox.id = `resizeBox${params.latestItem}${params.direction}`;
  params.resizeBox.style.position = "absolute";
  params.resizeBox.style.width = "14px";
  params.resizeBox.style.height = "14px";
  params.resizeBox.style.cursor = params.direction === "TL" || params.direction === "BR" ? "nwse-resize" : "nesw-resize";
  params.resizeBox.style.borderRadius = "100%";
  params.resizeBox.style.backgroundColor = "white";
  params.resizeBox.style.border = "1px solid red";
};

export const handleNewSelection = (x, targetArray) => {
  // Make a new selection
  for (let i = 0; i < targetArray.length; i++) {
    targetArray[i].style.border = "2px solid transparent";
  }

  targetArray[x].style.border = "2px solid greenyellow";
};

export const maintainAspectRatio = (item, width, height) => {
  const scaleFactor = item.offsetHeight / height;
  item.style.width = `${width * scaleFactor}px`;
};

export const showScreen = (screen) => {
  screen.style.zIndex = 9999;
  screen.style.display = "block";
};

export const hideScreen = (screen) => {
  screen.style.zIndex = -1;
  screen.style.display = "none";
};

export const swapImageDimensions = (img1, img2) => {
  let width1 = parseFloat(img1.style.width.split("px")[0]);
  let height1 = parseFloat(img1.style.height.split("px")[0]);

  let width2 = parseFloat(img2.style.width.split("px")[0]);
  let height2 = parseFloat(img2.style.height.split("px")[0]);

  img1.style.width = `${width2}px`;
  img1.style.height = `${height2}px`;

  img2.style.width = `${width1}px`;
  img2.style.height = `${height1}px`;
};

export function handleElementClick({ currSelectedElement, element, isEditing, isTooltipOpen }) {
  if (!isEditing.value || isTooltipOpen.value) return;
  
  // Remove highlight and hide resize boxes from previously selected element
  if (currSelectedElement.value) {
    currSelectedElement.value.style.boxShadow = "";
    currSelectedElement.value.style.zIndex = "1";
    
    // Hide previously selected element's resize boxes
    const resizeBoxes = currSelectedElement.value.querySelectorAll("[id^='resizeBox']");
    resizeBoxes.forEach(box => {
      box.style.visibility = "hidden";
    });
  }
  
  // Set and highlight new selected element
  currSelectedElement.value = element;
  element.style.boxShadow = "0 0 0 2px #ff0000"; // Red outline
  element.style.zIndex = "1000"; // Bring to front
  
  // Make resize boxes visible for the newly selected element
  const resizeBoxes = element.querySelectorAll("[id^='resizeBox']");
  resizeBoxes.forEach(box => {
    box.style.visibility = "visible";
  });
  
}

export const isElementClicked = (element, elementDiv, x, y) => {
  const height = parseFloat(element.style.height.split("px")[0]) || element.offsetHeight;
  const width = parseFloat(element.style.width.split("px")[0]) || element.offsetWidth;

  const elementX = elementDiv.offsetLeft;
  const elementY = elementDiv.offsetTop;

  // The element has been clicked
  if (x >= elementX && x <= elementX + width && y >= elementY && y <= elementY + height) {
    return true;
  }

  // The element has not been clicked
  return false;
};

export const addItemOnScreen = (params) => {
  return new Promise((resolve) => {
    let latestItem = params.items.length;
    params.isAddingItems.value = false;
    hideScreen(params.itemsAdditionScreen);

    // Item Div
    const div = document.createElement("div");
    div.id = `div${params.type.charAt(0).toUpperCase() + params.type.slice(1)}${latestItem}`;
    div.style.display = "inline-block";
    div.style.position = "absolute";

    if (params.addableImg && params.isInitializing) {
      div.style.left = params.addableImg.style.left;
      div.style.top = params.addableImg.style.top;
    } else div.style.left = div.style.top = "412px";

    const resizeBoxTL = document.createElement("div");
    const resizeBoxTR = document.createElement("div");
    const resizeBoxBL = document.createElement("div");
    const resizeBoxBR = document.createElement("div");

    handleResizeBoxStyles({ resizeBox: resizeBoxTL, latestItem: params.itemDivs.length + 1, direction: "TL" });
    handleResizeBoxStyles({ resizeBox: resizeBoxTR, latestItem: params.itemDivs.length + 1, direction: "TR" });
    handleResizeBoxStyles({ resizeBox: resizeBoxBL, latestItem: params.itemDivs.length + 1, direction: "BL" });
    handleResizeBoxStyles({ resizeBox: resizeBoxBR, latestItem: params.itemDivs.length + 1, direction: "BR" });

    resizeBoxTL.style.left = "-6px";
    resizeBoxTL.style.top = "-6px";

    resizeBoxTR.style.right = "-6px";
    resizeBoxTR.style.top = "-6px";

    resizeBoxBL.style.left = "-6px";
    resizeBoxBL.style.bottom = "-6px";

    resizeBoxBR.style.right = "-6px";
    resizeBoxBR.style.bottom = "-6px";

    const theImg = params.addableImg ? params.addableImg : params.choosableImgs[params.choosableImgIndex];

    const width = theImg.style.width.split("px")[0];
    const height = theImg.style.height.split("px")[0];

    // Item
    const img = document.createElement("img");
    img.src = theImg.src;

    img.id = `${params.type}${latestItem}`;
    img.style.cursor = "move";
    img.style.width = "200px";
    img.style.height = `${(height * 200) / width}px`;
    img.style.border = "1px solid red";

    div.appendChild(resizeBoxTL);
    div.appendChild(resizeBoxTR);
    div.appendChild(resizeBoxBL);
    div.appendChild(resizeBoxBR);

    div.appendChild(img);
    document.getElementsByClassName("container")[0].appendChild(div);

    // Update all arrays now
    params.itemDivs.push(div);
    params.items.push(img);

    params.resizeBoxes.push(resizeBoxTL);
    params.resizeBoxes.push(resizeBoxTR);
    params.resizeBoxes.push(resizeBoxBL);
    params.resizeBoxes.push(resizeBoxBR);

    params.allowItemMove.push(false);
    params.allowItemResize.push(false);
    params.lastScales.push(1.0);

    // Resolve the promise once the DOM manipulation is done
    resolve();
  });
};

export const disallowDelete = (params) => {
  params.isDragging.value = false;

  // Update the button's position
  params.targetDiv.style.left = `${params.savedX.value}px`;
  params.targetDiv.style.top = `${params.savedY.value}px`;

  params.lastX.value = parseInt(params.targetDiv.style.left);
  params.lastY.value = parseInt(params.targetDiv.style.top);

  params.allowItemMove[params.i] = false;

  // Remove the move event listener
  document.removeEventListener("mousemove", (e) => {
    handleDrag(e, params.i, params.type);
  });
};
