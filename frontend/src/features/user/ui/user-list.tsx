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
import { Backdrop, Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AppSnackbar } from '@/common/components';
import { useUserStore } from '../state/user.store';
import type { UserDto } from '../dtos';

export function UserList() {
  const users = useUserStore((state) => state.users);
  const isLoading = useUserStore((state) => state.isLoading);
  const error = useUserStore((state) => state.error);
  const isSuccess = useUserStore((state) => state.isSuccess);
  const isUpdated = useUserStore((state) => state.isUpdated);
  const isDeleted = useUserStore((state) => state.isDeleted);
  const fetchUsers = useUserStore((state) => state.fetchUsers);
  const deleteUser = useUserStore((state) => state.deleteUser);
  const updateUser = useUserStore((state) => state.updateUser);
  const createUser = useUserStore((state) => state.createUser);

  const gridRef = useRef<GridComponentType>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    gridRef.current?.refresh();
  }, [users]);

  const handleActionComplete = async (args: ActionEventArgs): Promise<void> => {
    if (args.requestType === 'save') {
      const { id, name, email, phone, is_active } = args.data as UserDto;
      if (args.action === 'edit') {
        await updateUser(id, { name, email, phone, is_active });
      } else if (args.action === 'add') {
        await createUser({ name, email, phone, is_active });
      }
      await fetchUsers();
      gridRef.current?.refresh();
    } else if (args.requestType === 'delete') {
      for (const row of args.data as Array<{ id: string }>) {
        await deleteUser(row.id);
      }
      await fetchUsers();
      gridRef.current?.refresh();
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
          <IconButton
            onClick={() => {
              fetchUsers();
              gridRef.current?.refresh();
            }}
            disabled={isLoading}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <GridComponent
        ref={gridRef}
        key={users.length}
        dataSource={users}
        allowPaging={true}
        allowSorting={true}
        allowExcelExport={true}
        pageSettings={{ pageSize: 10 }}
        editSettings={{
          allowEditing: true,
          allowAdding: true,
          allowDeleting: true,
          mode: 'Normal',
        }}
        toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search', 'ExcelExport']}
        toolbarClick={handleToolbarClick}
        actionComplete={handleActionComplete}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="id"
            headerText="ID"
            width={80}
            isPrimaryKey={true}
            allowEditing={false}
            template={(props: UserDto) => (
              <span title={props.id} style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {String(props.id).slice(0, 8)}…
              </span>
            )}
          />
          <ColumnDirective field="name" headerText="Name" width={150} editType="stringedit" />
          <ColumnDirective field="email" headerText="Email" width={200} editType="stringedit" />
          <ColumnDirective field="phone" headerText="Phone" width={130} editType="stringedit" />
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
