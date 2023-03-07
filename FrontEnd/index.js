// --------------------- Je récupère les données du serveur ---------------------
import {
  urlApi,
  generateFilters,
  generateProjects,
  generateModalAddWorks,
  generateModalGallery,
  deleteWork,
  addNewProject,
  majProjectList,
} from "./assets/exports.js";

//Récupere la liste des projets et catégories dans le localStorage
let projectList = window.localStorage.getItem("projectListStored");
let projectCategories = window.localStorage.getItem("projectCategoriesStored");
//Si pas dans le localStorage les demande a l'API et les stocke
if (projectList === null || projectCategories === null) {
  // Liste des projets
  const response = await fetch(`${urlApi}/api/works`);
  projectList = await response.json();
  //liste des catégories
  const responseCategories = await fetch(`${urlApi}/api/categories`);
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

// Genère tout les projets
generateProjects(projectList);

// --------------------- Les filtres ---------------------

generateFilters(projectCategories);

const filterButtons = document.getElementsByClassName("filter-button");

//Réponds au click sur un boutton des filtres
for (let button of filterButtons) {
  button.addEventListener("click", () => {
    /*supprime la couleur "activée" du dernier bouton 
    et l'ajoute au nouveau bouton clické*/
    document
      .querySelector(".filter-button-active")
      .classList.remove("filter-button-active");
    button.classList.add("filter-button-active");
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

    //Trie la liste selon la catégorie, le bouton Tous (catégorie 0) ne fait rien
    if (category != 0) {
      for (let j = filteredProjects.length - 1; j >= 0; j--) {
        if (filteredProjects[j].categoryId != category) {
          filteredProjects.splice(j, 1);
        }
      }
    }

    generateProjects(filteredProjects);
  });
}

// --------------------- Fenetre modale et espace administrateur ---------------------

// Je verifie si il y a un tocken, si oui j'affiche la fenetre modale

if (sessionStorage.getItem("token") !== null) {
  const hideFilters = document.querySelector(".js-project-filters");
  const linksNavigation = document.querySelectorAll("header nav li a");
  const authentication = linksNavigation[2];
  const modalElementEdition = document.querySelector(
    ".js-admin-toolbar-hidden"
  );
  const openEdit = document.querySelector(".js-modal-edit");
  const modalContainer = document.querySelector(".modal-container");
  const modalTriggers = document.querySelectorAll(".modal-trigger");
  const modalToggleView = document.querySelectorAll(".toggle-modal-view");
  const modalStepOne = document.querySelector(".gallery-step-modal");
  const modalStepTwo = document.querySelector(".add-works-step-modal");
  const deleteAllProjects = document.querySelector("#delete-gallery");

  //cacher les filtres
  hideFilters.style.display = "none";

  //changer login en logout
  authentication.innerHTML = "logout";

  //lors du logout je supprime le token
  authentication.addEventListener("click", (event) => {
    event.preventDefault();
    window.sessionStorage.removeItem("token");
    location.reload();
  });

  //Ajoute la bande noire en haut de la page
  modalElementEdition.innerHTML += `<div class="admin-toolbar-text"><i class="fa-regular fa-pen-to-square"></i>
  <p>Mode édition</p></div> 
  <button class="admin-toolbar-button">publier les changements</button>`;
  modalElementEdition.classList.add("js-admin-toolbar-visible");
  //change un peu le style
  document.querySelector("header").setAttribute("style", "margin-top:100px");
  document
    .querySelector(".portfolio-title-layout")
    .setAttribute("style", "margin-bottom:3em");

  //bouton modifier
  openEdit.innerHTML += `<i class="fa-regular fa-pen-to-square"></i>
  <p>modifier</p>`;

  //toggle affiche ou cache la modale
  modalTriggers.forEach((trigger) =>
    trigger.addEventListener("click", () => {
      modalContainer.classList.toggle("active");
    })
  );

  //toggle affiche ou cache l'étape 1 ou 2 de la modale
  modalToggleView.forEach((trigger) =>
    trigger.addEventListener("click", () => {
      modalStepOne.classList.toggle("active");
      modalStepTwo.classList.toggle("active");
    })
  );

  //generer projets dans la modale (partie 1)
  // appele la fonction deleteWork en cas de click sur supprimer
  generateModalGallery(projectList);

  ////generer la partie 2 de la modale
  generateModalAddWorks(projectCategories);

  //ajoute un nouveau projet
  addNewProject();

  //s'active quand le sessionStorage ou le localStorage change
  window.addEventListener("storage", async () => {
    // si le localStorage change, actualise la liste des projets
    let newProjectList = await majProjectList(projectList);
    generateProjects(newProjectList);
    generateModalGallery(newProjectList);
  });

  //delete every project
  deleteAllProjects.addEventListener("click", () => {
    console.log(projectList);
    for (let i in projectList) {
      deleteWork(projectList[i].id);
    }
  });
}
