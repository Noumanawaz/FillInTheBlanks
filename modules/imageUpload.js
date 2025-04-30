// -------------- //
//  IMAGE UPLOAD  //
// -------------- //
export const handleChangeImageUpload = (e, item) => {
  return new Promise((resolve, reject) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const img = new Image(); // Create a new Image object

        // When the image is loaded, we can access its width and height
        img.onload = function () {
          const imgWidth = img.width;
          const imgHeight = img.height;
          const scaledWidth = (imgWidth * item.offsetHeight) / imgHeight;

          // Set the item source and adjust width
          item.src = e.target.result;
          item.style.width = `${scaledWidth}px`;

          // Resolve the promise with the image data (optional, you can return more data if needed)
          resolve({ src: e.target.result, width: imgWidth, height: imgHeight });
        };

        // Handle image load errors
        img.onerror = function () {
          reject(new Error("Error loading the image"));
        };

        // Set the image source to the result of FileReader
        img.src = e.target.result;
      };

      // Handle file reading errors
      reader.onerror = function () {
        reject(new Error("Error reading the file"));
      };

      // Read the file as a data URL
      reader.readAsDataURL(file);
    } else {
      reject(new Error("No file selected"));
    }
  });
};

export const handleImageUpload = (e, params) => {
  return new Promise((resolve, reject) => {
    const files = e.target.files[0];
    let imgWidth, imgHeight;

    if (files) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const img = new Image();

        // When the image is loaded, we can access its width and height
        img.onload = function () {
          imgWidth = img.width;
          imgHeight = img.height;
          const scaledWidth = (imgWidth * 150) / imgHeight;

          // This new image has to be added to a container

          if (params.targetContainer && params.latestItem) {
            // Create the first image (choosable image)
            params.latestItem.value += 1;

            const newImg = document.createElement("img");
            newImg.src = e.target.result;
            newImg.id = `${params.type}${params.latestItem.value}`;
            newImg.style.cursor = "pointer";
            newImg.style.width = `${scaledWidth}px`;
            newImg.style.height = "150px";
            newImg.style.border = "2px solid transparent";

            params.targetContainer.appendChild(newImg);
          }

          // This image only has to replace an existing one
          else {
            params.targetImg.src = e.target.result;
            params.targetImg.style.width = `${scaledWidth}px`;
            params.targetImg.style.height = "150px";
          }

          // Resolve the promise once the image has been processed
          resolve({ imgWidth, imgHeight });
        };

        img.onerror = reject; // Reject if there's an error loading the image

        // Set the image source to the result of FileReader
        img.src = e.target.result;
      };

      reader.onerror = reject; // Reject if there's an error reading the file

      // Read the file as a data URL
      reader.readAsDataURL(files);
    } else {
      reject(new Error("No file selected")); // Reject if no file is selected
    }
  });
};

export const handleSingleImageUpload = (e, params) => {
  return new Promise((resolve, reject) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const img = new Image();

        // When the image is loaded, we can access its width and height
        img.onload = function () {
          const imgWidth = img.width;
          const imgHeight = img.height;

          const targetScaledWidth = (imgWidth * params.targetImg.offsetHeight) / imgHeight;
          const newImgScaledWidth = (imgWidth * params.newImg.offsetHeight) / imgHeight;

          // Set the item source
          params.targetImg.src = e.target.result;
          params.newImg.src = e.target.result;

          // Maintain aspect ratio
          params.targetImg.style.width = `${targetScaledWidth}px`;
          params.newImg.style.width = `${newImgScaledWidth}px`;

          // Resolve the promise with the image data (optional, you can return more data if needed)
          resolve({ src: e.target.result, width: imgWidth, height: imgHeight });
        };

        // Handle image load errors
        img.onerror = function () {
          reject(new Error("Error loading the image"));
        };

        // Set the image source to the result of FileReader
        img.src = e.target.result;
      };

      // Handle file reading errors
      reader.onerror = function () {
        reject(new Error("Error reading the file"));
      };

      // Read the file as a data URL
      reader.readAsDataURL(file);
    } else {
      reject(new Error("No file selected"));
    }
  });
};
