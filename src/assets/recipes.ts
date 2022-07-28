export interface Liqour {
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
}

export const liquors = [
  { name: 'Bourbon', type: 'Whiskey' },
  { name: 'Rye Whiskey', type: 'Whiskey' },
  { name: 'Tennessee Whiskey', type: 'Whiskey' },
  { name: 'Scotch', type: 'Whiskey' },
  { name: 'Gin' },
  { name: 'Vodka' },
  { name: 'Sweet Vermouth' },
  { name: 'Dry Vermouth' },
  { name: 'Amaro Montenegro' },
  { name: 'Amaro Nonnino' },
  { name: 'Aperol' },
  { name: 'Campari' },
  { name: 'White Rum' },
  { name: 'Dark Rum' },
  { name: 'Coconut Rum' },
  { name: 'Creme de Violette' },
  { name: 'Creme de Cacao' },
  { name: 'Cointreau' },
  { name: 'Orange Curacao' },
  { name: 'Tequila Blanco' },
  { name: 'Mezcal' },
  { name: 'Green Chartreuse' },
  { name: 'Yellow Chartreuse' },
  { name: 'Luxardo' },
  { name: 'Kahlua' },
];

export const recipes: Recipe[] = [
  { name: 'Old Fashioned', ingredients: [{ name: 'Bourbon' }], instructions: 'sample text' },
  { name: 'Manhattan', ingredients: [{ name: 'Bourbon' }, { name: 'Sweet Vermouth' }], instructions: 'sample text' },
  { name: 'Martini', ingredients: [{ name: 'Gin' }, { name: 'Dry Vermouth' }], instructions: 'sample text' },
  {
    name: 'Bees Knees',
    ingredients: [{ name: 'Gin' }, { name: 'Lemon Juice' }, { name: 'Honey' }],
    instructions: 'sample text',
  },
  {
    name: 'Aviation',
    ingredients: [{ name: 'Gin' }, { name: 'Luxardo' }, { name: 'Lemon Juice' }, { name: 'Creme de Violette' }],
    instructions: 'sample text',
  },
  {
    name: 'Paper Plane',
    ingredients: [{ name: 'bourbon' }, { name: 'lemon juice' }, { name: 'Amaro Montenegro' }, { name: 'Aperol' }],
    instructions: 'sample text',
  },
  {
    name: 'Classic Margarita',
    ingredients: [{ name: 'Tequila Blanco' }, { name: 'Cointreau' }, { name: 'lime juice' }],
    instructions: 'sample text',
  },
  {
    name: 'Negroni',
    ingredients: [{ name: 'Gin' }, { name: 'Campari' }, { name: 'Sweet Vermouth' }],
    instructions: 'sample text',
  },
  {
    name: 'Espresso Martini',
    ingredients: [{ name: 'Vodka' }, { name: 'espresso' }, { name: 'kahlua' }],
    instructions: 'sample text',
  },
];
