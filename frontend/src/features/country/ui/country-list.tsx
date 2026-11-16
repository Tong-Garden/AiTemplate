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
import { useCountryStore } from '../state/country.store';
import type { CountryDto } from '../dtos';

const PAGE_SIZES = [10, 20, 50, 100];

/** Paginated Syncfusion grid with inline add, edit and delete for countries. */
export function CountryList() {
  const countries = useCountryStore((state) => state.countries);
  const pagination = useCountryStore((state) => state.pagination);
  const isLoading = useCountryStore((state) => state.isLoading);
  const error = useCountryStore((state) => state.error);
  const isSuccess = useCountryStore((state) => state.isSuccess);
  const isUpdated = useCountryStore((state) => state.isUpdated);
  const isDeleted = useCountryStore((state) => state.isDeleted);
  const fetchCountries = useCountryStore((state) => state.fetchCountries);
  const createCountry = useCountryStore((state) => state.createCountry);
  const updateCountry = useCountryStore((state) => state.updateCountry);
  const deleteCountry = useCountryStore((state) => state.deleteCountry);
  const goToPage = useCountryStore((state) => state.goToPage);
  const nextPage = useCountryStore((state) => state.nextPage);
  const previousPage = useCountryStore((state) => state.previousPage);
  const setLimit = useCountryStore((state) => state.setLimit);

  const gridRef = useRef<GridComponentType>(null);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const refresh = (): void => {
    fetchCountries(pagination.page, pagination.limit);
    gridRef.current?.refresh();
  };

  const handleActionComplete = async (args: ActionEventArgs): Promise<void> => {
    try {
      if (args.requestType === 'save') {
        const { id, name, iso_code, phone_code } = args.data as CountryDto;
        const values = { name, iso_code, phone_code };
        await (args.action === 'add' ? createCountry(values) : updateCountry(id, values));
      } else if (args.requestType === 'delete') {
        for (const row of args.data as Array<{ id: string }>) {
          await deleteCountry(row.id);
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
        key={countries.length}
        dataSource={countries}
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
            width={200}
            editType="stringedit"
            validationRules={{ required: true, minLength: 2 }}
          />
          <ColumnDirective
            field="iso_code"
            headerText="ISO Code"
            width={100}
            editType="stringedit"
            validationRules={{ required: true, minLength: 2, maxLength: 2 }}
          />
          <ColumnDirective
            field="phone_code"
            headerText="Phone Code"
            width={120}
            editType="stringedit"
            validationRules={{ required: true, minLength: 2 }}
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
          {countries.length} of {pagination.total} total
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
        successMessage="Country created successfully"
        updateMessage="Country updated successfully"
        deleteMessage="Country deleted successfully"
      />
    </Box>
  );
}
