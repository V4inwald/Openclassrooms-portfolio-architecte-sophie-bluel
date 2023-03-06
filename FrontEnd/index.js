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
function generateProjects(projectsToGenerate) {
  const jsGallery = document.querySelector(".js-gallery");
  jsGallery.innerHTML = "";

  for (let i in projectsToGenerate) {
    let category = projectsToGenerate[i].categoryId;
    let titleProject = projectsToGenerate[i].title;
    let src = projectsToGenerate[i].imageUrl;

    jsGallery.innerHTML += `<figure class=category-${category}>
          <img src=${src} alt="${titleProject}}">
          <figcaption>${titleProject}</figcaption>
      </figure>`;
  }
}

//Genère le filtres depuis la liste des categories
function generateFilters(filtersToGenerate) {
  const filterContainer = document.querySelector(".js-project-filters");

  filterContainer.innerHTML += `
  <button class="filter-button filter-button-active">Tous</button>`;

  for (let i in filtersToGenerate) {
    let filterId = filtersToGenerate[i].id;
    let filterName = filtersToGenerate[i].name;

    filterContainer.innerHTML += `
    <button id=category-${filterId}-button class="filter-button">${filterName}</button>`;
  }
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

// Fonction qui crée le contenu de add works container
function generateModalAddWorks(projectCategories) {
  const addWorksContainer = document.querySelector(".add-works-container");

  addWorksContainer.innerHTML += `
  <form id="new-work" action="#" method="post">
    <div class="new-work-image-container">
        <div class="new-work-image-icon">
        <i class="fa-regular fa-image"></i>
        </div>
        <label for="upload-work-image" class="upload-work-image-class">+ Ajouter photo</label>
        <input accept=".png, .jpeg, .jpg" type="file" id="upload-work-image" required>
        <p>jpg, png : 4mo max</p>
        <div class="preview-image">
          <img id="image-to-upload" src="#" alt="votre image" />
        </div>
        <div class="error-box-to-big">Le fichier est trop lourd, il doit faire 4Mo au maximum</div>
    </div>
    <label for="title">Titre</label>
    <input type="text" name="title" id="title" required>
    <label for="category">Catégorie</label>
    <select name="category" id="category" required>
      <option value=""></option>
  </form>`;

  const uploadImage = document.querySelector("#upload-work-image");
  const imageToUpload = document.querySelector("#image-to-upload");
  const newWorkImageContainer = document.querySelector(
    ".new-work-image-container"
  );
  const previewImage = document.querySelector(".preview-image");
  const selectDynamicCategory = document.querySelector(
    `select[name="category"]`
  );

  for (let category in projectCategories) {
    let categoryName = projectCategories[category].name;
    let categoryId = projectCategories[category].id;

    selectDynamicCategory.innerHTML += `
    <option value="${categoryId}">${categoryName}</option>`;
  }

  const submitForm = document.querySelector("#confirm-add-work");
  submitForm.innerHTML += `
  <input form="new-work" type="submit" value="Valider" id="submit-new-work" 
  class="modal-buttons  inactive_button">`;

  //permet de cliquer sur tout le cadre pour charger une image
  newWorkImageContainer.addEventListener("click", (e) => {
    if (e.target.tagName == "LABEL") return;
    uploadImage.click();
  });

  uploadImage.onchange = (evenement) => {
    const [file] = uploadImage.files;
    if (file) {
      if (file.size > 4194304) {
        //affiche le message d'erreur si image trop lourde
        const errorMessage = document.querySelector(".error-box-to-big");
        errorMessage.style.zIndex = "1";
        errorMessage.style.visibility = "visible";
        errorMessage.style.animation = "appear 0.2s";
        window.setTimeout(() => {
          errorMessage.style.animation = "disappear 0.5s";
          window.setTimeout(() => {
            errorMessage.style.visibility = "hidden";
          }, 500);
        }, "4000");
        //réinitialise l'input
        uploadImage.value = "";
      } else {
        //quand une image est chargée fait apparaitre le preview
        imageToUpload.src = URL.createObjectURL(file);
        previewImage.classList.add("preview-image-is-visible");
        // rends sa couleur normale au bouton
        document
          .querySelector("#submit-new-work")
          .classList.remove("inactive_button");
      }
    }
  };
}
// fonction qui genere la gallerie de travaux dans la partie 1 de la modale
function generateModalGallery(projectList) {
  const galleryContainer = document.querySelector(".edit-gallery-container");
  galleryContainer.innerHTML = "";

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

  const allDeleteIcon = document.querySelectorAll(".delete-icon");

  allDeleteIcon.forEach((deleteIcon) => {
    //récupère id cliqué puis lance fonction qui supprime les travaux
    deleteIcon.addEventListener("click", (event) => {
      let idToGet = deleteIcon.id;
      idToGet = idToGet.replace("delete-id-", "");
      deleteWork(idToGet);
    });
  });
}

// supprime projet dont l'id est entré
function deleteWork(projectId) {
  fetch(`http://localhost:5678/api/works/${projectId}`, {
    method: "DELETE",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  })
    .then((response) => {
      if (response.ok) {
        return response;
      } else if (response.status == 401) {
        /*si non autorisé et donc que le token est 
        expiré le supprime et recharge la page*/
        window.sessionStorage.removeItem("token");
        const connectionErrorMessage = document.querySelector(
          ".connection-error-message"
        );
        connectionErrorMessage.style.visibility = "visible";
        connectionErrorMessage.style.zIndex = "1";
        connectionErrorMessage.style.animation = "appear 0.2s";
        window.setTimeout(() => {
          connectionErrorMessage.style.animation = "disappear 0.5s";
          window.setTimeout(() => {
            connectionErrorMessage.style.visibility = "hidden";
            connectionErrorMessage.style.zIndex = "1";
          }, 500);
        }, "5000");
      }
    })
    .then((response) => {
      //mets a jour la liste des projets
      localStorage.removeItem("projectListStored");
      window.dispatchEvent(new Event("storage"));
    })
    .catch((error) => console.log("erreur"));
}

// ajoute un nouveau projet
async function addNewProject() {
  const formAddNewProject = document.querySelector("#new-work");
  const previewImage = document.querySelector(".preview-image");

  formAddNewProject.addEventListener("submit", async (e) => {
    e.preventDefault();

    const imageForm = document.getElementById("upload-work-image").files[0];
    const imageType =
      document.getElementById("upload-work-image").files[0].type;
    const imageTitle = document.querySelector('input[name="title"]').value;
    const imageCategory = document.querySelector(
      'select[name="category"]'
    ).value;

    //utilise FormData pour les données du body
    const dataForm = new FormData();
    dataForm.append("image", imageForm, imageType);
    dataForm.append("title", imageTitle);
    dataForm.append("category", imageCategory);

    //Appel a l'API
    fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: dataForm,
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else if (response.status == 401) {
          /*si non autorisé et donc que le token est 
          expiré le supprime et recharge la page*/
          window.sessionStorage.removeItem("token");
          const connectionErrorMessage = document.querySelector(
            ".connection-error-message"
          );
          connectionErrorMessage.style.visibility = "visible";
          connectionErrorMessage.style.zIndex = "1";
          connectionErrorMessage.style.animation = "appear 0.2s";
          window.setTimeout(() => {
            connectionErrorMessage.style.animation = "disappear 0.5s";
            window.setTimeout(() => {
              connectionErrorMessage.style.visibility = "hidden";
              connectionErrorMessage.style.zIndex = "1";
            }, 500);
          }, "5000");
        }
      })
      .then((responseJson) => {
        //mets a jour la liste des projets
        localStorage.removeItem("projectListStored");
        window.dispatchEvent(new Event("storage"));
        //réinitialise le formulaire
        previewImage.classList.remove("preview-image-is-visible");
        formAddNewProject.reset();

        //toggle afin d'afficher la partie 1 de la modale et non la 2
        document
          .querySelector(".gallery-step-modal")
          .classList.toggle("active");
        document
          .querySelector(".add-works-step-modal")
          .classList.toggle("active");
      })
      .catch((error) => console.log(`erreur : ${error}`));
  });
}

//mets a jour la liste des projets
async function majProjectList() {
  const response = await fetch("http://localhost:5678/api/works");
  projectList = await response.json();
  const stringProjectList = JSON.stringify(projectList);
  window.localStorage.setItem("projectListStored", stringProjectList);
  return projectList;
}

function getToken() {
  if (sessionStorage.getItem("token") !== null) {
    let userToken = sessionStorage.getItem("token");
    return userToken;
  }
}

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
    let newProjectList = await majProjectList();
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
