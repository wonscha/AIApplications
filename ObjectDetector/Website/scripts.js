"use strict";

const serverUrl = "http://127.0.0.1:8000";

const runDemo = async () => {
  try {
    // fetch response from endpoint
    const response = await fetch(serverUrl + "/demo-object-detection", {
      method: "GET"
    })

    // throw if response isn't ok
    if (!response.ok) {
      throw response;
    }

    // parse response to json
    const data = await response.json();

    // display image and add alt
    let imageElem = document.getElementById("image");
    imageElem.src = data.imageUrl;
    imageElem.alt = data.imageName;

    // display objects
    let objectsElem = document.getElementById("objects");
    let objects = data.objects;
    for (let i = 0; i < objects.length; i++) {
      let labelElem = document.createElement("h6");
      labelElem.appendChild(document.createTextNode(
        objects[i].label + ": " + objects[i].confidence + "%"
      ));
      objectsElem.appendChild(document.createElement("hr"));
      objectsElem.appendChild(labelElem);
    }
  } catch (error) {
    alert("Error: " + error)
  }
}