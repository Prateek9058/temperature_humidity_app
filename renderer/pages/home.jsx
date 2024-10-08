import React, { useEffect, useState } from "react";
import {
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";
import CardContent from "../components/cards/cards";
import CustomTableContent from "../components/table/index";
import { ThemeProvider } from "@emotion/react";
import { baselightTheme } from "../utils/theme/DefaultColors";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer, toast } from "react-toastify";
import Logo from "../public/images/HAL-logo 1.png";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

const Index = () => {
  const [ports, setPorts] = useState([]);
  const [error, setError] = useState("");
  const [selectComp, setSelectComp] = useState(null);
  const [serialData, setSerialData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDisConnected, setIsDisConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readSDcard, setReadSDcard] = useState([]);

  const handleChangeComp = async (event, path) => {
    if (event) {
      await DisConnected(event);
      setSelectComp(event);
      if (event !== selectComp) {
        Connected(event);
        setReadSDcard([]);
      }
    }
    if (isConnected === false) {
    }
  };
  const [currentPort, setCurrentPort] = useState(null);

  const fetchPorts = async () => {
    try {
      const response = await window.ipc.listPorts("list-ports");
      console.log("Response from fetchPorts:", response);
      if (response.length === 0) {
        toast.info(
          "Port disconnected. Waiting for 5 seconds before establishing the connection..."
        );
      }
      if (response.length > 0) {
        const firstAvailablePort = response[0]?.path;
        setSelectComp(firstAvailablePort);

        if (currentPort && currentPort.isOpen) {
          console.log(
            `Current port ${currentPort.path} is open. Closing it first...`
          );

          await new Promise((resolve, reject) => {
            currentPort.close((err) => {
              if (err) {
                console.error("Failed to close the port:", err.message);
                reject(err);
              } else {
                console.log(`Port ${currentPort.path} closed successfully`);
                setCurrentPort(null);
                resolve();
              }
            });
          });
        }
        await Connected(firstAvailablePort);
        setCurrentPort({ path: firstAvailablePort, isOpen: true });
      }
      setPorts(response);
      console.log("Updated ports:", response);
    } catch (err) {
      console.error("Error fetching serial ports:", err);
      setError("Failed to fetch serial ports");
    }
  };

  useEffect(() => {
    const initializePorts = async () => {
      await AutoConnected();
      await fetchPorts();
    };
    initializePorts();
    const interval = setInterval(fetchPorts, 5000);
    return () => clearInterval(interval);
  }, []);

  const AutoConnected = async () => {
    try {
      const response = await window.ipc.listPorts("list-ports");
      if (response.length > 0) {
        const portToConnect = response[0]?.path;
        if (
          currentPort &&
          currentPort.isOpen &&
          currentPort.path === portToConnect
        ) {
          console.log(
            `Current port ${currentPort.path} is already open. No action needed.`
          );
          return;
        }

        if (currentPort && currentPort.isOpen) {
          console.log(
            `Current port ${currentPort.path} is open. Closing it first...`
          );
          toast.info(
            "Disconnected from port. After connect port Wait for 5 seconds to reconnect..."
          );
          await new Promise((resolve, reject) => {
            currentPort.close((err) => {
              if (err) {
                console.error("Failed to close the port:", err.message);
                reject(err);
              } else {
                console.log(`Port ${currentPort.path} closed successfully`);
                setCurrentPort(null);
                resolve();
              }
            });
          });
        }

        const baudRate = 115200;
        const result = await window.ipc.openPort({
          path: portToConnect,
          baudRate,
        });

        if (result === true) {
          console.log(`Successfully opened port ${portToConnect}`);
          setCurrentPort({ path: portToConnect, isOpen: true });
          setIsConnected(true);
          setIsDisConnected(false);

          window.ipc.onSerialData((data) => {
            try {
              const parsedData = JSON.parse(data);
              console.log("Received serial data:", parsedData);
              setSerialData(parsedData);
            } catch (error) {
              console.error("Failed to parse JSON data:", error);
            }
          });
          toast.success("Port opened successfully");
        } else {
          console.error(`Failed to open port ${portToConnect}: Access denied`);
          setError("Failed to open port");
        }
      } else {
        console.log("No available ports found.");
      }
    } catch (err) {
      console.error("An error occurred during auto-connect:", err);
      setError("Failed to connect to port");
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
      if (result === true) {
        console.log("Port opened successfully");
        toast.success(`Port opened successfully at ${path1}`);
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
      toast.error(`Failed to open port at ${path1}`);
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
        toast.success(`${selectComp} Port close successfully`);
      }
    } catch (err) {
      setError("Failed to close port");
      toast.error(`${event} Failed to close port`);
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
      toast.error(`Error invoking read-data:`);
    } finally {
      toast.success(`Data fetching successfully`);
      setLoading(false);
    }
  };

  const ClearHistory = async (data) => {
    setLoading(true);
    try {
      const result = await window.ipc.clearData({ data });
      if (result.success) {
        setReadSDcard([]);
        toast.success(`clearing data`);
      } else {
        console.error("Error in response:", result.message);
      }
    } catch (error) {
      console.error(
        "Error invoking clear-data:",
        JSON.stringify(error, null, 2)
      );
      toast.error(`Error invoking clear-data:`);
    } finally {
      setLoading(false);
    }
  };
  const handleReload = () => {
    window.ipc.reloadApp();
  };

  const imageStyle = {
    borderRadius: "10px",
    border: "1px solid #fff",
  };
  return (
    <ThemeProvider theme={baselightTheme}>
      <ToastContainer />
      <CssBaseline />
      <Grid container>
        <Grid
          container
          alignItems="center"
          justifyContent={"space-between"}
          padding={1}
          sx={{ backgroundColor: "#24AE6E" }}
        >
          <Grid item display={"flex"} alignItems={"center"}>
            <Image
              src={Logo}
              alt="logo"
              height={50}
              width={80}
              style={imageStyle}
            />
            <Typography variant="h4" p={1} color={"#fff"}>
              HAL-Temperature-Humidity
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {ports?.length > 0 && (
              <FormControl fullWidth>
                <InputLabel
                  id="demo-simple-select-label"
                  sx={{
                    color: "#fff",
                    "&.Mui-focused": {
                      color: "#000",
                    },
                  }}
                >
                  Select Com Port
                </InputLabel>
                <Select
                  label="Select Com Port"
                  InputLabelProps={{ shrink: true }}
                  value={selectComp || ports[0]?.friendlyName}
                  onChange={(e) => {
                    handleChangeComp(e.target.value);
                  }}
                  sx={{
                    color: "#fff",
                    "& .MuiSelect-icon": {
                      color: "#fff",
                    },
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
              // <FormControl fullWidth>
              //   <InputLabel
              //     id="demo-simple-select-label"
              //     sx={{
              //       color: "#fff",
              //       "&.Mui-focused": {
              //         color: "#000",
              //       },
              //     }}
              //   >
              //     Select Com Port
              //   </InputLabel>
              //   <Select
              //     label="Select Com Port"
              //     InputLabelProps={{ shrink: true }}
              //     value={selectComp}
              //     onChange={(e) => {
              //       handleChangeComp(e.target.value);
              //     }}
              //     sx={{
              //       color: "#fff",
              //       "& .MuiSelect-icon": {
              //         color: "#fff",
              //       },
              //     }}
              //     onOpen={fetchPorts}
              //   >
              //     {ports &&
              //       ports?.map((item, index) => (
              //         <MenuItem key={index} value={item?.path}>
              //           {item?.friendlyName}
              //         </MenuItem>
              //       ))}
              //   </Select>
              // </FormControl>
              ""
            )}
          </Grid>
        </Grid>
        <Grid container justifyContent={"center"} p={2}>
          <CardContent
            ReadHistory={ReadHistory}
            data1={serialData}
            readSDcard={readSDcard}
            serialData={serialData}
            ports={ports}
          />
          <CustomTableContent
            ReadHistory={ReadHistory}
            readSDcard={readSDcard}
            ClearHistory={ClearHistory}
            loading={loading}
            ports={ports}
          />
        </Grid>
      </Grid>
      <footer
        style={{
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#24AE6E",
          color: "#fff",
          fontSize: "15px",
          padding: "8px",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h6"> Developed by PsiBorg Technologies</Typography>
        {/* <Typography variant="subtitle2">
          {" "}
          All Rights Reserved | © copyright
        </Typography> */}
      </footer>
    </ThemeProvider>
  );
};

export default Index;
