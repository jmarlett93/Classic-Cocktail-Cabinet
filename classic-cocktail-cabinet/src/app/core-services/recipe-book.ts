export interface Recipe {
    name: string,
    ingredients: RecipeIngredient[],
    instructions: string,
    variants?: string[],
    similar?: string[],
    tags: string[],
}

export interface RecipeIngredient {
    liqour: Liqour,
    amount: number,
    unit: string,
}

export interface Liqour {
    name: string,
    type: LiqourType,
    tags: string[],
}

export enum LiqourType {
    AMARO = 'AMARO',
    WHISKEY = 'WHISKEY',
    SPIRIT = 'SPIRIT',
    LIQUEUR= 'LIQUEUR'
}

export const recipeBook: Recipe[] = [];
export const Liquors: Liqour[] = [
    {
        name: 'Amaro Montenegro',
        type: LiqourType.AMARO,
        tags: ['bitter', 'dark', 'herbal'],
    },
    { name: 'Amaro Nonino', 
        type: LiqourType.AMARO,
        tags: ['bitter', 'warm', 'herbal'],
    },
    { name: 'Aperol', 
        type: LiqourType.AMARO,
        tags: ['bitter', 'citrus', 'bright'],
    },
    { name: 'Campari', 
        type: LiqourType.AMARO,
        tags: ['bitter', 'warm', 'bright'],
    },
    { name: 'Luxardo Maraschino',
        type: LiqourType.LIQUEUR,
        tags: ['sweet'],
    },
    { name: 'Amaro Averna',
        type: LiqourType.AMARO,
        tags: ['bitter', 'dark', 'herbal'],
    },
    {
        name: 'Green Chartreuse',
        type: LiqourType.LIQUEUR,
        tags: ['sweet', 'hot', 'herbal'],
    },
];
