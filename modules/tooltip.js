import { playSound } from "./utils.js";

// --------- //
//  TOOLTIP  //
// --------- //
export const handleButtonClick = (params) => {
  if (params.isEditing.value) return;
  playSound(params.clickSound);

  // Open tooltip
  if (params.isTooltipOpen.value === false) {
    params.btn.src = "assets/close.webp";
    params.btnDiv.style.left = params.btnDiv.style.top = "95px";
    params.btnDiv.style.transform = "scale(1)";

    params.gameTooltip.style.zIndex = 4000;
    params.gameTooltip.style.display = params.title.style.display = params.description.style.display = "block";
  }

  // Close tooltip
  else {
    params.btn.src = params.btnSrc.value;
    params.btnDiv.style.left = `${params.btnLastX.value}px`;
    params.btnDiv.style.top = `${params.btnLastY.value}px`;
    params.btnDiv.style.transform = `scale(${params.lastScales[0]})`;

    params.gameTooltip.style.zIndex = 0;
    params.gameTooltip.style.display = params.title.style.display = params.description.style.display = "none";
  }

  params.isTooltipOpen.value = !params.isTooltipOpen.value;
  params.btn.style.cursor = "pointer";
};

export const handleTitleInput = () => {
  if (title.textContent.length > 19) {
    title.textContent = title.textContent.slice(0, 19);
  }
};

export const handleTitleKeyDown = (e) => {
  if (title.textContent.length >= 19 && e.key !== "Backspace" && e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "ArrowUp" && e.key !== "ArrowDown") {
    e.preventDefault();
  }
};

export const handleDescriptionInput = () => {
  if (description.textContent.length > 180) {
    description.textContent = description.textContent.slice(0, 180);
  }
};

export const handleDescriptionKeyDown = (e) => {
  if (description.textContent.length >= 180 && e.key !== "Backspace" && e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "ArrowUp" && e.key !== "ArrowDown") {
    e.preventDefault();
  }
};

export const btnOnHandler = (params) => {
  if (!params.showTooltip.value) {
    params.btnOn.classList.add("custom-button");
    params.btnOn.classList.remove("custom-whiteAndOff-button");

    params.btnOff.classList.add("custom-whiteAndOff-button");
    params.btnOff.classList.remove("custom-button");
    params.btnDiv.style.display = "block";
    params.showTooltip.value = true;

    // Show the button's resize handlers as well
    for (let i = 0; i < 4; i++) {
      params.resizeBoxes[i].style.visibility = "visible";
    }
  }
};

export const btnOffHandler = (params) => {
  if (params.showTooltip.value) {
    params.btnOff.classList.add("custom-button");
    params.btnOff.classList.remove("custom-whiteAndOff-button");

    params.btnOn.classList.add("custom-whiteAndOff-button");
    params.btnOn.classList.remove("custom-button");
    params.btnDiv.style.display = "none";
    params.showTooltip.value = false;

    // Hide the button's resize handlers as well
    for (let i = 0; i < 4; i++) {
      params.resizeBoxes[i].style.visibility = "hidden";
    }
  }
};

export const btnBlackHandler = (params) => {
  params.btnBlack.classList.add("custom-button");
  params.btnBlack.classList.remove("custom-whiteAndOff-button");

  params.btnWhite.classList.add("custom-whiteAndOff-button");
  params.btnWhite.classList.remove("custom-button");

  params.btnSrc.value = params.btn.src = "assets/infoDark.webp";
};

export const btnWhiteHandler = (params) => {
  params.btnWhite.classList.add("custom-button");
  params.btnWhite.classList.remove("custom-whiteAndOff-button");

  params.btnBlack.classList.add("custom-whiteAndOff-button");
  params.btnBlack.classList.remove("custom-button");
  params.btnSrc.value = params.btn.src = "assets/info.webp";
};
