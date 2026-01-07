import type { Option } from "./select.type";

export interface Attribute {
    id: string;
    code: string;
    label: string;
    active: boolean;
    dataType: string;
}

export interface AttributeOptionForm {
    attributeIds: string[],
    keyword: string
}

export interface AttributeDetail {
    id: string;
    code: string;
    label: string;
    dataType: string;
    unit: string;
    options: OptionAttribute[];
}

export interface AttributeCreateForm {
    code: string;
    label: string;
    dataType: string;
    options?: OptionAttribute[];
    unit?: string | null;
}

export interface OptionAttribute {
    id: string,
    label: string;
    value: string;
    active: boolean;
    deprecated: boolean;
}
export interface AttributeEditForm {
    id: string;
    code: string;
    label: string;
    dataType: string;
    options?: OptionAttribute[];
    unit?: string | null;
}