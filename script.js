document.addEventListener('DOMContentLoaded', () => {
    const ingredientInput = document.getElementById('ingredient-input');
    const addIngredientBtn = document.getElementById('add-ingredient');
    const selectedIngredients = document.getElementById('selected-ingredients');
    const searchRecipesBtn = document.getElementById('search-recipes');
    const recipeResults = document.getElementById('recipe-results');
  
    const ingredients = new Set();
    const API_KEY = '0c0fb6eba7694c75808644ce963553ed'; // Replace with your API key
  
    addIngredientBtn.addEventListener('click', () => {
      const ingredient = ingredientInput.value.trim().toLowerCase();
      if (ingredient && !ingredients.has(ingredient)) {
        ingredients.add(ingredient);
        updateIngredientList();
        ingredientInput.value = '';
      }
    });
  
    function updateIngredientList() {
      selectedIngredients.innerHTML = '';
      const ol = document.createElement('ol');
      ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient;
  
        const removeIcon = document.createElement('i');
        removeIcon.className = 'fa-solid fa-trash';
        removeIcon.style.color = '#7F2121';
        removeIcon.style.marginLeft = '10px';
        removeIcon.style.cursor = 'pointer';
        removeIcon.addEventListener('click', () => {
          ingredients.delete(ingredient);
          updateIngredientList();
        });
  
        li.appendChild(removeIcon);
        ol.appendChild(li);
      });
      selectedIngredients.appendChild(ol);
    }
  
    searchRecipesBtn.addEventListener('click', async () => {
      const recipes = await searchRecipes(Array.from(ingredients));
      displayRecipes(recipes);
    });
  
    async function searchRecipes(ingredients) {
      if (ingredients.length === 0) return [];
      try {
        const response = await fetch(
          `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients.join(',')}&apiKey=${API_KEY}`
        );
        if (!response.ok) throw new Error('Failed to fetch recipes');
        return await response.json();
      } catch (error) {
        console.error('Error:', error);
        recipeResults.textContent = 'Unable to fetch recipes at the moment.';
        return [];
      }
    }
  
    function displayRecipes(recipes) {
      recipeResults.innerHTML = '';
      if (recipes.length === 0) {
        recipeResults.textContent = 'No recipes found with the selected ingredients.';
      } else {
        const ol = document.createElement('ol');
        recipes.forEach(recipe => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.textContent = recipe.title;
          a.href = `#`;
          a.addEventListener('click', (e) => {
            e.preventDefault();
            displayRecipeDetails(recipe);
          });
          li.appendChild(a);
          ol.appendChild(li);
        });
        recipeResults.appendChild(ol);
      }
    }
  
    function displayRecipeDetails(recipe) {
        const recipeDetailsHtml = `
          <h2>${recipe.title}</h2>
          <img src="${recipe.image}" alt="${recipe.title}" style="width: 300px;">
          <button id="view-full-recipe" data-id="${recipe.id}">View Full Recipe</button>
        `;
        recipeResults.innerHTML = recipeDetailsHtml;
      
        const viewFullRecipeBtn = document.getElementById('view-full-recipe');
        viewFullRecipeBtn.addEventListener('click', async () => {
          const recipeInfo = await fetchRecipeDetails(recipe.id);
          showFullRecipe(recipeInfo);
        });
      }
      
      async function fetchRecipeDetails(recipeId) {
        try {
          const response = await fetch(
            `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`
          );
          if (!response.ok) throw new Error('Failed to fetch recipe details');
          return await response.json();
        } catch (error) {
          console.error('Error fetching recipe details:', error);
          recipeResults.textContent = 'Unable to fetch full recipe details at the moment.';
          return null;
        }
      }
      
      function showFullRecipe(recipeInfo) {
        if (!recipeInfo) return;
        const recipeHtml = `
          <h2>${recipeInfo.title}</h2>
          <img src="${recipeInfo.image}" alt="${recipeInfo.title}" style="width: 300px;">
          <h3>Ingredients:</h3>
          <ul>
            ${recipeInfo.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}
          </ul>
          <h3>Instructions:</h3>
          <p>${recipeInfo.instructions || 'No instructions available.'}</p>
        `;
        recipeResults.innerHTML = recipeHtml;
      }
     });
  