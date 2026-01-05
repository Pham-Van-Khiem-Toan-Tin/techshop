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
  label: string;
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
  options: Options[];
}

export interface SKU {
  id: string;
  image: File | null;
  skuCode: string;
  name: string;
  price: number;
  originalPrice: number;
  stock: number;
  attributes: Val[];
}

export interface CategoryDetail {
  id: string;
  slug: string;
  name: string;
}
export interface ProductFormUI {
  name: string;
  slug: string;
  brandId: string;
  category: CategoryDetail;
  shortDescription: string;
  description: string;
  image: File | null | string;
  gallery: (File | string)[] | null;
  attributes: Attribute[];
  skus: SKU[];
  attributeOptions: AttributeOptions[];
  skuOptions: Group[];
}

export interface Group {
  id: string;
  name: string;
  value: string;
  values: Val[];
}
export interface Val {
  groupId: string;
  id: string;
  value: string;
}
