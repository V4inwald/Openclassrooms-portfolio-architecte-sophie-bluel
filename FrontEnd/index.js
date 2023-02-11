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
      ".gallery"
    ).innerHTML += `<figure class=category-${category}>
          <img src=${src} alt="${titleProject}}">
          <figcaption>${titleProject}</figcaption>
      </figure>`;
  }
}

//genere le filtres depuis la liste des categories
function genererFiltres(filtersToGenerate) {
  const filterContainer = document.querySelector(".project-filters");

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

const filterButtons = document.querySelectorAll(".filter-button");

//Réponds au click sur un boutton des filtres
for (let button in filterButtons) {
  filterButtons[button].addEventListener("click", () => {
    //crée une variable category depuis l'id du bouton (0 represente le bouton Tous)
    let category = 0;
    //Compare le bouton cliqué avec la classe du bouton qui indique la catégorie
    for (let i in projectCategories + 1) {
      if (
        filterButtons[button] == document.getElementById(`category-${i}-button`)
      ) {
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
    document.querySelector(".gallery").innerHTML = "";
    genererProjets(filteredProjects);
  });
}
