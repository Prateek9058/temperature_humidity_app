import React from "react";
import Image from "next/image";
import NOdata from '../../public/images/Nodata.svg'
import {
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TablePagination,
  TableRow,
  Paper,
  TableHead,
  Box,
  Grid,
  Typography,
} from "@mui/material";

const index = ({
  rows,
  page,
  columns,
  setPage,
  setRowsPerPage,
  rowsPerPage,
  count,
  loading,
}) => {
  const handleChangePage = (
    event,
    newPage
  ) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (
    event
  ) => {
    setRowsPerPage(+event.target.value);
  };
console.log("rows",rows?.length)
  return (
    <TableContainer  sx={{ borderRadius:"0px 0px 16px 16px",overflowX: "auto"}}>
      <Table aria-label="custom pagination table">
        <TableHead sx={{backgroundColor:"red"}}>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell
                key={index}
                align={
                  index === 0
                    ? "left"
                    : index === columns.length - 1
                      ? "center"
                      : "center"
                }
                sx={{ 
                  whiteSpace: 'nowrap',
                  fontSize: '16px', 
                  color: "#fff", 
                  backgroundColor:"#24AE6E"
                }}

              >
                <strong>{column}</strong>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows?.map((row, i) => (
            <TableRow
              key={i}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
                overflow: "hidden",
              }}
            >
              {Object.values(row)?.map((ele, ind) => (
                <TableCell
                  key={ind}
                  align={
                    ind === 0
                      ? "left"
                      : ind === Object.values(row).length - 1
                        ? "center"
                        : "center"
                  }
                  component="th"
                  scope="row"
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '200px', // Adjust max width as needed
                  }}
                >
                  {!Array.isArray(ele) ? (
                    ele
                  ) : (
                    <Box>{ele?.map((btn) => btn)}</Box>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          {!loading && rows?.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 200, // Adjust height as needed
                  }}
                >
                  <Grid
                    container
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Image src={NOdata} alt="nodata"  height={500} width={500}/>
                  </Grid>
                </Box>
              </TableCell>
            </TableRow>
          )}
          {/* <TableRow>
            <TablePagination 
              page={page}
              count={count}
              rowsPerPageOptions={[
                10,
                25,
                50,
                100,
                200,
                { label: "All", value: 10000 },
              ]}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableRow> */}
        </TableFooter>
      </Table>
    </TableContainer>
  );
};

export default index;
