const loginForm = document.getElementById("connection");

const linksNavigation = document.querySelectorAll("header nav li a");
const authentication = linksNavigation[2];
authentication.style.fontWeight = "600";

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const inputEmail = document.getElementById("email").value;
  const inputPassword = document.getElementById("password").value;

  const inputLogin = { email: inputEmail, password: inputPassword };
  const formDataString = JSON.stringify(inputLogin);

  fetch("http://localhost:5678/api/users/login", {
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
      sessionStorage.setItem("token", responseJson.token);
      location.href = "index.html";
    })
    .catch(() => {
      // console.log(`erreur : ${error}`);
      const errorMessage = document.querySelector(".error-message");
      errorMessage.style.visibility = "visible";
      errorMessage.style.animation = "appear 0.2s";
      window.setTimeout(() => {
        errorMessage.style.animation = "disappear 0.5s";
        window.setTimeout(() => {
          errorMessage.style.visibility = "hidden";
        }, 500);
      }, "5000");
    });
});
