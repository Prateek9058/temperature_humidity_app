import React, { useEffect, useState } from "react";
import {
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Stack,
  Box,
} from "@mui/material";
import CardContent from "../components/cards/cards";
import CustomTableContent from "../components/table/index";
import { ThemeProvider } from "@emotion/react";
import { baselightTheme } from "../utils/theme/DefaultColors";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Title } from "chart.js";

const Index = () => {
  const [ports, setPorts] = useState([]);
  const [error, setError] = useState("");
  const [defaultValue, setDefaultValue] = useState(null);
  const [selectComp, setSelectComp] = useState(null);
  const [serialData, setSerialData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDisConnected, setIsDisConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readSDcard, setReadSDcard] = useState([]);
  const [data, setData] = useState(null);

  console.log("slectcom", selectComp);
  const handleChangeComp = async (event, path) => {
    if (event) {
      await DisConnected(event);
      setSelectComp(event);
      if (event !== selectComp) {
        Connected(event);
        setReadSDcard([])
      }
    }
    if (isConnected === false) {
    }
  };

  const fetchPorts = async () => {
    try {
      const response = await window.ipc.listPorts("list-ports");

      setPorts(response);
      console.log(" fetch response ", response);
    } catch (err) {
      setError("Failed to fetch serial ports");
     
    }
  };

  console.log("defalue", defaultValue);

  const AutoConnected = async () => {
    console.log("path", selectComp);
    try {
      const response = await window.ipc.listPorts("list-ports");
      console.log("port", response);
      let result;
      if (response && response.length > 0) {
        const portToConnect = response[0];
        setSelectComp(portToConnect?.path);
        const baudRate = 115200;
        result = await window?.ipc?.openPort({
          path: portToConnect?.path,
          baudRate,
        });
      }

      console.log("response", result);

      if (result === true) {
        console.log("Port opened successfully");
        toast.success("Port opened successfully")
        window.ipc.triggerNotification("Port Status", "Port opened successfully");
        setIsConnected(true);
        setIsDisConnected(true);
        window?.ipc?.onSerialData((data) => {
          try {
            const parsedData1 = JSON.parse(data);
            console.log("Received serial data:", parsedData1);
            setSerialData(parsedData1);
          } catch (error) {
            console.error("Failed to parse JSON data:", error);
          }
        });
      }
    } catch (err) {
      console.log(err, "error");
      setError("Failed to open port");
    }
  };
  const Connected = async (path1) => {
    console.log("path1", path1);
    try {
      const baudRate = 115200;
      const result = await window?.ipc?.openPort({
        path: path1,
        baudRate,
      });


      console.log("response", result);

      if (result === true) {
        console.log("Port opened successfully");
        toast.success(`Port opened successfully at ${path1}`)
        setIsConnected(true);
        setIsDisConnected(true);
        window?.ipc?.onSerialData((data) => {
          try {
            const parsedData1 = JSON.parse(data);
            console.log("Received serial data:", parsedData1);
            setSerialData(parsedData1);
          } catch (error) {
            console.error("Failed to parse JSON data:", error);
          }
        });
      }
    } catch (err) {
      console.log(err, "error");
      setError("Failed to open port");
      toast.error(`Failed to open port at ${path1}`)
    }
  };

  const DisConnected = async (event) => {
    try {
      const result = await window.ipc.closePort("close-port");
      console.log("dissco", result);
      if (result) {
        // setSelectComp(null);
        setIsConnected(false);
        setIsDisConnected(true);
        toast.success(`${selectComp} Port close successfully`)

      }
    } catch (err) {
      setError("Failed to close port");
      toast.error(`${event} Failed to close port`)
    }
  };

  const ReadHistory = async (data) => {
    setLoading(true);
    try {
      const result = await window.ipc.readData({ data });

      if (result.success) {
        const newData = result.message;

        const dataArray = [];
        const startIndex = newData.indexOf("start");

        if (startIndex !== -1) {
          const dataSegment = newData.substring(startIndex + 5).trim();
          const dataLines = dataSegment.split("\n");

          dataLines.forEach((line) => {
            if (line.trim() !== "") {
              try {
                const parsedData = JSON.parse(line);
                dataArray.push(parsedData);
              } catch (error) {
                console.error("Failed to parse JSON data:", error, line);
              }
            }
          });
        }

        setReadSDcard(dataArray);
      } else {
        console.error("Error in response:", result.message);
      }
    } catch (error) {
      console.error(
        "Error invoking read-data:",
        JSON.stringify(error, null, 2)
      );
      toast.error(`Error invoking read-data:`)
    } finally {
      toast.success(`Data fetching successfully`)
      setLoading(false);
    }
  };

  const ClearHistory = async (data) => {
    setLoading(true);
    try {
      const result = await window.ipc.clearData({ data });
      if (result.success) {
        setReadSDcard([]);
        toast.success(`clearing data`)
      } else {
        console.error("Error in response:", result.message);
      }
    } catch (error) {
      console.error(
        "Error invoking clear-data:",
        JSON.stringify(error, null, 2)
        
      );
      toast.error(`Error invoking clear-data:`)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    AutoConnected();
  }, []);
  useEffect(() => {
    fetchPorts();
  }, []);

  return (
    <ThemeProvider theme={baselightTheme}>
      <ToastContainer/>
      <CssBaseline />
      <Grid container>
        <Grid
          container
          alignItems="center"
          justifyContent={"space-between"}
          padding={1}
          sx={{ backgroundColor: "#24AE6E" }}
        >
          <Typography variant="h4" p={1} color={"#fff"}>
            HAL-Temperature-Humidity
          </Typography>
        </Grid>
        <Grid container justifyContent={"center"} mt={1}>
          <Grid item xs={12} sm={6} md={4}>
            {ports?.length > 0 && (
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  Select Com Port
                </InputLabel>
                <Select
                  label="Select Com Port"
                  InputLabelProps={{ shrink: true }}
                  value={selectComp || ports[0]?.friendlyName}
                  onChange={(e) => {
                    handleChangeComp(e.target.value);
                  }}
                  onOpen={fetchPorts}
                >
                  {ports &&
                    ports?.map((item, index) => (
                      <MenuItem key={index} value={item?.path}>
                        {item?.friendlyName}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
            {ports?.length === 0 && (
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  Select Com Port
                </InputLabel>
                <Select
                  label="Select Com Port"
                  InputLabelProps={{ shrink: true }}
                  value={selectComp }
                  onChange={(e) => {
                    handleChangeComp(e.target.value);
                  }}
                  onOpen={fetchPorts}
                >
                  {ports &&
                    ports?.map((item, index) => (
                      <MenuItem key={index} value={item?.path}>
                        {item?.friendlyName}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          </Grid>
          {/* <Button
            variant="contained"
            sx={{ ml: 3 }}
            onClick={Connected}
            disabled={isConnected}
          >
            Connect
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ ml: 3 }}
            onClick={DisConnected}
          >
            Disconnect
          </Button> */}
        </Grid>

        <CardContent data1={serialData} readSDcard={readSDcard} />
        <CustomTableContent
          ReadHistory={ReadHistory}
          readSDcard={readSDcard}
          ClearHistory={ClearHistory}
          loading={loading}
        />
      </Grid>
      <footer
        style={{
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#24AE6E",
          color: "#fff",
          fontSize: "15px",
        }}
      >
        Developed by PsiBorg technologies
      </footer>
    </ThemeProvider>
  );
};

export default Index;
