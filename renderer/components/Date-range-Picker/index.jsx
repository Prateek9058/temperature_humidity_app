"use client";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import { addDays, subDays, differenceInDays } from "date-fns";
import { Dialog ,InputAdornment,IconButton} from "@mui/material";
import { styled } from "@mui/material/styles";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(),
  },
}));
const defaultDateRange = {
  startDate: subDays(new Date(), 14),
  endDate: addDays(new Date(), 0),
  key: "selection",
};
const Calendar = ({ getDataFromChildHandler }) => {
  const [open, setOpen] = useState(false);
  const [fullWidth] = useState(true);
  const [maxWidth] = useState("md");
  const [state, setState] = useState([defaultDateRange]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOnChange = (ranges) => {
    const selection = ranges.selection;
    setState([selection]);
  };

  function getDates(startDate, endDate) {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;
      dates.push(dateString);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  useEffect(() => {
    const dates = getDates(state?.[0].startDate, state?.[0].endDate);
    let resultArray;

    if (dates.length === 1) {
      resultArray = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23,
      ];
    } else if (dates.length > 31) {
      resultArray = [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December",
      ];
    } else {
      resultArray = dates;
    }

    getDataFromChildHandler(state, resultArray);
  }, [state]);

  const isFutureDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  return (
    <>
      <input
        onClick={handleClickOpen}
        value={`${
          state?.[0].startDate
            ? dayjs(state?.[0].startDate).format("DD/MM/YYYY")
            : "dd/mm/yyyy"
        } - ${
          state?.[0].endDate
            ? dayjs(state?.[0].endDate).format("DD/MM/YYYY")
            : "dd/mm/yyyy"
        }`}
          style= {{
            borderRadius: "8px",
            padding: "9px 10px",
            width: "216px",
            height: "43px",
            fontWeight: "bold",
            fontSize: "14px",
            background: 'linear-gradient(111.41deg, rgba(255, 255, 255, 0.272) 0%, rgba(255, 255, 255, 0.068) 100%)',
            backgroundColor:"transparent",
            border: "1px solid #ddd",
            cursor: "pointer",
          }}
       
      />
   
      <BootstrapDialog
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        open={open}
        onClose={handleClose}
        PaperProps={{
          className: "SmallDialog",
        }}
      >
        <DateRangePicker
          onChange={handleOnChange}
          moveRangeOnFirstSelection={false}
          months={2}
          ranges={state}
          direction="horizontal"
          disabledDay={(date) => isFutureDate(date)}
        />
      </BootstrapDialog>
    </>
  );
};

Calendar.propTypes = {
  getDataFromChildHandler: PropTypes.func.isRequired,
};

export default Calendar;

