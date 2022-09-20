/*export interface Liqour {
  name: string;
  type?: string;
  suggestions?: string[];
  tags?: string[];
}

export interface Ingredient extends Liqour {
  quantity?: string;
  units?: string;
}

export interface Recipe {
  ingredients: Ingredient[];
  name: string;
  instructions: string;
} */

export const liquors = [
  { id: 0, name: 'Bourbon', type: 'Whiskey' },
  { id: 1, name: 'Rye Whiskey', type: 'Whiskey' },
  { id: 2, name: 'Tennessee Whiskey', type: 'Whiskey' },
  { id: 3, name: 'Scotch', type: 'Whiskey' },
  { id: 4, name: 'Gin' },
  { id: 5, name: 'Vodka' },
  { id: 6, name: 'Sweet Vermouth' },
  { id: 7, name: 'Dry Vermouth' },
  { id: 8, name: 'Amaro Montenegro' },
  { id: 9, name: 'Amaro Nonnino' },
  { id: 10, name: 'Aperol' },
  { id: 11, name: 'Campari' },
  { id: 12, name: 'White Rum' },
  { id: 13, name: 'Dark Rum' },
  { id: 14, name: 'Coconut Rum' },
  { id: 15, name: 'Creme de Violette' },
  { id: 16, name: 'Creme de Cacao' },
  { id: 17, name: 'Cointreau' },
  { id: 18, name: 'Orange Curacao' },
  { id: 19, name: 'Tequila Blanco' },
  { id: 20, name: 'Mezcal' },
  { id: 21, name: 'Green Chartreuse' },
  { id: 22, name: 'Yellow Chartreuse' },
  { id: 23, name: 'Luxardo' },
  { id: 24, name: 'Kahlua' },
];

const bourbonId = liquors.find((liqour) => liquor.name === 'Bourbon').id;

const bourbonRecipes = recipes.filter((recipe) => recipe.ingredients.includes(bourbonId));
export const recipes = [
  { id: 0, name: 'Old Fashioned', ingredients: [0], instructions: 'sample text' },
  {
    id: 1,
    name: 'Manhattan',
    ingredients: [0, { name: 'Sweet Vermouth' }],
    instructions: 'sample text',
  },
  { id: 2, name: 'Martini', ingredients: [{ name: 'Gin' }, { name: 'Dry Vermouth' }], instructions: 'sample text' },
  {
    id: 3,
    name: 'Bees Knees',
    ingredients: [{ name: 'Gin' }, { name: 'Lemon Juice' }, { name: 'Honey' }],
    instructions: 'sample text',
  },
  {
    id: 4,
    name: 'Aviation',
    ingredients: [{ name: 'Gin' }, { name: 'Luxardo' }, { name: 'Lemon Juice' }, { name: 'Creme de Violette' }],
    instructions: 'sample text',
  },
  {
    id: 5,
    name: 'Paper Plane',
    ingredients: [{ name: 'bourbon' }, { name: 'lemon juice' }, { name: 'Amaro Montenegro' }, { name: 'Aperol' }],
    instructions: 'sample text',
  },
  {
    id: 6,
    name: 'Classic Margarita',
    ingredients: [{ name: 'Tequila Blanco' }, { name: 'Cointreau' }, { name: 'lime juice' }],
    instructions: 'sample text',
  },
  {
    id: 7,
    name: 'Negroni',
    ingredients: [{ name: 'Gin' }, { name: 'Campari' }, { name: 'Sweet Vermouth' }],
    instructions: 'sample text',
  },
  {
    id: 8,
    name: 'Espresso Martini',
    ingredients: [{ name: 'Vodka' }, { name: 'espresso' }, { name: 'kahlua' }],
    instructions: 'sample text',
  },
];
