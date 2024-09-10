import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import {
  Avatar,
  Button,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
} from "@mui/material";
import Graph from "./graph";
import GraphSDCard from "./SdCardGraph";
import Image from "next/image";
import Thermometer from "../../public/images/thermometer1.svg";
import Battery from "../../public/images/battery1.svg";
import Humidity from "../../public/images/humidity1.svg";
import CommanDatePicker from "../Date-range-Picker/index";
import moment from "moment";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const CardList = ({ data1, readSDcard, serialData }) => {
  const [date, setDate] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedDataSource, setSelectedDataSource] = useState("live"); 

  const currentDate = dayjs();
  useEffect(() => {
    const parseDate = (dateString) => {
      try {
        if (!dateString) {
          throw new Error("Invalid date string");
        }
        const [day, month, year] = dateString.split("/").map(Number);
        if (!day || !month || !year) {
          throw new Error("Incomplete date information");
        }
        return new Date(year, month - 1, day);
      } catch (error) {
        console.error("Error parsing date:", error.message);
        return null; // Return null to handle the error gracefully
      }
    };

    // Format the startDate to 'D/M/YYYY'
    const selectStartDate = dayjs(startDate).format("D/M/YYYY");
    console.log("Formatted Start Date:", selectStartDate);

    if (selectStartDate && readSDcard?.length) {
      const filteredData = readSDcard.filter((item) => {
        const itemDate = dayjs(parseDate(item.d)).format("D/M/YYYY");
        return itemDate === selectStartDate;
      });
      console.log("Filtered Data:", filteredData);
      setFilteredData(filteredData);
    } else {
      setFilteredData([]);
    }
  }, [startDate, readSDcard]);

  const cardData = [
    {
      id: 1,
      title: "Current temperature",
      value: `${data1?.Temp || 0} °C`,
      icon: Thermometer,
    },
    {
      id: 2,
      title: "Current humidity",
      value: `${data1?.Humi || 0} %`,
      icon: Humidity,
    },
    {
      id: 3,
      title: "Battery",
      value: `${data1?.batt || 0} %`,
      icon: Battery,
    },
  ];
  const minDate = dayjs("2024-01-01");
  const handleData = (data, datatype) => {
    if (datatype == "startDate") {
      setStartDate(data);
    } else if (datatype == "endDate") {
      setEndDate(data);
    }
  };

  const handleChangeDataSource = (event) => {
    setSelectedDataSource(event.target.value);
  };
  console.log("date", dayjs(startDate).format("D/M/YYYY"));
  return (
    <Grid container spacing={2} padding={1} mt={1}>
      <Grid item xs={12} md={4}>
        <Grid container direction="column" spacing={2}>
          {cardData?.map((data) => (
            <Grid item xs={12} key={data?.id}>
              <Card>
                <CardContent>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item>
                      <Avatar
                        sx={{
                          backgroundColor: "rgba(0, 176, 116, 0.15)",
                          height: 70,
                          width: 70,
                        }}
                      >
                        <Image
                          src={data?.icon}
                          alt={data?.title}
                          height={40}
                          width={40}
                        />
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h6">{data?.title}</Typography>
                      <Typography variant="body1" mt={1}>
                        {data?.value ? data?.value : "--"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>

      <Grid item xs={12} md={8}>
        <Grid
          container
          sx={{ backgroundColor: "#fff", borderRadius: "15px" }}
          p={0.5}
          height={"400px"}
          justifyContent={"flex-end"}
        >
          <Grid container justifyContent={"flex-end"} p={1}>
          <FormControl sx={{ mr: 1, minWidth: 200 }}>
              <InputLabel id="data-source-select-label">Select Data Source</InputLabel>
              <Select
                label="Select Data Source"
                value={selectedDataSource}
                onChange={handleChangeDataSource}
              >
                <MenuItem value="live">Live Data</MenuItem>
                <MenuItem value="readHistory">Read History</MenuItem>
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                // label="Select Date"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  disableUnderline: true,
                }}
                format="DD/MM/YYYY"
                maxDate={currentDate}
                minDate={minDate}
                value={startDate ? startDate : currentDate}
                onChange={(e) => handleData(e, "startDate")}
                renderInput={(params) => (
                  <TextField
                    sx={{ maxWidth: "150px" }}
                    variant="filled"
                    size="small"
                    {...params}
                    inputProps={{
                      ...params.inputProps,
                      placeholder: "Start date",
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>

          {selectedDataSource=='live'?<Graph serialData={serialData} />:<GraphSDCard data={filteredData} />}
          {/* > */}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default CardList;
