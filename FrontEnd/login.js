import { showErrorMessage, urlApi } from "./assets/exports.js";

const loginForm = document.getElementById("connection");
const linksNavigation = document.querySelectorAll("header nav li a");
const authentication = linksNavigation[2];

//mets le bouton Login en gras
authentication.style.fontWeight = "600";

//gère la connection
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const inputEmail = document.getElementById("email").value;
  const inputPassword = document.getElementById("password").value;

  const inputLogin = { email: inputEmail, password: inputPassword };
  const formDataString = JSON.stringify(inputLogin);

  //Appel a l'API
  fetch(`${urlApi}/api/users/login`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/JSON",
    },
    body: formDataString,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .then((responseJson) => {
      /*si réponse positive stocke le token dans le sessionStorage
      puis redirige vers l'acceuil */
      sessionStorage.setItem("token", responseJson.token);
      location.href = "index.html";
    })
    .catch((error) => {
      console.log(`erreur : ${error}`);

      //affichage du message d'erreur pendant 5s
      showErrorMessage("error-message", 5000);
    });
});
