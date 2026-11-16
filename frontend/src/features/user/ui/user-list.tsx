'use client';

import { useEffect, useRef } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Page,
  Search,
  Toolbar,
  Edit,
  Sort,
  ExcelExport,
} from '@syncfusion/ej2-react-grids';
import type {
  GridComponent as GridComponentType,
  ActionEventArgs,
} from '@syncfusion/ej2-react-grids';
import type { ClickEventArgs } from '@syncfusion/ej2-react-navigations';
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  Pagination,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AppSnackbar } from '@/common/components';
import { useUserStore } from '../state/user.store';
import type { UserDto } from '../dtos';

const PAGE_SIZES = [10, 20, 50, 100];

/** Paginated Syncfusion grid with inline add, edit and delete for users. */
export function UserList() {
  const users = useUserStore((state) => state.users);
  const pagination = useUserStore((state) => state.pagination);
  const isLoading = useUserStore((state) => state.isLoading);
  const error = useUserStore((state) => state.error);
  const isSuccess = useUserStore((state) => state.isSuccess);
  const isUpdated = useUserStore((state) => state.isUpdated);
  const isDeleted = useUserStore((state) => state.isDeleted);
  const fetchUsers = useUserStore((state) => state.fetchUsers);
  const createUser = useUserStore((state) => state.createUser);
  const updateUser = useUserStore((state) => state.updateUser);
  const deleteUser = useUserStore((state) => state.deleteUser);
  const goToPage = useUserStore((state) => state.goToPage);
  const nextPage = useUserStore((state) => state.nextPage);
  const previousPage = useUserStore((state) => state.previousPage);
  const setLimit = useUserStore((state) => state.setLimit);

  const gridRef = useRef<GridComponentType>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refresh = (): void => {
    fetchUsers(pagination.page, pagination.limit);
    gridRef.current?.refresh();
  };

  const handleActionComplete = async (args: ActionEventArgs): Promise<void> => {
    try {
      if (args.requestType === 'save') {
        const { id, name, email, phone, is_active } = args.data as UserDto;
        const values = { name, email, phone, is_active };
        await (args.action === 'add' ? createUser(values) : updateUser(id, values));
      } else if (args.requestType === 'delete') {
        for (const row of args.data as Array<{ id: string }>) {
          await deleteUser(row.id);
        }
      }
    } catch {
      // The store recorded the error; reload so the grid drops the edit the server rejected.
      refresh();
    }
  };

  const handleToolbarClick = (args: ClickEventArgs): void => {
    if (args.item?.id?.includes('excelexport')) {
      gridRef.current?.excelExport();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Tooltip title="Refresh">
          <IconButton onClick={refresh} disabled={isLoading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <GridComponent
        ref={gridRef}
        key={users.length}
        dataSource={users}
        allowPaging={false}
        allowSorting={true}
        allowExcelExport={true}
        editSettings={{
          allowEditing: true,
          allowAdding: true,
          allowDeleting: true,
          mode: 'Inline',
          allowEditOnDblClick: true,
        }}
        toolbar={['Search', 'ExcelExport', 'Add', 'Edit', 'Delete', 'Update', 'Cancel']}
        toolbarClick={handleToolbarClick}
        actionComplete={handleActionComplete}
      >
        <ColumnsDirective>
          <ColumnDirective field="id" isPrimaryKey={true} visible={false} />
          <ColumnDirective
            field="name"
            headerText="Name"
            width={150}
            editType="stringedit"
            validationRules={{ required: true, minLength: 2 }}
          />
          <ColumnDirective
            field="email"
            headerText="Email"
            width={200}
            editType="stringedit"
            validationRules={{ required: true, email: true }}
          />
          <ColumnDirective
            field="phone"
            headerText="Phone"
            width={130}
            editType="stringedit"
            validationRules={{ required: true, minLength: 5 }}
          />
          <ColumnDirective
            field="is_active"
            headerText="Active"
            width={100}
            editType="booleanedit"
            displayAsCheckBox={true}
          />
        </ColumnsDirective>

        <Inject services={[Page, Search, Toolbar, Edit, Sort, ExcelExport]} />
      </GridComponent>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mt: 2,
        }}
      >
        <Typography variant="body2">
          {users.length} of {pagination.total} total
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            onClick={() => previousPage()}
            disabled={!pagination.hasPreviousPage || isLoading}
          >
            Previous
          </Button>
          <Pagination
            count={Math.max(pagination.totalPages, 1)}
            page={pagination.page}
            onChange={(_event, value) => goToPage(value)}
            disabled={isLoading}
          />
          <Button
            size="small"
            onClick={() => nextPage()}
            disabled={!pagination.hasNextPage || isLoading}
          >
            Next
          </Button>
          <Select
            size="small"
            value={pagination.limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            disabled={isLoading}
          >
            {PAGE_SIZES.map((size) => (
              <MenuItem key={size} value={size}>
                {size} / page
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {isLoading ? (
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isLoading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : null}

      <AppSnackbar
        error={error}
        isSuccess={isSuccess}
        isUpdated={isUpdated}
        isDeleted={isDeleted}
        successMessage="User created successfully"
        updateMessage="User updated successfully"
        deleteMessage="User deleted successfully"
      />
    </Box>
  );
}
