// ------ //
//  DRAG  //
// ------ //
export const handleDragStart = (e, params) => {
  if (params.isDragging.value || params.gameWon || params.isResizing.value || (!params.isEditing.value && (params.type === "targetObject" || params.type === "button"))) return;

  if (params.subType !== "text" || !params.isEditing.value) {
    e.preventDefault();
  }

  params.isDragging.value = true;

  // Save the item's last coordinates
  params.savedX.value = parseInt(params.targetDiv.style.left);
  params.savedY.value = parseInt(params.targetDiv.style.top);

  // An item is already being dragged
  for (let k = 0; k < params.allowItemMove.length; k++) {
    if (params.allowItemMove[k]) return;
  }

  // Allow this item to be moved now
  params.allowItemMove[params.i] = true;

  // For avoiding a teleportation bug
  params.teleporationFix.value = 0;

  // Call the drag function twice to avoid the image transportation bug: The image position fluctuates at the start.
  handleDrag(e, params);
  handleDrag(e, params);

  // Add the move event listener
  document.addEventListener("mousemove", (e) => handleDrag(e, params));
};

export const handleDrag = (e, params) => {
  if (params.subType !== "text" || !params.isEditing.value) {
    e.preventDefault();
  }

  // Moving Item Check || Game Won
  if (!params.allowItemMove[params.i] || params.gameWon || params.isResizing.value) return;

  // Check if all items are not allowed to move - if so, then a screenshot is being captured
  let check = false;

  for (let j = 0; j < params.allowItemMove.length; j++) {
    if (params.allowItemMove[j]) {
      check = true;
      break;
    }
  }

  if (!check) return;

  // Don't allow dragging while resizing
  if (params.isResizing.value) handleDragEnd(e, i, type);

  // Mouse Coordinates
  const convertedX = e.clientX * (1024 / targetWidth);
  const convertedY = e.clientY * (1024 / targetHeight);

  // Check if the target is out of bounds
  if (convertedX < 0 || convertedX > 1100 || convertedY < 0 || convertedY > 1024) {
    handleDragEnd(e, params);
    return;
  }

  // Get the target's position
  let imgX = parseInt(params.targetDiv.style.left);
  let imgY = parseInt(params.targetDiv.style.top);

  // For fixing some weird transportation bug
  params.teleporationFix.value += 1;

  if (params.teleporationFix.value < 3) {
    params.deltaX.value = imgX - convertedX;
    params.deltaY.value = imgY - convertedY;
  }

  let newX = convertedX - params.deltaX.value;
  let newY = convertedY - params.deltaY.value;

  // New position of the targets
  params.targetDiv.style.left = `${newX}px`;
  params.targetDiv.style.top = `${newY}px`;
};

export const handleDragEnd = (e, params) => {
  if (params.subType !== "text" || !  params.isEditing.value) {
    e.preventDefault();
  }

  // Update all variables
  params.isDragging.value = params.allowItemMove[params.i] = false;
  params.teleporationFix.value = 0;

  // Check if the target is out of bounds
  if (e.clientX < 50 || (!params.isEditing.value && params.placeBack && params.type !== "targetObject")) {
    params.targetDiv.style.left = `${params.savedX.value}px`;
    params.targetDiv.style.top = `${params.savedY.value}px`;
  }

  if (params.type === "button" && params.isEditing.value) {
    params.btnLastX.value = parseInt(params.targetDiv.style.left);
    params.btnLastY.value = parseInt(params.targetDiv.style.top);
  }

  // Remove the move event listener
  document.removeEventListener("mousemove", (e) => handleDrag(e, params));
};
