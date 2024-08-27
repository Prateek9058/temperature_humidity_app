import React from "react";
import { Divider, Grid } from "@mui/material";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const Graph = ({ data }) => {
  const timeLabels = data?.map((item) => item?.t);
  const temperatureData = data?.map((item) => item?.Temp);
  const HumidityData = data?.map((item) => item?.Humi);

  const chartData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Temperature",
        data: temperatureData,
        backgroundColor: "rgba(247, 187, 187, .2)", 
        borderColor: "#2D9CDB",
        borderWidth: 3,
        pointHoverRadius: 10,
      },
      {
        label: "Humidity",
        data: HumidityData,
        backgroundColor: "rgba(247, 187, 187, .2)", 
        borderColor: "#FF5B5B",
        borderWidth: 3,
        pointHoverRadius: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
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
          pointStyle: "",
          usePointStyle: true,
          textAlign: "left",
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
      <Line
        data={chartData}
        width={"400px"}
        height={112}
        options={options}
      />
    </Grid>
  );
};

export default Graph;
