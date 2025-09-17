socket.addEventListener("message", (event) => {
  var input_element = document.getElementById("id-of-input-field");
  var input_field_content = input_element.value;

  console.log("value of input field: ", input_field_content);

  if (input_element.value != "") {
    input_element.value = "";
  }

  const responseDiv = document.getElementById("response");
  const response = JSON.parse(event.data); // Parse the JSON response
  // Access the response and sources properties
  const generatedResponse = response.response;
  const sources = eval(response.sources);
  const clearSources = sources.map((entry) => {
    return `${entry.source}, ${entry.article_number}<br>${entry.content}<br><br>`;
  });
  const clearsourcesjoin = clearSources.join("\n");
  // Display the generated text and sources in the responseDiv
  responseDiv.innerHTML = `
                <p class="spark-hero-sub-paragraph-4"><br>${generatedResponse}</p><br>
                <p class="spark-hero-sub-paragraph-4"><strong>Sources</strong></p>
                <p class="spark-hero-sub-paragraph-4">${clearsourcesjoin}</p>
            `;
});
