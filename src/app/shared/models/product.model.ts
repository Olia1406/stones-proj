import { IProduct } from '../interfaces/product.interface';
import { ICategory } from '../interfaces/category.interface';

export class Product implements IProduct {
    constructor(public id: number,
                public category: ICategory,
                public nameEN: string,
                public nameUA: string,
                public description: string,
                public length: string,
                public width: string,
                public price: number,
                public image: string,
                public color: string,
                // public zodiac: string,
                public zodiac: any,
                public stone: string,
                public count: number = 1,
                ) {}
}
