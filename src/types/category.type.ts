export interface Category {
    id: string,
    name: string,
    slug: string,
    level: number,
    isVisible: boolean
}

export interface CategoryDetail {
    id: string,
    name: string,
    parentName: string;
    parentId: string;
    isVisible: boolean,
    sortOrder: number,
    menuLabel: string,
    iconUrl: string,
    imageUrl: string,
    isFeatured: boolean
    slug: string
}

export interface CategoryOption {
    id: string,
    name: string,
    level: number,
    parentId: string
}

export interface CategoryCreateFormUI {
    name: string,
    slug: string,
    parentId: string,
    active: boolean,
    icon: string,
    imageFile: File | null,
    isFeatured: boolean
}

export interface CategoryUpdateForm {
    id: string,
    name: string,
    parentId: string,
    isVisible: boolean,
    sortOrder: number,
    menuLabel: string,
    iconUrl: string,
    imageFile: File | null,
    isFeatured: boolean
}