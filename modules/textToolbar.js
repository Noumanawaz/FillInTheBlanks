// -------------- //
//  TEXT TOOLBAR  //
// -------------- //
export const handleItemTextToolbar = (e, params) => {
  if (!params.isEditing.value) return;

  params.textToolbar.style.display = "flex";

  // Get the item that was just clicked & position the toolbar above it

  // params.textToolbar.style.left = `${e.clientX * (1024 / targetWidth) - 115}px`;
  // params.textToolbar.style.top = `${e.clientY * (1024 / targetHeight)}px`;
};
