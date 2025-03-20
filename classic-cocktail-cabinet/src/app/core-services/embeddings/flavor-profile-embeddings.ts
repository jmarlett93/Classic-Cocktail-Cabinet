import { Embeddings } from '@langchain/core/embeddings';

export class FlavorProfileEmbeddings extends Embeddings {
  // Expanded flavor dimensions
  private flavorDimensions = [
    'sweet',
    'smoky',
    'spicy',
    'herbal',
    'fruity',
    'smooth',
    'bitter',
    'dry',
    'strong',
    'warm',
    'citrus',
    'dark',
    'bright',
    'floral',
    'aromatic',
    'complex',
    'rich',
    'light',
    'nutty',
    'creamy',
    'vanilla',
    'chocolate',
    'coffee',
    'anise',
    'minty',
    'peaty',
    'malty',
    'oak',
    'vegetal',
    'earthy',
    'berry',
    'melon',
    'cherry',
    'orange',
    'lemon',
    'lime',
    'grapefruit',
    'juniper',
    'botanical',
    'neutral',
    'syrupy',
    'honey',
    'caramel',
    'toffee',
    'zesty',
    'refreshing',
    'crisp',
    'clean',
    'sharp',
    'tangy',
    'tart',
    'sour',
    'woody',
    'grassy',
    'peppery',
    'cinnamon',
    'clove',
    'ginger',
    'tropical',
    'coconut',
    'pineapple',
    'banana',
    'apple',
    'pear',
    'stone fruit',
    'apricot',
    'peach',
    'plum',
  ];

  // Enhanced semantic relationships between terms
  private semanticRelationships: Record<string, Record<string, number>> = {
    // Citrus family
    citrus: {
      lemon: 0.9,
      lime: 0.9,
      orange: 0.9,
      grapefruit: 0.8,
      zesty: 0.8,
      bright: 0.7,
      tangy: 0.7,
      tart: 0.6,
      refreshing: 0.6,
      crisp: 0.5,
      sour: 0.5,
    },
    lemon: {
      citrus: 0.9,
      lime: 0.8,
      zesty: 0.9,
      bright: 0.8,
      tart: 0.7,
      sour: 0.6,
      refreshing: 0.7,
    },
    lime: {
      citrus: 0.9,
      lemon: 0.8,
      zesty: 0.9,
      bright: 0.8,
      tart: 0.7,
      sour: 0.6,
      refreshing: 0.7,
    },
    orange: {
      citrus: 0.9,
      sweet: 0.6,
      zesty: 0.7,
      bright: 0.7,
      fruity: 0.6,
    },
    grapefruit: {
      citrus: 0.8,
      bitter: 0.6,
      tart: 0.7,
      zesty: 0.7,
      refreshing: 0.6,
    },

    // Bright/refreshing cluster
    bright: {
      refreshing: 0.8,
      crisp: 0.8,
      clean: 0.7,
      light: 0.7,
      citrus: 0.7,
      zesty: 0.8,
    },
    refreshing: {
      bright: 0.8,
      crisp: 0.9,
      clean: 0.8,
      light: 0.8,
      citrus: 0.6,
      zesty: 0.7,
    },
    crisp: {
      refreshing: 0.9,
      clean: 0.8,
      light: 0.7,
      bright: 0.8,
      dry: 0.6,
    },
    zesty: {
      citrus: 0.8,
      lemon: 0.9,
      lime: 0.9,
      bright: 0.8,
      tangy: 0.8,
      refreshing: 0.7,
    },

    // Sweet family
    sweet: {
      honey: 0.8,
      caramel: 0.8,
      vanilla: 0.7,
      syrupy: 0.8,
      toffee: 0.7,
      fruity: 0.6,
      rich: 0.6,
    },
    honey: {
      sweet: 0.8,
      floral: 0.6,
      rich: 0.5,
      smooth: 0.5,
    },
    caramel: {
      sweet: 0.8,
      toffee: 0.9,
      rich: 0.7,
      warm: 0.6,
      smooth: 0.5,
    },
    vanilla: {
      sweet: 0.7,
      creamy: 0.7,
      smooth: 0.6,
      warm: 0.5,
    },

    // Fruity family
    fruity: {
      berry: 0.8,
      tropical: 0.8,
      apple: 0.7,
      pear: 0.7,
      'stone fruit': 0.7,
      cherry: 0.7,
      sweet: 0.6,
      bright: 0.5,
    },
    berry: {
      fruity: 0.8,
      sweet: 0.6,
      tart: 0.5,
      bright: 0.5,
    },
    tropical: {
      fruity: 0.8,
      coconut: 0.8,
      pineapple: 0.9,
      banana: 0.8,
      sweet: 0.6,
      bright: 0.5,
    },

    // Herbal family
    herbal: {
      botanical: 0.9,
      grassy: 0.7,
      vegetal: 0.7,
      earthy: 0.6,
      minty: 0.6,
      juniper: 0.6,
      aromatic: 0.7,
    },
    botanical: {
      herbal: 0.9,
      juniper: 0.8,
      aromatic: 0.8,
      complex: 0.6,
    },
    juniper: {
      botanical: 0.8,
      herbal: 0.6,
      pine: 0.7,
      dry: 0.5,
    },

    // Spicy family
    spicy: {
      peppery: 0.8,
      cinnamon: 0.8,
      clove: 0.8,
      ginger: 0.7,
      warm: 0.7,
      aromatic: 0.6,
    },
    peppery: {
      spicy: 0.8,
      sharp: 0.7,
      warm: 0.6,
    },

    // Smoky family
    smoky: {
      peaty: 0.9,
      woody: 0.7,
      oak: 0.6,
      complex: 0.5,
      warm: 0.5,
    },
    peaty: {
      smoky: 0.9,
      earthy: 0.7,
      complex: 0.6,
    },

    // Rich/complex family
    rich: {
      complex: 0.8,
      deep: 0.8,
      smooth: 0.6,
      sweet: 0.5,
      dark: 0.6,
    },
    complex: {
      rich: 0.8,
      layered: 0.9,
      deep: 0.8,
      aromatic: 0.6,
    },
  };

  // Enhanced map of terms to their flavor profile scores
  private flavorProfiles: Record<string, Record<string, number>> = {
    // Whiskey profiles
    bourbon: {
      sweet: 0.8,
      vanilla: 0.7,
      caramel: 0.8,
      oak: 0.7,
      warm: 0.8,
      smooth: 0.6,
      rich: 0.7,
    },
    scotch: {
      smoky: 0.7,
      peaty: 0.6,
      complex: 0.8,
      warm: 0.7,
      oak: 0.6,
      dry: 0.6,
    },
    rye: {
      spicy: 0.8,
      peppery: 0.7,
      dry: 0.7,
      warm: 0.6,
      complex: 0.6,
    },
    'irish whiskey': {
      smooth: 0.8,
      light: 0.6,
      fruity: 0.5,
      malty: 0.7,
      warm: 0.6,
    },

    // Gin profiles
    gin: {
      juniper: 0.9,
      botanical: 0.9,
      herbal: 0.8,
      citrus: 0.6,
      dry: 0.7,
      crisp: 0.6,
    },
    'london dry gin': {
      juniper: 0.9,
      dry: 0.8,
      botanical: 0.8,
      citrus: 0.5,
      sharp: 0.6,
    },
    'botanical gin': {
      botanical: 0.9,
      herbal: 0.8,
      floral: 0.7,
      complex: 0.7,
      aromatic: 0.8,
    },
    'citrus gin': {
      citrus: 0.9,
      lemon: 0.7,
      orange: 0.7,
      bright: 0.8,
      refreshing: 0.7,
      juniper: 0.6,
    },

    // Rum profiles
    rum: {
      sweet: 0.7,
      caramel: 0.6,
      tropical: 0.6,
      smooth: 0.6,
      warm: 0.5,
    },
    'dark rum': {
      rich: 0.8,
      caramel: 0.8,
      molasses: 0.8,
      sweet: 0.7,
      complex: 0.6,
      warm: 0.6,
    },
    'spiced rum': {
      spicy: 0.8,
      vanilla: 0.7,
      caramel: 0.6,
      cinnamon: 0.7,
      warm: 0.7,
    },
    'white rum': {
      light: 0.8,
      clean: 0.7,
      sweet: 0.5,
      tropical: 0.5,
      smooth: 0.6,
    },

    // Vodka profiles
    vodka: {
      neutral: 0.9,
      clean: 0.8,
      smooth: 0.7,
      crisp: 0.6,
    },
    'flavored vodka': {
      fruity: 0.7,
      sweet: 0.6,
      smooth: 0.6,
      light: 0.6,
    },

    // Tequila profiles
    tequila: {
      earthy: 0.7,
      vegetal: 0.6,
      peppery: 0.5,
      citrus: 0.4,
      smooth: 0.5,
    },
    'reposado tequila': {
      oak: 0.6,
      vanilla: 0.5,
      caramel: 0.5,
      smooth: 0.7,
      earthy: 0.6,
    },
    'añejo tequila': {
      oak: 0.8,
      vanilla: 0.7,
      caramel: 0.7,
      rich: 0.7,
      smooth: 0.8,
      complex: 0.7,
    },

    // Liqueur profiles
    'orange liqueur': {
      orange: 0.9,
      citrus: 0.8,
      sweet: 0.8,
      bright: 0.6,
      zesty: 0.7,
    },
    'coffee liqueur': {
      coffee: 0.9,
      sweet: 0.7,
      rich: 0.7,
      dark: 0.8,
    },
    'herbal liqueur': {
      herbal: 0.9,
      botanical: 0.8,
      complex: 0.7,
      bitter: 0.6,
      aromatic: 0.8,
    },
    'cream liqueur': {
      creamy: 0.9,
      sweet: 0.8,
      smooth: 0.8,
      vanilla: 0.6,
      rich: 0.6,
    },

    // Amaro profiles
    amaro: {
      bitter: 0.9,
      herbal: 0.8,
      complex: 0.8,
      sweet: 0.5,
      aromatic: 0.7,
    },
  };

  constructor() {
    super({});
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return Promise.all(documents.map((doc) => this.embedQuery(doc)));
  }

  async embedQuery(text: string): Promise<number[]> {
    const lowerText = text.toLowerCase();

    // Initialize embedding with zeros for each dimension
    const embedding = Array(this.flavorDimensions.length).fill(0);

    // Extract liquor type if present
    let detectedType = '';
    const typePatterns = [
      { pattern: /whiskey|bourbon|scotch|rye/i, type: 'whiskey' },
      { pattern: /gin/i, type: 'gin' },
      { pattern: /rum/i, type: 'rum' },
      { pattern: /vodka/i, type: 'vodka' },
      { pattern: /tequila|mezcal/i, type: 'tequila' },
      { pattern: /liqueur|cordial/i, type: 'liqueur' },
      { pattern: /amaro|bitter/i, type: 'amaro' },
    ];

    for (const { pattern, type } of typePatterns) {
      if (pattern.test(lowerText)) {
        detectedType = type;
        break;
      }
    }

    // Process each word in the text
    const words = lowerText.split(/\s+/);

    // First pass: direct dimension matching
    words.forEach((word) => {
      // Check for negation
      const isNegated =
        words.indexOf(word) > 0 &&
        (words[words.indexOf(word) - 1] === 'not' ||
          words[words.indexOf(word) - 1] === 'no' ||
          words[words.indexOf(word) - 1].endsWith("n't"));

      // Check if word is a flavor dimension
      const dimIndex = this.flavorDimensions.indexOf(word);
      if (dimIndex >= 0) {
        embedding[dimIndex] += isNegated ? -1.0 : 1.0;
      }

      // Check if word is in flavor profiles
      if (this.flavorProfiles[word]) {
        const profile = this.flavorProfiles[word];
        Object.entries(profile).forEach(([flavor, value]) => {
          const flavorIndex = this.flavorDimensions.indexOf(flavor);
          if (flavorIndex >= 0) {
            embedding[flavorIndex] += isNegated ? -value : value;
          }
        });
      }
    });

    // Second pass: semantic relationships
    words.forEach((word) => {
      // Check for negation
      const isNegated =
        words.indexOf(word) > 0 &&
        (words[words.indexOf(word) - 1] === 'not' ||
          words[words.indexOf(word) - 1] === 'no' ||
          words[words.indexOf(word) - 1].endsWith("n't"));

      // Apply semantic relationships
      if (this.semanticRelationships[word]) {
        const relationships = this.semanticRelationships[word];
        Object.entries(relationships).forEach(([relatedTerm, strength]) => {
          const relatedIndex = this.flavorDimensions.indexOf(relatedTerm);
          if (relatedIndex >= 0) {
            embedding[relatedIndex] += isNegated ? -strength * 0.5 : strength * 0.5;
          }
        });
      }
    });

    // Apply type-specific boosts
    if (detectedType) {
      switch (detectedType) {
        case 'whiskey':
          this.boostDimensions(embedding, ['warm', 'oak', 'smoky', 'rich'], 0.4);
          break;
        case 'gin':
          this.boostDimensions(embedding, ['juniper', 'botanical', 'crisp'], 0.4);
          break;
        case 'rum':
          this.boostDimensions(embedding, ['sweet', 'tropical', 'smooth'], 0.4);
          break;
        case 'vodka':
          this.boostDimensions(embedding, ['neutral', 'clean', 'smooth'], 0.4);
          break;
        case 'tequila':
          this.boostDimensions(embedding, ['earthy', 'vegetal', 'citrus'], 0.4);
          break;
        case 'liqueur':
          this.boostDimensions(embedding, ['sweet', 'syrupy', 'rich'], 0.4);
          break;
        case 'amaro':
          this.boostDimensions(embedding, ['bitter', 'herbal', 'complex'], 0.4);
          break;
      }
    }

    // Process phrases
    this.processPhrase(lowerText, 'refreshing citrus', ['refreshing', 'citrus', 'bright', 'zesty', 'crisp'], embedding);
    this.processPhrase(lowerText, 'not too sweet', ['sweet', 'syrupy'], embedding, true);
    this.processPhrase(lowerText, 'smooth and easy', ['smooth', 'light', 'clean'], embedding);
    this.processPhrase(lowerText, 'rich and complex', ['rich', 'complex', 'deep'], embedding);
    this.processPhrase(lowerText, 'fruity and sweet', ['fruity', 'sweet', 'tropical'], embedding);

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

  private processPhrase(
    text: string,
    phrase: string,
    dimensions: string[],
    embedding: number[],
    negate: boolean = false,
  ): void {
    if (text.includes(phrase)) {
      dimensions.forEach((dim) => {
        const index = this.flavorDimensions.indexOf(dim);
        if (index >= 0) {
          embedding[index] += negate ? -0.7 : 0.7;
        }
      });
    }
  }

  // Add a getter method to expose the flavor dimensions
  public getFlavorDimensions(): string[] {
    return [...this.flavorDimensions];
  }
}
