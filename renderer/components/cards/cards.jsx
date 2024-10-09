import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { FaRegTrashAlt } from "react-icons/fa";
import CommanDialog from "../Dialog/index";
import {
  Avatar,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  TextField,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import Graph from "./graph";
import GraphSDCard from "./SdCardGraph";
import Image from "next/image";
import Thermometer from "../../public/images/thermometer1.svg";
import low from "../../public/images/low.png";
import Battery from "../../public/images/battery1.svg";
import Humidity from "../../public/images/humidity1.svg";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TbPlugConnected } from "react-icons/tb";
import { PiPlugsConnectedBold } from "react-icons/pi";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const CardList = ({ data1, readSDcard, serialData, ReadHistory, ports,ClearHistory }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [open, setOpenDialog] = React.useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState("live");
  const currentDate = dayjs();
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  const handleConfirm = () => {
    if (readSDcard.length === 0) {
      toast.error("no data found");
      handleCancel();
      return;
    }
    ClearHistory("CLEAR_SDCARD\n\r");
    handleCancel();
  };
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
        return null;
      }
    };

    const selectedDate = startDate || dayjs();
    const formattedSelectedDate = dayjs(selectedDate).format("D/M/YYYY");
    console.log("Formatted Selected Date:", formattedSelectedDate);

    if (formattedSelectedDate && readSDcard?.length) {
      const filteredData = readSDcard.filter((item) => {
        const itemDate = dayjs(parseDate(item.d)).format("D/M/YYYY");
        return itemDate === formattedSelectedDate;
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
      title: "Current Temperature",
      value: `${data1?.Temp || 0} °C`,
      icon: Thermometer,
      color: "rgba(75,192,192,1)",
      live: "#2D9CDB",
    },
    {
      id: 2,
      title: "Current Humidity",
      value: `${data1?.Humi || 0} %`,
      icon: Humidity,
      color: "rgba(153,102,255,1)",
      live: "#FFBFBF",
    },
    {
      id: 3,
      title: "Battery",
      value: `${data1?.batt || 0} %`,
      icon: Battery,
      img: low,
    },
  ];

  const minDate = dayjs("2024-09-30");
  const handleData = (data, datatype) => {
    if (datatype == "startDate") {
      setStartDate(data);
    } else if (datatype == "endDate") {
      setEndDate(data);
    }
  };
  const handleChangeDataSource = (event) => {
    setSelectedDataSource(event.target.value);
    console.log("data", event.target.value);
    if (event.target.value === "readHistory") {
      if (ports.length === 0) {
        toast.error("port is not connected");
        return;
      }
      ReadHistory("HIST_COMM\n\r");
    }
  };
  const handleCancel = () => {
    setOpenDialog(false);
  };
  return (
    <>
      <CommanDialog
        open={open}
        bgcolor={"red"}
        fullWidth={true}
        maxWidth={"xs"}
        title="Confirmation"
        message="Are you certain you want to delete the history from both the app and the device?"
        color="error"
        onClose={handleCancel}
        onConfirm={handleConfirm}
      />
      <Grid container spacing={2} padding={1}>
        <Grid item xs={12}>
          <Grid container spacing={2} wrap="wrap">
            {cardData?.map((data) => (
              <Grid item xs={12} sm={6} md={6} lg={4} key={data?.id}>
                <Card>
                  <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item>
                        {data?.title != "Battery" ? (
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
                        ) : (
                          <Avatar
                            sx={{
                              backgroundColor: "rgba(0, 176, 116, 0.15)",
                              height: 70,
                              width: 70,
                            }}
                          >
                            <Image
                              src={
                                data?.value <= "35 %" ? data?.img : data?.icon
                              }
                              alt={data?.title}
                              height={40}
                              width={40}
                            />
                          </Avatar>
                        )}
                      </Grid>
                      <Grid
                        item
                        xs
                        display={"flex"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                      >
                        <Grid>
                          <Typography variant="h6">{data?.title}</Typography>
                          <Typography variant="body1" mt={1}>
                            {data?.title !== "Battery" && (
                              <Chip
                                label={data?.value}
                                //   variant={status === "Cleaned" ? "filled" : "filled"}

                                sx={{
                                  backgroundColor:
                                    selectedDataSource == "live"
                                      ? data?.color
                                      : data?.live,
                                  color:
                                    data?.title == "Current Temperature"
                                      ? "#fff"
                                      : "#fff",
                                  fontWeight: 700,
                                  minWidth: 120,
                                }}
                              />
                            )}
                            {data?.title === "Battery" && (
                              <Chip
                                label={data?.value}
                                //   variant={status === "Cleaned" ? "filled" : "filled"}

                                sx={{
                                  backgroundColor:
                                    data?.value >= "35 %"
                                      ? "#CCDEBF"
                                      : "#FFBFBF",
                                  color:
                                    data?.value >= "35 %" ? "#347D00" : "#fff",
                                  fontWeight: 700,
                                  minWidth: 120,
                                }}
                              />
                            )}
                          </Typography>
                        </Grid>
                        {data?.title === "Battery" && (
                          <>
                            {ports && (
                              <Grid>
                                {ports.length !== 0 && (
                                  <Grid
                                    container
                                    justifyContent={"flex-end"}
                                    gap={2}
                                  >
                                    <Typography>Pluged in :</Typography>
                                    <PiPlugsConnectedBold
                                      color="green"
                                      size={"22px"}
                                    />
                                  </Grid>
                                )}
                                {ports.length === 0 && (
                                  <Grid container mt={2} gap={2}>
                                    <Typography>Pluged out :</Typography>
                                    <TbPlugConnected
                                      color="red"
                                      size={"25px"}
                                    />
                                  </Grid>
                                )}
                              </Grid>
                            )}
                          </>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={12}>
          <Grid
            container
            sx={{ backgroundColor: "#fff", borderRadius: "15px" }}
            height={"450px"}
            justifyContent={"flex-end"}
          >
            <Grid container justifyContent={"space-between"} p={2}>
              <Grid>
                <Typography variant="h5">Temperature & Humidity</Typography>
              </Grid>
              <Grid>
                <FormControl sx={{ mr: 1, ml: 1, minWidth: 200 }}>
                  <InputLabel id="data-source-select-label">
                    Select Data Source
                  </InputLabel>
                  <Select
                    label="Select Data Source"
                    value={selectedDataSource}
                    onChange={handleChangeDataSource}
                  >
                    <MenuItem value="live">Live Data</MenuItem>
                    <MenuItem value="readHistory">Read History</MenuItem>
                  </Select>
                </FormControl>
                {selectedDataSource === "readHistory" && (
                  <>
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
                    <Tooltip title="Delete History">
                      <IconButton
                        sx={{
                          mr: 1,
                          ml: 1,
                          borderRadius: "10px",
                          border: "1px solid #e5e5e5",
                        }}
                        onClick={handleOpenDialog}
                      >
                        <FaRegTrashAlt fontSize={"25px"} color="red" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}{" "}
              </Grid>

              {selectedDataSource === "live" ? (
                <Graph serialData={serialData} />
              ) : (
                <GraphSDCard data={filteredData} />
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default CardList;
