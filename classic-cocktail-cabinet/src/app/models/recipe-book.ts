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
  { name: 'Amaro Nonino', type: LiqourType.AMARO, tags: ['bitter', 'warm', 'herbal', 'caramel', 'orange'] },
  { name: 'Aperol', type: LiqourType.AMARO, tags: ['bitter', 'citrus', 'bright', 'orange', 'rhubarb'] },
  { name: 'Campari', type: LiqourType.AMARO, tags: ['bitter', 'warm', 'bright', 'orange', 'herbal'] },
  { name: 'Luxardo Maraschino', type: LiqourType.LIQUEUR, tags: ['sweet', 'cherry', 'bright', 'fruity', 'complex'] },
  {
    name: 'Green Chartreuse',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'hot', 'herbal', 'complex', 'botanical'],
  },
  {
    name: 'Cointreau',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'citrus', 'orange', 'bright', 'zesty'],
  },
  {
    name: 'Grand Marnier',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'citrus', 'orange', 'smooth', 'complex'],
  },
  {
    name: 'Triple Sec',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'citrus', 'orange', 'bright'],
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
    tags: ['neutral', 'clean', 'smooth', 'crisp'],
  },
  {
    name: 'Rum',
    type: LiqourType.SPIRIT,
    tags: ['sweet', 'dark', 'caramel', 'warm', 'tropical'],
  },
  {
    name: 'Tequila',
    type: LiqourType.SPIRIT,
    tags: ['herbal', 'spicy', 'earthy', 'vegetal', 'citrus'],
  },
  {
    name: 'Mezcal',
    type: LiqourType.SPIRIT,
    tags: ['smoky', 'herbal', 'earthy', 'complex', 'warm'],
  },
  {
    name: 'Bourbon',
    type: LiqourType.WHISKEY,
    tags: ['sweet', 'warm', 'vanilla', 'caramel', 'oak'],
  },
  {
    name: 'Rye Whiskey',
    type: LiqourType.WHISKEY,
    tags: ['spicy', 'warm', 'dry', 'peppery', 'oak'],
  },
  {
    name: 'Scotch Whisky',
    type: LiqourType.WHISKEY,
    tags: ['smoky', 'warm', 'peaty', 'salty', 'complex', 'rich', 'malty', 'oak', 'spicy'],
  },
  {
    name: 'Irish Whiskey',
    type: LiqourType.WHISKEY,
    tags: ['smooth', 'warm', 'malty', 'light', 'fruity'],
  },
  {
    name: 'Brandy',
    type: LiqourType.SPIRIT,
    tags: ['sweet', 'warm', 'fruity', 'oak', 'rich'],
  },
  {
    name: 'Cognac',
    type: LiqourType.SPIRIT,
    tags: ['sweet', 'warm', 'oak', 'fruity', 'vanilla', 'complex'],
  },
  {
    name: 'Pisco',
    type: LiqourType.SPIRIT,
    tags: ['fruity', 'herbal', 'floral', 'citrus', 'grape'],
  },
  {
    name: 'Absinthe',
    type: LiqourType.SPIRIT,
    tags: ['herbal', 'strong', 'anise', 'complex', 'botanical'],
  },
  {
    name: 'Sambuca',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'anise', 'herbal', 'syrupy'],
  },
  {
    name: 'Baileys Irish Cream',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'creamy', 'syrupy', 'vanilla', 'chocolate', 'coffee'],
  },
  {
    name: 'Kahlua',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'coffee', 'vanilla', 'chocolate', 'rum', 'syrupy'],
  },
  {
    name: 'Frangelico',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'nutty', 'herbal', 'hazelnut', 'vanilla'],
  },
  {
    name: 'Amaretto',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'nutty', 'herbal', 'almond', 'cherry'],
  },
  {
    name: 'Sloe Gin',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'fruity', 'berry', 'tart', 'plum'],
  },
  {
    name: 'Peach Schnapps',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'fruity', 'peach', 'tropical', 'syrupy'],
  },
  {
    name: 'Blue Curacao',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'citrus', 'orange', 'tropical', 'bright', 'zesty'],
  },
  {
    name: 'Midori',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'melon', 'green', 'creamy', 'tropical', 'fruity'],
  },
  {
    name: 'Chambord',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'berry', 'raspberry', 'rich', 'fruity'],
  },
  {
    name: 'Drambuie',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'honey', 'herbal', 'spicy', 'whisky'],
  },
  {
    name: 'Galliano',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'vanilla', 'anise', 'herbal', 'citrus'],
  },
  {
    name: 'Benedictine',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'herbal', 'spicy', 'honey', 'complex'],
  },
  {
    name: 'Chartreuse',
    type: LiqourType.LIQUEUR,
    tags: ['herbal', 'strong', 'complex', 'botanical', 'aromatic'],
  },
  {
    name: 'St. Germain',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'floral', 'fruity', 'elderflower', 'bright'],
  },
  {
    name: 'Creme de Cassis',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'berry', 'blackcurrant', 'rich', 'jammy'],
  },
  {
    name: 'Creme de Menthe',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'minty', 'cool', 'refreshing', 'bright'],
  },
  {
    name: 'Creme de Cacao',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'chocolate', 'vanilla', 'cocoa', 'creamy'],
  },
  {
    name: 'Maraschino Liqueur',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'cherry', 'fruity', 'almond', 'complex'],
  },
  {
    name: 'Pernod',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'anise', 'herbal', 'licorice', 'botanical'],
  },
  {
    name: 'Anisette',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'anise', 'licorice', 'herbal', 'spicy'],
  },
  {
    name: 'Ouzo',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'anise', 'licorice', 'herbal', 'strong'],
  },
  {
    name: 'Falernum',
    type: LiqourType.LIQUEUR,
    tags: ['sweet', 'spicy', 'lime', 'ginger', 'almond', 'clove'],
  },
  {
    name: "Pimm's No. 1",
    type: LiqourType.LIQUEUR,
    tags: ['herbal', 'fruity', 'spiced', 'citrus', 'complex'],
  },
  {
    name: 'Fernet Branca',
    type: LiqourType.AMARO,
    tags: ['bitter', 'herbal', 'minty', 'medicinal', 'peppery'],
  },
  {
    name: 'Averna',
    type: LiqourType.AMARO,
    tags: ['bitter', 'herbal', 'dark', 'caramel', 'citrus'],
  },
  {
    name: 'Cynar',
    type: LiqourType.LIQUEUR,
    tags: ['bitter', 'herbal', 'artichoke', 'vegetal', 'earthy', 'complex'],
  },
  {
    name: 'Suze',
    type: LiqourType.AMARO,
    tags: ['bitter', 'herbal', 'gentian', 'earthy', 'floral'],
  },
];

export const tasteTags = {
  sweet: ['sweet', 'sugary', 'syrupy', 'honey', 'dessert'],
  bitter: ['bitter', 'bitterness', 'not sweet'],
  herbal: ['herbal', 'herbs', 'botanical', 'plant', 'grassy', 'pine'],
  citrus: ['citrus', 'lemon', 'lime', 'orange', 'grapefruit', 'zesty'],
  smoky: ['smoky', 'smoke', 'campfire', 'burnt', 'charred'],
  spicy: ['spicy', 'spice', 'hot', 'peppery', 'cinnamon', 'clove', 'pepper'],
  fruity: ['fruity', 'fruit', 'berry', 'apple', 'pear', 'tropical'],
  floral: ['floral', 'flower', 'rose', 'lavender', 'jasmine'],
  creamy: ['creamy', 'cream', 'milk', 'dairy', 'smooth'],
  nutty: ['nutty', 'nut', 'almond', 'hazelnut', 'walnut'],
  chocolate: ['chocolate', 'cocoa', 'cacao'],
  coffee: ['coffee', 'espresso', 'mocha'],
  vanilla: ['vanilla', 'vanillin'],
  anise: ['anise', 'licorice', 'star anise'],
  minty: ['mint', 'minty', 'peppermint', 'spearmint'],
  warm: ['warm', 'warming', 'cozy', 'comforting', 'hot'],
  dry: ['dry', 'not sweet', 'crisp', 'brut'],
  rich: ['rich', 'full-bodied', 'robust', 'deep'],
  complex: ['complex', 'layered', 'sophisticated', 'nuanced'],
  smooth: ['smooth', 'mellow', 'soft', 'gentle', 'mild'],
};
