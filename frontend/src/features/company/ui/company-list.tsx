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
import { useCompanyStore } from '../state/company.store';
import type { CompanyDto } from '../dtos';
import { TIMEZONE_OPTIONS } from './timezones';

const PAGE_SIZES = [10, 20, 50, 100];

/** Paginated Syncfusion grid with inline add, edit and delete for companies. */
export function CompanyList() {
  const companies = useCompanyStore((state) => state.companies);
  const pagination = useCompanyStore((state) => state.pagination);
  const isLoading = useCompanyStore((state) => state.isLoading);
  const error = useCompanyStore((state) => state.error);
  const isSuccess = useCompanyStore((state) => state.isSuccess);
  const isUpdated = useCompanyStore((state) => state.isUpdated);
  const isDeleted = useCompanyStore((state) => state.isDeleted);
  const fetchCompanies = useCompanyStore((state) => state.fetchCompanies);
  const createCompany = useCompanyStore((state) => state.createCompany);
  const updateCompany = useCompanyStore((state) => state.updateCompany);
  const deleteCompany = useCompanyStore((state) => state.deleteCompany);
  const goToPage = useCompanyStore((state) => state.goToPage);
  const nextPage = useCompanyStore((state) => state.nextPage);
  const previousPage = useCompanyStore((state) => state.previousPage);
  const setLimit = useCompanyStore((state) => state.setLimit);

  const gridRef = useRef<GridComponentType>(null);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const refresh = (): void => {
    fetchCompanies(pagination.page, pagination.limit);
    gridRef.current?.refresh();
  };

  const handleActionComplete = async (args: ActionEventArgs): Promise<void> => {
    try {
      if (args.requestType === 'save') {
        const { id, name, address, phone_number, timezone } = args.data as CompanyDto;
        const values = { name, address, phone_number, timezone };
        await (args.action === 'add' ? createCompany(values) : updateCompany(id, values));
      } else if (args.requestType === 'delete') {
        for (const row of args.data as Array<{ id: string }>) {
          await deleteCompany(row.id);
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
        key={companies.length}
        dataSource={companies}
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
            width={160}
            editType="stringedit"
            validationRules={{ required: true, minLength: 2 }}
          />
          <ColumnDirective
            field="address"
            headerText="Address"
            width={260}
            editType="stringedit"
            validationRules={{ required: true, minLength: 5 }}
          />
          <ColumnDirective
            field="phone_number"
            headerText="Phone Number"
            width={150}
            editType="stringedit"
            validationRules={{ required: true, minLength: 7 }}
          />
          <ColumnDirective
            field="timezone"
            headerText="Timezone"
            width={170}
            editType="dropdownedit"
            edit={{
              params: {
                dataSource: TIMEZONE_OPTIONS,
                fields: { text: 'timezone', value: 'timezone' },
                allowFiltering: true,
              },
            }}
            validationRules={{ required: true }}
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
          {companies.length} of {pagination.total} total
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
        successMessage="Company created successfully"
        updateMessage="Company updated successfully"
        deleteMessage="Company deleted successfully"
      />
    </Box>
  );
}
