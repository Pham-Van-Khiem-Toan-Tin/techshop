
export type AttributeRawValue =
  | { type: "TEXT"; value: string }
  | { type: "NUMBER"; value: number | null }
  | { type: "DATE"; value: string | null }       // ISO string
  | { type: "BOOLEAN"; value: boolean }
  | { type: "SELECT"; value: string | null }
  | { type: "MULTIPLE_SELECT"; value: string[] };
export interface Attribute {
  id: string;
  code: string;
  dataType: DataType;
  name: string;
  displayOrder: number;
  label: string;
  unit: string;
  raw: AttributeRawValue;
}

export interface Options {
  value: string;
  label: string;
}
export type DataType =
  | "TEXT"
  | "NUMBER"
  | "DATE"
  | "BOOLEAN"
  | "SELECT"
  | "MULTIPLE_SELECT";
export interface AttributeOptions {
  id: string;
  code: string;
  dataType: DataType;
  isRequired: boolean;
  isFilterable: boolean;
  label: string;
  displayOrder: number;
  unit: string;
  options?: Options[];
}

export interface SKU {
  key: string;
  id: string;
  image: File | null;
  skuCode: string;
  name: string;
  price: number;
  costPrice: number;
  originalPrice: number;
  locked: boolean;
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
  warrantyMonth: number;
  shortDescription: string;
  description: string;
  hasVariants: boolean;
  price: number;
  originalPrice: number;
  costPrice: number;
  stock: number;
  bulk: {
    price: number;
    originalPrice: number;
    costPrice: number;
    stock: number;
  };
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
  active?: boolean;
  deprecated?: boolean;
  used?: boolean;
}

export interface SkuCreateForm {
  image: File | null;
  skuCode: string;
  name: string;
  price: number;
  costPrice: number;
  originalPrice: number;
  stock: number;
  attributes: Val[];
}
interface GroupCreateForm {
  id: string;
  name: string;
  values: Val[];
}
export interface ProductCreateForm {
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  specs: Attribute[];
  attributes: GroupCreateForm[];
  warrantyMonth: number;
  description: string;
  shortDescription: string;
  hasVariants: boolean;
  thumbnail: File;
  gallery: File[];
  skus: SkuCreateForm[];
}
