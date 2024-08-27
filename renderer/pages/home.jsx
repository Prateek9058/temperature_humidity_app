import React, { useEffect, useState } from 'react';
import {
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Stack,
  Box
} from '@mui/material';
import CardContent from '../components/cards/cards';
import CustomTableContent from '../components/table/index';
import { ThemeProvider } from '@emotion/react'
import {baselightTheme} from '../utils/theme/DefaultColors'
import CssBaseline from '@mui/material/CssBaseline';

const Index = () => {
  const [ports, setPorts] = useState([]);
  const [error, setError] = useState('');
  const [selectComp, setSelectComp] = useState(null);
  const [serialData, setSerialData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDisConnected, setIsDisConnected] = useState(false);
  const [readSDcard, setReadSDcard] = useState([]);
  const [data, setData] = useState(null);

  const handleChangeComp = (event) => {
    setSelectComp(event.target.value);
  };

  const fetchPorts = async () => {
    try {
      const response = await window.ipc.listPorts('list-ports');
      setPorts(response);
    } catch (err) {
      setError('Failed to fetch serial ports');
    }
  };

  const Connected = async () => {
    console.log("path",selectComp)
    const baudRate = 115200;
    try {
      const result = await window?.ipc?.openPort({
        path: selectComp,
        baudRate,
      });
      console.log("response", result);

      if (result === true) {
        console.log("Port opened successfully");
        setIsConnected(true);
        setIsDisConnected(true);
        window?.ipc?.onSerialData((data) => {
          try {
            const parsedData = JSON.parse(data);
            console.log("Received serial data:", parsedData);
            setSerialData(parsedData);
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

  const DisConnected = async () => {
    try {
      const result = await window.ipc.closePort('close-port');
      if (result) {
        setSelectComp(null);
        setIsConnected(false);
        setIsDisConnected(true);
      }
    } catch (err) {
      setError('Failed to close port');
    }
  };

  const ReadHistory = async (data) => {
    try {
      const result = await window.ipc.readData({ data });
      if (result.success) {
        const newData = result.message;
        const dataArray = [];
        const startIndex = newData.indexOf('start');

        if (startIndex !== -1) {
          const dataSegment = newData.substring(startIndex + 5).trim();
          const dataLines = dataSegment.split('\n');

          dataLines.forEach((line) => {
            if (line.trim() !== '') {
              try {
                const parsedData = JSON.parse(line);
                dataArray.push(parsedData);
              } catch (error) {
                console.error('Failed to parse JSON data:', error, line);
              }
            }
          });
        }
        setReadSDcard(dataArray);
      } else {
        console.error('Error in response:', result.message);
      }
    } catch (error) {
      console.error('Error invoking read-data:', JSON.stringify(error, null, 2));
    }
  };

  const ClearHistory = async (data) => {
    try {
      const result = await window.ipc.clearData({ data });
      if (result.success) {
        setReadSDcard([]);
      } else {
        console.error('Error in response:', result.message);
      }
    } catch (error) {
      console.error('Error invoking clear-data:', JSON.stringify(error, null, 2));
    }
  };

  useEffect(() => {
    fetchPorts();
  }, []);

  return (
    <ThemeProvider theme={baselightTheme}>
      <CssBaseline/>
    <Grid container>
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        p={3}
        spacing={2}
        sx={{ backgroundColor: "#fff" }}
      >
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="h6">Select Com Port</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">
              Select Com Port
            </InputLabel>
            <Select
              label="Select Com Port"
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectComp}
             
              onChange={handleChangeComp}
            >
              {ports &&
                ports?.map((item, index) => (
                  <MenuItem key={index} value={item?.path}>
                    {item?.friendlyName}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={12} md={4} container justifyContent="flex-end">
          <Button
            variant="contained"
            disabled={!selectComp || isConnected}
            onClick={Connected}
            sx={{ mr: 2 }}
          >
            Connect
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!selectComp}
            onClick={DisConnected}
          >
            Disconnect
          </Button>
        </Grid>
      </Grid>

      <CardContent data={serialData}  readSDcard={readSDcard}  />
      <CustomTableContent ReadHistory={ReadHistory} readSDcard={readSDcard} ClearHistory={ClearHistory}/>
    </Grid>
    <footer style={{display:"flex" ,justifyContent:"center",backgroundColor:"#24AE6E" ,color:"#fff",fontSize:"15px"}}>Developed by PsiBorg technologies</footer>
    </ThemeProvider>
  );
};

export default Index;
