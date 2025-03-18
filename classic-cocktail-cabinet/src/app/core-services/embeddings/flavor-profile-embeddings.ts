import { Embeddings } from '@langchain/core/embeddings';

export class FlavorProfileEmbeddings extends Embeddings {
  // Expanded flavor dimensions to match your liquor tags
  //   private flavorDimensions = [
  //     'sweet',
  //     'sour',
  //     'bitter',
  //     'salty',
  //     'umami',
  //     'citrus',
  //     'stone fruit',
  //     'tropical fruit',
  //     'red berry',
  //     'black berry',
  //     'dried fruit',
  //     'apple/pear',
  //     'melon',
  //     'grape',
  //     'rose',
  //     'violet',
  //     'jasmine',
  //     'lavender',
  //     'orange blossom',
  //     'honeysuckle',
  //     'black pepper',
  //     'white pepper',
  //     'cinnamon',
  //     'nutmeg',
  //     'clove',
  //     'cardamom',
  //     'star anise',
  //     'licorice',
  //     'ginger',
  //     'saffron',
  //     'coriander',
  //     'basil',
  //     'mint',
  //     'thyme',
  //     'oregano',
  //     'rosemary',
  //     'dill',
  //     'eucalyptus',
  //     'mushroom',
  //     'truffle',
  //     'forest floor',
  //     'wet leaves',
  //     'fresh cut grass',
  //     'hay',
  //     'olive',
  //     'tobacco',
  //     'leather',
  //     'almond',
  //     'hazelnut',
  //     'walnut',
  //     'pecan',
  //     'peanut',
  //     'roasted coffee',
  //     'dark chocolate',
  //     'milk chocolate',
  //     'caramelized sugar',
  //     'toffee',
  //     'butterscotch',
  //     'butter',
  //     'cream',
  //     'yogurt',
  //     'cheese',
  //     'vanilla',
  //     'oak',
  //     'toasted oak',
  //     'smoke',
  //     'cedar',
  //     'sandalwood',
  //     'charred wood',
  //     'bourbon barrel',
  //     'bread dough',
  //     'brioche',
  //     'sourdough',
  //     'beer-like yeast',
  //     'vinegar',
  //     'chalky',
  //     'slate',
  //     'flint',
  //     'saline',
  //     'iron',
  //     'copper',
  //     'oily',
  //     'velvety',
  //     'creamy',
  //     'astringent',
  //     'tannic',
  //     'drying',
  //     'effervescent',
  //     'silky',
  //     'spicy heat',
  //     'honey',
  //     'maple syrup',
  //     'smoke',
  //     'briny',
  //     'savory',
  //     'marzipan',
  //     'popcorn',
  //     'soy sauce',
  //     'green bell pepper',
  //     'coconut',
  //   ];
  flavorDimensions: string[] = [
    'smoky',
    'warm',
    'oak',
    'complex',
    'caramel',
    'vanilla',
    'spice',
    'sweet',
    'butterscotch',
    'spicy',
    'dry',
    'pepper',
    'herbal',
    'peaty',
    'malty',
    'saline',
    'dried fruit',
    'smooth',
    'light',
    'honey',
    'floral',
    'fruit',
    'juniper',
    'botanical',
    'citrus',
    'neutral',
    'clean',
    'mineral',
    'rich',
    'molasses',
    'caramelized sugar',
    'earthy',
    'briny',
    'vegetal',
    'nutty',
    'strong',
    'anise',
    'bitter',
    'aromatic',
    'hot',
    'orange',
    'berry',
    'syrupy',
    'minty',
    'chocolate',
    'creamy',
    'cherry',
    'bright',
    'artichoke',
    'dark',
  ];

  // Enhanced map of terms to their flavor profile scores
  flavorProfiles: Record<string, Record<string, number>> = {
    // Spirits
    whiskey: { smoky: 0.6, warm: 0.7, oak: 0.6, complex: 0.5, caramel: 0.5, vanilla: 0.4, spice: 0.4 },
    bourbon: { sweet: 0.7, warm: 0.8, oak: 0.7, vanilla: 0.6, caramel: 0.6, spice: 0.5, butterscotch: 0.4 },
    'rye whiskey': { spicy: 0.8, warm: 0.7, dry: 0.5, pepper: 0.6, herbal: 0.5, oak: 0.4 },
    scotch: { smoky: 0.8, peaty: 0.7, complex: 0.8, malty: 0.6, oak: 0.5, saline: 0.4, 'dried fruit': 0.4 },
    'irish whiskey': { smooth: 0.8, warm: 0.6, light: 0.5, honey: 0.5, floral: 0.4, fruit: 0.4 },
    gin: { herbal: 0.8, juniper: 0.9, botanical: 0.8, dry: 0.7, citrus: 0.6, floral: 0.5, spice: 0.4 },
    vodka: { neutral: 0.9, smooth: 0.7, light: 0.8, clean: 0.6, mineral: 0.5 },
    rum: { sweet: 0.7, warm: 0.6, rich: 0.5, molasses: 0.7, 'caramelized sugar': 0.6, spice: 0.5, vanilla: 0.4 },
    tequila: { herbal: 0.6, spicy: 0.7, earthy: 0.5, citrus: 0.5, pepper: 0.5, briny: 0.4 },
    mezcal: { smoky: 0.9, herbal: 0.6, earthy: 0.7, vegetal: 0.5, pepper: 0.5, citrus: 0.4 },
    brandy: { sweet: 0.6, warm: 0.7, fruity: 0.5, 'dried fruit': 0.6, caramel: 0.5, vanilla: 0.4, nutty: 0.4 },
    cognac: { sweet: 0.6, warm: 0.7, rich: 0.8, complex: 0.7, 'dried fruit': 0.6, floral: 0.5, spice: 0.5 },
    pisco: { fruity: 0.8, herbal: 0.5, floral: 0.6, citrus: 0.5, light: 0.4, smooth: 0.4 },
    absinthe: { herbal: 0.9, strong: 0.9, anise: 0.8, bitter: 0.6, spice: 0.5, citrus: 0.4 },

    // Vermouth
    'dry vermouth': { dry: 0.8, herbal: 0.7, aromatic: 0.7, floral: 0.5, bitter: 0.4, light: 0.6, citrus: 0.5 },
    'sweet vermouth': {
      sweet: 0.7,
      herbal: 0.6,
      aromatic: 0.7,
      rich: 0.6,
      complex: 0.6,
      spicy: 0.5,
      'dried fruit': 0.4,
    },

    // Liqueurs
    'green chartreuse': { herbal: 0.9, hot: 0.7, sweet: 0.5, complex: 0.8, spice: 0.6, earthy: 0.5 },
    'grand marnier': { sweet: 0.7, citrus: 0.8, orange: 0.9, smooth: 0.7, complex: 0.6, spice: 0.5 },
    'triple sec': { sweet: 0.7, citrus: 0.9, orange: 0.8, floral: 0.5, light: 0.4 },
    'sloe gin': { sweet: 0.7, fruity: 0.8, berry: 0.7, spice: 0.4 },
    'blue curacao': { sweet: 0.8, citrus: 0.7, orange: 0.7, floral: 0.5 },
    'creme de cassis': { sweet: 0.9, berry: 0.9, rich: 0.5, syrupy: 0.5 },
    'creme de menthe': { sweet: 0.7, minty: 0.9, herbal: 0.5 },
    'creme de cacao': { sweet: 0.8, chocolate: 0.9, vanilla: 0.5, creamy: 0.5 },
    maraschino: { sweet: 0.8, cherry: 0.9, floral: 0.5 },

    // Amari
    campari: { bitter: 0.9, herbal: 0.6, bright: 0.6, citrus: 0.5 },
    aperol: { bitter: 0.7, citrus: 0.6, bright: 0.7, sweet: 0.5 },
    fernet: { bitter: 0.9, herbal: 0.8, minty: 0.6, spice: 0.5 },
    cynar: { bitter: 0.8, herbal: 0.7, vegetal: 0.8, artichoke: 0.9, earthy: 0.7 },
    averna: { bitter: 0.7, herbal: 0.6, dark: 0.7, caramel: 0.5 },
    montenegro: { bitter: 0.6, herbal: 0.7, citrus: 0.5, floral: 0.5, spice: 0.5 },
    nonino: { bitter: 0.6, warm: 0.7, herbal: 0.6, complex: 0.7, 'dried fruit': 0.5 },
  };

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return documents.map((doc) => this.createFlavorEmbedding(doc));
  }

  async embedQuery(text: string): Promise<number[]> {
    return this.createFlavorEmbedding(text);
  }

  private createFlavorEmbedding(text: string): number[] {
    const lowerText = text.toLowerCase();
    const embedding = Array(this.flavorDimensions.length).fill(0);

    // Check for direct flavor mentions
    this.flavorDimensions.forEach((flavor, index) => {
      if (lowerText.includes(flavor)) {
        embedding[index] =
          lowerText.includes(`not ${flavor}`) || lowerText.includes(`don't like ${flavor}`) ? -0.7 : 0.8;
      }
    });

    // Add flavor profiles from known terms
    Object.keys(this.flavorProfiles).forEach((term) => {
      if (lowerText.includes(term)) {
        const profile = this.flavorProfiles[term];
        this.flavorDimensions.forEach((flavor, index) => {
          if (profile[flavor]) {
            embedding[index] += profile[flavor];
          }
        });
      }
    });

    // Check for liquor types
    const liquorTypes = ['whiskey', 'spirit', 'liqueur', 'amaro', 'bitters'];
    liquorTypes.forEach((type) => {
      if (lowerText.includes(type)) {
        // Boost dimensions commonly associated with this type
        switch (type) {
          case 'whiskey':
            this.boostDimensions(embedding, ['warm', 'oak', 'smoky'], 0.4);
            break;
          case 'spirit':
            this.boostDimensions(embedding, ['strong', 'smooth'], 0.3);
            break;
          case 'liqueur':
            this.boostDimensions(embedding, ['sweet', 'syrupy'], 0.4);
            break;
          case 'amaro':
            this.boostDimensions(embedding, ['bitter', 'herbal', 'complex'], 0.4);
            break;
          case 'bitters':
            this.boostDimensions(embedding, ['bitter', 'aromatic', 'strong'], 0.5);
            break;
        }
      }
    });

    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return embedding.map((val) => val / magnitude);
    }

    return embedding;
  }

  private boostDimensions(embedding: number[], dimensions: string[], factor: number): void {
    dimensions.forEach((dim) => {
      const index = this.flavorDimensions.indexOf(dim);
      if (index >= 0) {
        embedding[index] += factor;
      }
    });
  }
}
