export interface Recipe {
  name: string;
  ingredients: RecipeIngredient[];
  instructions: string;
  variants?: string[];
  similar?: string[];
  tags: string[];
}

export interface RecipeIngredient {
  liqour: Liqour;
  amount: number;
  unit: string;
}

export interface Liqour {
  name: string;
  brand?: string;
  type: LiqourType;
  tags: string[];
}
export interface Garnish {
  name: string;
  tags: string[];
}

export enum LiqourType {
  AMARO = 'AMARO',
  WHISKEY = 'WHISKEY',
  SPIRIT = 'SPIRIT',
  LIQUEUR = 'LIQUEUR',
  BITTERS = 'BITTERS',
}

export const recipeBook: Recipe[] = [];
export const liquors: Liqour[] = [
  {
    name: 'Amaro Montenegro',
    type: LiqourType.AMARO,
    tags: ['bitter', 'dark', 'herbal'],
  },
  { name: 'Amaro Nonino', type: LiqourType.AMARO, tags: ['bitter', 'warm', 'herbal'] },
  { name: 'Aperol', type: LiqourType.AMARO, tags: ['bitter', 'citrus', 'bright'] },
  { name: 'Campari', type: LiqourType.AMARO, tags: ['bitter', 'warm', 'bright'] },
  { name: 'Luxardo Maraschino', type: LiqourType.LIQUEUR, tags: ['sweet'] },
  { name: 'Amaro Averna', type: LiqourType.AMARO, tags: ['bitter', 'dark', 'herbal'] },
  {
    name: 'Green Chartreuse',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'hot', 'herbal'],
  },
  {
    name: 'Cointreau',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'citrus'],
  },
  {
    name: 'Grand Marnier',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'citrus', 'orange', 'smooth', 'complex'],
  },
  {
    name: 'Triple Sec',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'citrus'],
  },
  {
    name: 'Dry Vermouth',
    type: LiqourType.SPIRIT,
    tags: ['dry', 'herbal', 'aromatic', 'floral', 'bitter', 'light'],
  },
  {
    name: 'Sweet Vermouth',
    type: LiqourType.SPIRIT,
    tags: ['sweet', 'herbal', 'aromatic', 'rich', 'complex', 'spiced'],
  },
  {
    name: 'Gin',
    type: LiqourType.SPIRIT,
    tags: ['dry', 'herbal', 'juniper', 'botanical', 'aromatic', 'citrus'],
  },
  {
    name: 'Vodka',
    type: LiqourType.SPIRIT,
    tags: ['neutral'],
  },
  {
    name: 'Rum',
    type: LiqourType.SPIRIT,
    tags: ['sweet', 'dark'],
  },
  {
    name: 'Tequila',
    type: LiqourType.SPIRIT,
    tags: ['herbal', 'spicy'],
  },
  {
    name: 'Mezcal',
    type: LiqourType.SPIRIT,
    tags: ['smoky', 'herbal'],
  },
  {
    name: 'Bourbon',
    type: LiqourType.WHISKEY,
    tags: ['sweet', 'warm'],
  },
  {
    name: 'Rye Whiskey',
    type: LiqourType.WHISKEY,
    tags: ['spicy', 'warm'],
  },
  {
    name: 'Scotch Whisky',
    type: LiqourType.WHISKEY,
    tags: ['smoky', 'warm', 'peaty', 'salty', 'complex', 'rich', 'malty', 'oak', 'spicy'],
  },
  {
    name: 'Irish Whiskey',
    type: LiqourType.WHISKEY,
    tags: ['smooth', 'warm'],
  },
  {
    name: 'Brandy',
    type: LiqourType.SPIRIT,
    tags: ['sweet', 'warm'],
  },
  {
    name: 'Cognac',
    type: LiqourType.SPIRIT,
    tags: ['sweet', 'warm'],
  },
  {
    name: 'Pisco',
    type: LiqourType.SPIRIT,
    tags: ['fruity', 'herbal'],
  },
  {
    name: 'Absinthe',
    type: LiqourType.SPIRIT,
    tags: ['herbal', 'strong'],
  },
  {
    name: 'Sambuca',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'anise'],
  },
  {
    name: 'Baileys Irish Cream',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'creamy', 'syrupy', 'vanilla'],
  },
  {
    name: 'Kahlua',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'coffee', 'vanilla', 'chocolate', 'rum', 'syrupy'],
  },
  {
    name: 'Frangelico',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'nutty', 'herbal'],
  },
  {
    name: 'Amaretto',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'nutty', 'herbal'],
  },
  {
    name: 'Sloe Gin',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'fruity'],
  },
  {
    name: 'Peach Schnapps',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'fruity'],
  },
  {
    name: 'Blue Curacao',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'citrus'],
  },
  {
    name: 'Midori',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'melon'],
  },
  {
    name: 'Chambord',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'berry'],
  },
  {
    name: 'Drambuie',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'honey'],
  },
  {
    name: 'Galliano',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'vanilla'],
  },
  {
    name: 'Benedictine',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'herbal'],
  },
  {
    name: 'Chartreuse',
    type: LiqourType.LIQUEUR,
    tags: ['herbal', 'strong'],
  },
  {
    name: 'St. Germain',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'floral'],
  },
  {
    name: 'Creme de Cassis',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'berry'],
  },
  {
    name: 'Creme de Menthe',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'minty'],
  },
  {
    name: 'Creme de Cacao',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'chocolate'],
  },
  {
    name: 'Maraschino Liqueur',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'cherry'],
  },
  {
    name: 'Pernod',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'anise'],
  },
  {
    name: 'Anisette',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'anise'],
  },
  {
    name: 'Ouzo',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'anise'],
  },
  {
    name: 'Falernum',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'spicy'],
  },
  {
    name: "Pimm's No. 1",
    type: LiqourType.LIQUEUR,
    tags: ['herbal', 'fruity'],
  },
  {
    name: 'Aperol',
    type: LiqourType.LIQUEUR,
    tags: ['bitter', 'citrus'],
  },
  {
    name: 'Campari',
    type: LiqourType.LIQUEUR,
    tags: ['bitter', 'herbal'],
  },
  {
    name: 'Fernet Branca',
    type: LiqourType.AMARO,
    tags: ['bitter', 'herbal'],
  },
  {
    name: 'Averna',
    type: LiqourType.AMARO,
    tags: ['bitter', 'herbal', 'dark'],
  },
  {
    name: 'Cynar',
    type: LiqourType.LIQUEUR,
    tags: ['bitter', 'herbal', 'artichoke', 'vegetal', 'earthy'],
  },
  {
    name: 'Suze',
    type: LiqourType.LIQUEUR,
    tags: ['bitter', 'herbal'],
  },
];
