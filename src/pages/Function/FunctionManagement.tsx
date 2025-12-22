import { useMemo, useState } from 'react'
import { useGetRolesQuery } from '../../features/roles/role.api';
import type { Role } from '../../types/role.type';
import type { Column } from '../../types/table.type';
import Pagination from '../../components/common/Pagination';
import DataTable from '../../components/common/DataTable';
import { RiDeleteBin6Line, RiEditLine, RiEyeLine } from 'react-icons/ri';
import { useDebounce } from '../../hooks/useDebounce';
import { Link } from 'react-router';
const FunctionManagement = () => {
  return (
    <div>FunctionManagement</div>
  )
}

export default FunctionManagement