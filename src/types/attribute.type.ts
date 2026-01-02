import type { Option } from "./select.type";

export interface Attribute {
    id: string;
    code: string;
    label: string;
    dataType: string;
}

export interface AttributeDetail {
    id: string;
    code: string;
    label: string;
    dataType: string;
    unit: string;
    options: Option[];
}

export interface AttributeCreateForm {
    code: string;
    label: string;
    dataType: string;
    options?: Option[];
    unit?: string | null;
}

export interface AttributeEditForm {
    id: string;
    code: string;
    label: string;
    dataType: string;
    options?: Option[];
    unit?: string | null;
}