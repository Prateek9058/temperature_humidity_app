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
import { ToastContainer,toast } from "react-toastify";
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
}) => {
  const columns = ["Sr no.", "Date", "Time", "Temperature(°C)", "Humidity"];
  const [open, setOpenDialog] = React.useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

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

  const handleConfirm = () => {
    handleCancel();
  };

  const handleCancel = () => {
    setOpenDialog(false);
  };

  const getFormattedData = (data) => {
    return data?.map((item, index) => ({
      sr: index + 1,
      date: item.d ? `${item.d}` : "--",
      time: item?.t ? item?.t : "--",
      Temp: item?.Temp ? `${item.Temp} °C` : "--",
      Humi: item?.Humi ? `${item.Humi} %` : "--",
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
      time: row?.t,
      temperature: `${row?.Temp} C`,
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
        row?.time,
        row?.date,
        row?.temperature,
        row?.humidity,
      ];
      csvData.push(rowData);
    });
    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "TemperatureHumidityHistory.csv");
    toast.success("Download Excel Succefully")
  };
  return (
    <Grid container mt={2}>
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
          <Typography variant="h5">Temerature and humidity history </Typography>
        </Grid>
        <Grid item className="customSearch">
          <Grid container>
            <Grid item mr={3}>
            </Grid>
            <Grid item mr={3}>
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

            <Grid item>
              <Button
                variant="contained"
                onClick={(e) => {
                  ReadHistory("HIST_COMM\n\r");
                }}
              >
                Read history
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="error"
                sx={{ ml: 3 }}
                onClick={(e) => {
                  ClearHistory("CLEAR_SDCARD\n\r");
                }}
              >
                Clear history
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <CustomTable
        loading={loading}
        page={page}
        rows={getFormattedData(data)}
        count={data?.length}
        columns={columns}
        setPage={setPage}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
      />
    </Grid>
  );
};

export default Table;
