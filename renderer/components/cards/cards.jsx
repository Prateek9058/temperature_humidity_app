import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { Avatar } from "@mui/material";
import Graph from "./graph";
import Image from "next/image";
import Thermometer from '../../public/images/thermometer1.svg'
import Battery from '../../public/images/battery1.svg'
import Humidity from '../../public/images/humidity1.svg'

const CardList = ({ data,readSDcard }) => {
  const cardData = [
    {
      id: 1,
      title: "Current temperature",
      value: `${data?.Temp} °C`,
      icon: Thermometer,
    },
    {
      id: 2,
      title: "Current humidity",
      value: `${data?.Humi} %`,
      icon: Humidity,
    },
    {
      id: 3,
      title: "Battery",
      value: `${data?.batt} %`,
      icon: Battery,
    },
  ];

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
                        {data?.value?data?.value:"--"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Graph Section */}
      <Grid item xs={12} md={8}>
        <Grid
          container
          sx={{ backgroundColor: "#fff", borderRadius: "15px" }}
          p={0.5}
          height={"400px"}
        >
          <Graph data={readSDcard}/>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default CardList;
