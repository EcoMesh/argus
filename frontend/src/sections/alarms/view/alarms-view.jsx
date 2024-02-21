import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { currentRegionIdAtom } from 'src/recoil/regions';
// import { users } from 'src/_mock/user';
import { useCreateAlarm, currentRegionAlarmsAtom } from 'src/recoil/alarms';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import AlarmTableRow from '../alarm-table-row';
import AlarmTableHead from '../alarm-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import NewAlarmModal from '../modals/new-alarm-modal';
import { emptyRows, applyFilter, getComparator } from '../utils';
// ----------------------------------------------------------------------

const countRulesFromConditionTree = (condition) => {
  if (condition.type === 'rule') {
    return 1;
  }
  return condition.tests.reduce((acc, child) => acc + countRulesFromConditionTree(child), 0);
};

export default function AlarmsPage() {
  const alarms = useRecoilValue(currentRegionAlarmsAtom);
  const selectedRegionId = useRecoilValue(currentRegionIdAtom);
  const createAlarm = useCreateAlarm();

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = alarms.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: alarms,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const [newSensorModalOpen, setNewSensorModalOpen] = useState(false);
  const handleNewSensorModalOpen = () => setNewSensorModalOpen(true);
  const handleNewSensorModalClose = (values) => {
    setNewSensorModalOpen(false);

    if (values !== null) {
      createAlarm({
        regionId: selectedRegionId,
        ...values,
      });
    }
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Alarms</Typography>

        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleNewSensorModalOpen}
        >
          New Alarm
        </Button>
      </Stack>

      <NewAlarmModal open={newSensorModalOpen} handleClose={handleNewSensorModalClose} />

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <AlarmTableHead
                order={order}
                orderBy={orderBy}
                rowCount={alarms.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'name', label: 'Name' },
                  { id: 'rules', label: 'Rules' },
                  { id: 'subscribers', label: 'Subscribers' },
                  { id: 'status', label: 'Status' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <AlarmTableRow
                      key={row.id}
                      name={row.name}
                      rules={countRulesFromConditionTree(row.condition)}
                      subscribers={row.subscribers.length}
                      status={
                        row.history.find((h) => !h.end) ? (
                          <Label color="success">Active</Label>
                        ) : (
                          <Label color="info">Inactive</Label>
                        )
                      }
                      selected={selected.indexOf(row.id) !== -1}
                      handleClick={(event) => handleClick(event, row.id)}
                    />
                  ))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, alarms.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={alarms.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
