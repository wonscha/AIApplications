"use stricts";
const serverUrl = "http://127.0.0.1:8000";

class HttpError extends Error {
  constructor(response) {
    super(`${response.status} for ${response.url}`);
    this.name = "HttpError";
    this.response = response;
  }
}

const uploadImage = async () => {
  try {
    // encode input file as base64 string for upload
    let file = document.getElementById("file").files[0];
    let converter = new Promise(function(resolve, reject) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.toString().replace(/^data:(.*,)?/, ''));
      reader.onerror = (error) => reject(error);
    });
    let encodedString = await converter;

    // clear file upload input field
    document.getElementById("file").value = "";

    // make server call to upload image
    // and return the response
    const response = await fetch(serverUrl + "/images", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify({filename: file.name, filebytes: encodedString})
    })

    if (response.ok) {
      return response.json();
    } else {
      throw new HttpError(response);
    }
  } catch (error) {
    throw(error);
  }
}

const updateImage = (image) => {
  document.getElementById('view').style.display = "block";

  let imageElem = document.getElementById("image");
  imageElem.src = image["fileUrl"];
  imageElem.alt = image["fileId"];

  return image;
}

const translateImage = async (image) => {
  try {
    // make server call to translate image
    // and return the response
    const response = await fetch(serverUrl + "/images/" + image["fileId"] + "/tranlsate-text", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({fromLang: "auto", toLang: "en"})
    })

    if (response.ok) {
      return response.json()
    } else {
      throw new HttpError(response);
    }
  } catch (error) {
    throw(error);
  }
}

const annotateImage = (translations) => {
  let translationsElem = document.getElementById("translations");
  while (translationsElem.firstchild) {
    translationsElem.removeChild(translationsElem.firstChild);
  }
  translationsElem.clear

  for (let i = 0; i < translations.length; i++) {
    let translationElem = document.createElement("h6");
    translationElem.appendChild(document.createTextNode(
      translations[i]["text"] + " -> " + translations[i]["translation"]["translatedText"]
    ));
    translationsElem.appendChild(document.createElement("hr"));
    translationsElem.appendChild(translationElem);
  }
}

const uploadAndTranslate = async () => {
  try {
    const image = await uploadImage();
    updateImage(image);
    const translations = await translateImage(image);
    annotateImage(translations)
  } catch (error) {
    alert("Error: " + error);
  }
}