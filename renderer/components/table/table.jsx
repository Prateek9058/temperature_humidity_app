"use client";
import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Button,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import CustomTable from "../customTable/index";
import { RiFileExcel2Line } from "react-icons/ri";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { ToastContainer, toast } from "react-toastify";
import CommonDialog from "../Dialog/index";
import moment from "moment";
import dayjs from "dayjs";
const Table = ({
  data,
  params,
  rowsPerPage,
  ClearHistory,
  ReadHistory,
  setRowsPerPage,
  page,
  setPage,
  searchQuery,
  setSearchQuery,
  loading,
  ports,
}) => {
  const columns = ["Sr no.", "Date", "Time", "Temperature(°C)", "Humidity"];
  const [open, setOpenDialog] = React.useState(false);
  const [openDownload, setOpneDownload] = React.useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const count = data?.length;
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(debouncedSearchQuery);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [debouncedSearchQuery, setSearchQuery]);

  const handleSearchChange = (event) => {
    setDebouncedSearchQuery(event.target.value);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  const handleOpenDownload = () => {
    setOpneDownload(true);
  };

  const handleConfirm = () => {
    if (ports.length === 0) {
      toast.error("Port is not connected");
      handleCancel();
      return;
    }
    ClearHistory("CLEAR_SDCARD\n\r");
    handleCancel();
  };
  const handleDownload = () => {
    if (ports.length === 0) {
      toast.error("Port is not connected");
      handleCancel();
      return;
    }
    ReadHistory("HIST_COMM\n\r");
    handleCancel();
  };

  const handleCancel = () => {
    setOpenDialog(false);
    setOpneDownload(false);
  };
  const renderPowerStatus = (status) => (
    <Chip
      label={status}
      sx={{
        backgroundColor: "#2D9CDB",
        color: "#fff",
        fontWeight: 700,
        minWidth: 120,
      }}
    />
  );
  const renderPowerStatus1 = (status) => (
    <Chip
      label={status}
      sx={{
        backgroundColor: "#FFBFBF",
        color: "red",
        fontWeight: 700,
        minWidth: 120,
      }}
    />
  );

  const getFormattedData = (data) => {
    return data?.map((item, index) => ({
      sr: index + 1,
      date: item.d ? item.d : "--",
      time: item?.t ? dayjs(item?.t, "h:mm:ss").format("LTS") : "--",
      Temp: item?.Temp ? renderPowerStatus(`${item?.Temp} °C`) : "--",
      Humi: item?.Humi ? renderPowerStatus1(`${item?.Humi} %`) : "--",
    }));
  };
  const handleExport = (data) => {
    console.log("Exporting data", data);

    if (!Array.isArray(data) || data.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const modifiedData = data?.map((row, index) => ({
      srNo: index + 1,
      date: row?.d,
      time: dayjs(row?.t, "HH:mm:ss").format("LTS"),
      temperature: `${row?.Temp} °C`,
      humidity: `${row?.Humi} %`,
    }));

    const csvData = [];
    const tableHeading = "Temeperature & HUmidity History Data";
    csvData.push([[], [], tableHeading, [], []]);
    csvData.push([]);

    const headerRow = ["Sr no.", "Date", "Time", "Temperature(°C)", "Humidity"];
    csvData.push(headerRow);

    modifiedData.forEach((row) => {
      const rowData = [
        row?.srNo,
        row?.date,
        dayjs(row?.time, "HH:mm:ss").format("LTS"),
        row?.temperature,
        row?.humidity,
      ];
      csvData.push(rowData);
    });
    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "TemperatureHumidityHistory.csv");
    toast.success("Download Excel Succefully");
  };
  return (
    <Grid container mt={1}>
      <CommonDialog
        open={open}
        bgcolor={"red"}
        fullWidth={true}
        maxWidth={"xs"}
        title="Confirmation"
        message="Are you sure you want to clear this history?"
        color="error"
        onClose={handleCancel}
        onConfirm={handleConfirm}
      />
      <CommonDialog
        bgcolor={"green"}
        open={openDownload}
        fullWidth={true}
        maxWidth={"xs"}
        title="Confirmation"
        message="Are you sure you want to read this history?"
        color="success"
        onClose={handleCancel}
        onConfirm={handleDownload}
      />
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        p={2}
        sx={{
          borderRadius: "16px 16px 0px 0px",
          backgroundColor: "#fff",
        }}
      >
        <Grid item>
          <Typography variant="h5">
            Temperature and Humidity history{" "}
          </Typography>
        </Grid>
        <Grid item className="customSearch">
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<RiFileExcel2Line />}
                sx={{ color: "black" }}
                onClick={() => {
                  handleExport(data);
                }}
              >
                Download Excel
              </Button>
            </Grid>

            {/* <Grid item>
              <Button variant="contained" onClick={handleOpenDownload}>
                Read history
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="error"
                onClick={handleOpenDialog}
              >
                Clear history
              </Button>
            </Grid> */}
          </Grid>
        </Grid>
      </Grid>

      <CustomTable
        loading={loading}
        page={page}
        rows={getFormattedData(data)}
        count={count}
        columns={columns}
        setPage={setPage}
        rowsPerPage={rowsPerPage}
        handleChangePage={handleChangePage}
        setRowsPerPage={setRowsPerPage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Grid>
  );
};

export default Table;
