export interface Role {
  id: string;
  description: string;
  name: string;
  quantity: number;
  quantityPermission: number;
}

export interface RoleForm {
  id: string;
  name: string;
  description: string;
  subFunctions: string[]
}

export interface RoleEditForm {
  oldId: string,
  newId: string;
  name: string;
  description: string;
  subFunctions: string[]
}
