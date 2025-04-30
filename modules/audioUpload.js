// -------------- //
//  AUDIO UPLOAD  //
// -------------- //
export const handleAudioUpload = (e, params) => {
  const file = e.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      params.audioElement.src = params.playableAudio.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }
};
