
export interface Attribute {
    id: string;
    code: string;
    name: string;
    value: string | boolean;
    label: string;
    unit: string;
}

export interface Options {
    selected: boolean;
    value: string;
    label: string
}

export interface AttributeOptions {
    id: string;
    code: string;
    dataType: string;
    isRequired: boolean;
    isFilterable: boolean;
    label: string;
    displayOrder: number;
    unit: string;
    options: Options[]
}
export interface SKU {
    skuCode: string;
    name: string;
    price: number;
    originalPrice: number;
    stock: number;
    
}
export interface ProductFormUI {
    name: string;
    slug: string;
    brandId: string;
    categoryId: string;
    shortDescription: string;
    description: string;
    image: File | null | string;
    gallery: (File | string)[] | null;
    attributes: Attribute[];
    attributeOptions: AttributeOptions[];
}