export interface SubFunctionCreateForm {
    code: string,
    name: string,
    description: string,
    functionId?: string | null
}

export interface SubFunctionEditForm {
    id: string,
    code: string,
    name: string,
    description: string,
    functionId?: string | null
}

export interface SubFunctionForm {
    id: string,
    code: string,
    name: string,
    description: string,
    functionId?: string | null
}