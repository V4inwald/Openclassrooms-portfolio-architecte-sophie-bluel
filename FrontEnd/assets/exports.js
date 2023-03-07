export const urlApi = "http://localhost:5678";

//affiche un message d'erreur
// errorLocation est la classe ou se trouve le message
// timeToShow est un temps en milisecondes (ex:5000 = 5s)
export function showErrorMessage(errorLocation, timeToShow) {
  const errorMessageLocation = document.querySelector(`.${errorLocation}`);
  errorMessageLocation.style.visibility = "visible";
  errorMessageLocation.style.zIndex = "1";
  errorMessageLocation.style.animation = "appear 0.2s";
  window.setTimeout(() => {
    errorMessageLocation.style.animation = "disappear 0.5s";
    window.setTimeout(() => {
      errorMessageLocation.style.visibility = "hidden";
      errorMessageLocation.style.zIndex = "-1";
    }, 500);
  }, timeToShow);
}

// Genère dynamiquement les projets
export function generateProjects(projectsToGenerate) {
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
export function generateFilters(filtersToGenerate) {
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

//---------------------------------Fenetre modale----------------------------

// Fonction qui crée le contenu de add works container
export function generateModalAddWorks(projectCategories) {
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
        //affiche le message d'erreur (4s) si image trop lourde
        showErrorMessage("error-box-to-big", 4000);

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
export function generateModalGallery(projectList) {
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
export function deleteWork(projectId) {
  fetch(`${urlApi}/api/works/${projectId}`, {
    method: "DELETE",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  })
    .then((response) => {
      if (response.ok) {
        //mets a jour la liste des projets
        localStorage.removeItem("projectListStored");
        window.dispatchEvent(new Event("storage"));
      } else if (response.status == 401) {
        /*si non autorisé supprime le token 
          puis affiche un message d'erreur*/
        window.sessionStorage.removeItem("token");
        showErrorMessage("connection-error-message", 8000);
      }
    })
    .catch(() => console.log("erreur"));
}

// ajoute un nouveau projet
export async function addNewProject() {
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
    fetch(`${urlApi}/api/works`, {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: dataForm,
    })
      .then((response) => {
        if (response.ok) {
          //mets a jour la liste des projets
          localStorage.removeItem("projectListStored");
          window.dispatchEvent(new Event("storage"));
        } else if (response.status == 401) {
          /*si non autorisé supprime le token 
            puis affiche un message d'erreur*/
          window.sessionStorage.removeItem("token");
          showErrorMessage("connection-error-message", 8000);
        }
      })
      .then(() => {
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
export async function majProjectList(projectList) {
  const response = await fetch(`${urlApi}/api/works`);
  projectList = await response.json();
  const stringProjectList = JSON.stringify(projectList);
  window.localStorage.setItem("projectListStored", stringProjectList);
  return projectList;
}

//récupère le token du session storage
export function getToken() {
  if (sessionStorage.getItem("token") !== null) {
    let userToken = sessionStorage.getItem("token");
    return userToken;
  }
}
