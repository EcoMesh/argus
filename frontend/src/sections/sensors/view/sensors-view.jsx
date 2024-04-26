import { useRecoilState } from 'recoil';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { useCreateSensor, currentRegionSensorsSelector } from 'src/recoil/sensors';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import SensorTableRow from '../sensor-table-row';
import UserTableHead from '../sensor-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import SensorQrModal from '../modals/sensor-qr-modal';
import NewSensorModal from '../modals/new-sensor-modal';
import { emptyRows, applyFilter, getComparator } from '../utils';

export default function SensorsPage() {
  const [sensors, setSensors] = useRecoilState(currentRegionSensorsSelector);
  const createSensor = useCreateSensor();
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [recentlyCreatedSensor, setRecentlyCreatedSensor] = useState(null);

  const location = useLocation();

  // select the sensor if its ID is in the url hash
  useEffect(() => {
    if (!location.hash) return;
    const nodeId = location.hash.slice(1);
    const sensor = sensors.find((s) => s.nodeId === nodeId);
    if (sensor && !selected.includes(sensor.id))
      setSelected([...selected, sensor.id]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash])

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = sensors.map((n) => n.id);
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
    inputData: sensors,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const [newSensorModalOpen, setNewSensorModalOpen] = useState(false);
  const handleNewSensorModalOpen = () => setNewSensorModalOpen(true);
  const handleNewSensorModalClose = async (newSensorIn) => {
    setNewSensorModalOpen(false);

    if (newSensorIn === null) return;

    const newSensorOut = await createSensor(newSensorIn);
    setRecentlyCreatedSensor(newSensorOut);
    setSensors((oldSensors) => [...oldSensors, newSensorOut]);
  };
  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Sensors</Typography>

        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleNewSensorModalOpen}
        >
          Register Sensor
        </Button>
        <SensorQrModal
          open={!!recentlyCreatedSensor}
          handleClose={() => setRecentlyCreatedSensor(null)}
          sensor={recentlyCreatedSensor}
        />
      </Stack>

      <NewSensorModal open={newSensorModalOpen} handleClose={handleNewSensorModalClose} />

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={sensors.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'nodeId', label: 'Node ID' },
                  { id: 'lat', label: 'Latitude' },
                  { id: 'lon', label: 'Longitude' },
                  { id: 'uplink', label: 'Uplink', align: 'center' },
                  { id: 'status', label: 'Status' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <SensorTableRow
                      key={row.id}
                      sensor={row}
                      selected={selected.indexOf(row.id) !== -1}
                      handleClick={(event) => handleClick(event, row.id)}
                    />
                  ))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, sensors.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={sensors.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
