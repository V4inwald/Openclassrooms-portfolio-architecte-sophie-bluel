// --------------------- Je récupère les données du serveur ---------------------

//Récupere la liste des projets et catégories dans le localStorage
let projectList = window.localStorage.getItem("projectListStored");
let projectCategories = window.localStorage.getItem("projectCategoriesStored");

//Si pas dans le localStorage les demande a l'API et les stocke
if (projectList === null || projectCategories === null) {
  // Liste des projets
  const response = await fetch("http://localhost:5678/api/works");
  projectList = await response.json();
  //liste des catégories
  const responseCategories = await fetch(
    "http://localhost:5678/api/categories"
  );
  projectCategories = await responseCategories.json();

  // Transformation des listes en JSON
  const stringProjectList = JSON.stringify(projectList);
  const stringCategoriesList = JSON.stringify(projectCategories);
  // Stockage des informations dans le localStorage
  window.localStorage.setItem("projectListStored", stringProjectList);
  window.localStorage.setItem("projectCategoriesStored", stringCategoriesList);
} else {
  projectList = JSON.parse(projectList);
  projectCategories = JSON.parse(projectCategories);
}

// Genère dynamiquement les projets
function genererProjets(projectsToGenerate) {
  for (let i in projectsToGenerate) {
    let category = projectsToGenerate[i].categoryId;
    let titleProject = projectsToGenerate[i].title;
    let src = projectsToGenerate[i].imageUrl;

    document.querySelector(
      ".js-gallery"
    ).innerHTML += `<figure class=category-${category}>
          <img src=${src} alt="${titleProject}}">
          <figcaption>${titleProject}</figcaption>
      </figure>`;
  }
}

//genere le filtres depuis la liste des categories
function genererFiltres(filtersToGenerate) {
  const filterContainer = document.querySelector(".js-project-filters");

  filterContainer.innerHTML += `<button class="filter-button">Tous</button>`;

  for (let i in filtersToGenerate) {
    let filterId = filtersToGenerate[i].id;
    let filterName = filtersToGenerate[i].name;

    filterContainer.innerHTML += `<button id=category-${filterId}-button class="filter-button">${filterName}</button>`;
  }
}

// Genère tout les projets
genererProjets(projectList);

// --------------------- Les filtres ---------------------

genererFiltres(projectCategories);

const filterButtons = document.getElementsByClassName("filter-button");

//Réponds au click sur un boutton des filtres
for (let button of filterButtons) {
  button.addEventListener("click", () => {
    //crée une variable category depuis l'id du bouton (0 represente le bouton Tous)
    let category = 0;
    //Compare le bouton cliqué avec la classe du bouton qui indique la catégorie
    for (let i in projectCategories + 1) {
      if (button == document.getElementById(`category-${i}-button`)) {
        category = i;
      }
    }
    //copie la liste des projets pour ne pas modifier la liste initiale
    let filteredProjects = Array.from(projectList);

    //Trie la liste selon la catégorie, le bouton Tous (cathégorie 0) ne fait rien
    if (category != 0) {
      for (let j = filteredProjects.length - 1; j >= 0; j--) {
        if (filteredProjects[j].categoryId != category) {
          filteredProjects.splice(j, 1);
        }
      }
    }
    // actualise l'affichage
    document.querySelector(".js-gallery").innerHTML = "";
    genererProjets(filteredProjects);
  });
}

// --------------------- Fenetre modale et espace administrateur ---------------------
// Je verifie si il y a un tocken, si oui j'affiche la fenetre modale

if (sessionStorage.getItem("token") !== null) {
  const userToken = sessionStorage.getItem("token");

  //cacher les filtres
  const hideFilters = document.querySelector(".js-project-filters");
  hideFilters.style.display = "none";

  //changer login en logout
  const linksNavigation = document.querySelectorAll("header nav li a");
  const authentication = linksNavigation[2];
  authentication.innerHTML = "logout";

  //lors du logout je supprime le token
  authentication.addEventListener("click", (event) => {
    event.preventDefault();
    window.sessionStorage.removeItem("token");
    location.reload();
  });

  //Ajoute la bande noire en haut de la page
  const modalElementEdition = document.querySelector(
    ".js-admin-toolbar-hidden"
  );
  modalElementEdition.innerHTML += `<div class="admin-toolbar-text"><i class="fa-regular fa-pen-to-square"></i>
  <p>Mode édition</p></div> 
  <button class="admin-toolbar-button">publier les changements</button>`;
  modalElementEdition.classList.add("js-admin-toolbar-visible");
  //change un peu le style
  document.querySelector("header").setAttribute("style", "margin-top:100px");
  document
    .querySelector(".portfolio-title-layout")
    .setAttribute("style", "margin-bottom:3em");

  const openEdit = document.querySelector(".js-modal-edit");
  openEdit.innerHTML += `<i class="fa-regular fa-pen-to-square"></i>
  <p>modifier</p>`;

  // Work In Progress : j'essaye de voir comment travailler sur la modale

  //toggle affiche ou cache la modale
  const modalContainer = document.querySelector(".modal-container");
  const modalTriggers = document.querySelectorAll(".modal-trigger");

  modalTriggers.forEach((trigger) =>
    trigger.addEventListener("click", () => {
      modalContainer.classList.toggle("active");
    })
  );

  //toggle affiche ou cache l'étape 1 ou 2 de la modale
  const modalToggleView = document.querySelectorAll(".toggle-modal-view");
  const modalStepOne = document.querySelector(".gallery-step-modal");
  const modalStepTwo = document.querySelector(".add-works-step-modal");

  modalToggleView.forEach((trigger) =>
    trigger.addEventListener("click", () => {
      modalStepOne.classList.toggle("active");
      modalStepTwo.classList.toggle("active");
    })
  );

  //generer projets dans la
  const galleryContainer = document.querySelector(".edit-gallery-container");
  const addWorksContainer = document.querySelector(".add-works-container");

  for (let i in projectList) {
    let titleProject = projectList[i].title;
    let src = projectList[i].imageUrl;
    let projectId = projectList[i].id;

    galleryContainer.innerHTML += `<figure class="edit-gallery-work">
            <img src=${src} alt="${titleProject}}">
            <div class="delete-icon" id="delete-id-${projectId}"><i class="fa-solid fa-trash-can"></i></div>
            <figcaption>éditer</figcaption>
        </figure>`;
  }

  generateModalAddWorks(projectCategories);
}

// Fonction (a déplacer en haut) qui crée le contenu de add works container

function generateModalAddWorks(projectCategories) {
  const addWorksContainer = document.querySelector(".add-works-container");

  addWorksContainer.innerHTML += `
  <form id="new-work" action="#" method="post">
    <div class="new-work-image-container">
        <div class="new-work-image-icon">
        <i class="fa-regular fa-image"></i>
        </div>
        <label for="upload-work-image" class="upload-work-image-class">+ Ajouter photo</label>
        <input accept="image/*" type="file" id="upload-work-image" required>
        <p>jpg, png : 4mo max</p>
        <div class="preview-image">
          <img id="image-to-upload" src="#" alt="votre image" />
        </div>
    </div>
    <label for="title">Titre</label>
    <input type="text" name="title" id="title" required>
    <label for="category">Catégorie</label>
    <select name="category" id="category" required>
      <option value=""></option>
  </form>`;

  const selectDynamicCategory = document.querySelector(
    `select[name="category"]`
  );

  for (let category in projectCategories) {
    let categoryName = projectCategories[category].name;
    let categoryId = projectCategories[category].id;

    selectDynamicCategory.innerHTML += `
    <option value="category-id-${categoryId}">${categoryName}</option>`;
  }

  const submitForm = document.querySelector("#confirm-add-work");
  submitForm.innerHTML += `<input form="new-work" type="submit" value="Valider" id="submit-new-work" class="modal-buttons  inactive_button">`;
}

const uploadImage = document.querySelector("#upload-work-image");
const imageToUpload = document.querySelector("#image-to-upload");
const newWorkImageContainer = document.querySelector(
  ".new-work-image-container"
);
const previewImage = document.querySelector(".preview-image");

newWorkImageContainer.addEventListener("click", (e) => {
  if (e.target.tagName == "LABEL") return;
  uploadImage.click();
});

//quand une image est chargée fait apparaitre le preview
uploadImage.onchange = (evenement) => {
  const [file] = uploadImage.files;
  if (file) {
    imageToUpload.src = URL.createObjectURL(file);
    previewImage.style.zIndex = "1";
    previewImage.classList.add("preview-image-is-visible");
    document
      .querySelector("#submit-new-work")
      .classList.remove("inactive_button");
  }
};
