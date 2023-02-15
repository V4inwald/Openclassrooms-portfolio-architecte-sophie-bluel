const loginForm = document.getElementById("connection");

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
      alert("Erreur, verifiez votre identifiant ou votre mot de passe");
    });
});
