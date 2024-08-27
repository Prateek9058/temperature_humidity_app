"use client";
import { Button, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import Table from "./table";
import { useSearchParams } from "next/navigation";

const Page = ({ReadHistory,readSDcard,ClearHistory}) => {
  const [page, setPage] = React.useState(0);
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState(null);
 
  return (
    <Grid container rowGap={2} sm={12} md={12}>
      <Table
        data={readSDcard}
        ReadHistory={ReadHistory}
        ClearHistory={ClearHistory}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        page={page}
        setPage={setPage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        loading={loading}
      />
    </Grid>
  );
};
export default Page;
