import React, { useState, useEffect, useRef } from "react";
import { Grid } from "@mui/material";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const Graph = ({ serialData }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Temperature",
        data: [],
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Humidity",
        data: [],
        borderColor: "rgba(153,102,255,1)",
        backgroundColor: "rgba(153,102,255,0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  });

  const tempDataBuffer = useRef([]);
  const humiDataBuffer = useRef([]);
  const labelsBuffer = useRef([]);
  const updateCount = useRef(0); // Track updates (in seconds)

  useEffect(() => {
    const interval = setInterval(() => {
      if (tempDataBuffer.current.length > 0) {
        setChartData((prevChartData) => {
          const updatedLabels = [...prevChartData.labels, labelsBuffer.current[0]];
          const updatedTemperatureData = [...prevChartData.datasets[0].data, tempDataBuffer.current[0]];
          const updatedHumidityData = [...prevChartData.datasets[1].data, humiDataBuffer.current[0]];

          return {
            ...prevChartData,
            labels: updatedLabels,
            datasets: [
              {
                ...prevChartData.datasets[0],
                data: updatedTemperatureData,
              },
              {
                ...prevChartData.datasets[1],
                data: updatedHumidityData,
              },
            ],
          };
        });

        tempDataBuffer.current.shift();
        humiDataBuffer.current.shift();
        labelsBuffer.current.shift();
        updateCount.current++;

        // Reset the chart after 2 minutes (120 seconds)
        if (updateCount.current >= 120) {
          setChartData({
            labels: [],
            datasets: [
              {
                label: "Temperature",
                data: [],
                borderColor: "rgba(75,192,192,1)",
                backgroundColor: "rgba(75,192,192,0.2)",
                borderWidth: 2,
                tension: 0.4,
              },
              {
                label: "Humidity",
                data: [],
                borderColor: "rgba(153,102,255,1)",
                backgroundColor: "rgba(153,102,255,0.2)",
                borderWidth: 2,
                tension: 0.4,
              },
            ],
          });
          tempDataBuffer.current = [];
          humiDataBuffer.current = [];
          labelsBuffer.current = [];
          updateCount.current = 0; // Reset update count
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (serialData) {
      tempDataBuffer.current.push(serialData.Temp);
      humiDataBuffer.current.push(serialData.Humi);
      labelsBuffer.current.push(serialData.t);

      if (tempDataBuffer.current.length > 1200) tempDataBuffer.current.shift();
      if (humiDataBuffer.current.length > 1200) humiDataBuffer.current.shift();
      if (labelsBuffer.current.length > 1200) labelsBuffer.current.shift();
    }
  }, [serialData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        beginAtZero: true,
        display: true,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        align: "center",
        fullSize: true,
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  };

  return (
    <Grid container mt={3} mb={3}>
      <Line data={chartData} width={"400px"} height={112} options={options} />
    </Grid>
  );
};

export default Graph;
