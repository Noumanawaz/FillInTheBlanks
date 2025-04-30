// -------------- //
//  CONTEXT MENU  //
// -------------- //
export const handleItemContextMenu = (e, params) => {
  if (!params.isEditing.value) return;

  if (params.type === "text") params.changeImageBtn.style.display = "none";
  else params.changeImageBtn.style.display = "block";

  params.contextMenu.style.display = "block";
  params.contextMenu.style.left = `${e.clientX * (1024 / targetWidth) - 115}px`;
  params.contextMenu.style.top = `${e.clientY * (1024 / targetHeight)}px`;
};
