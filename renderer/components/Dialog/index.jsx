import React from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import { IoIosCloseCircleOutline } from "react-icons/io";
import Image from "next/image";
import DeletePic from "../../public/images/delete.svg";
import {Grid} from "@mui/material";

const CommonDialog = ({
  title = "Dialog Title",
  message = "Dialog Message",
  color = "primary",
  messageSize = "medium",
  onClose,
  onConfirm,
  bgcolor,
  icon = true,
  ...otherProps
}) => {
  return (
    <Dialog onClose={onClose} {...otherProps}>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
        }}
      >
        <IoIosCloseCircleOutline color="white" />
      </IconButton>
      <DialogTitle
        // sx={{
        //   backgroundColor: error,
        // }}
        bgcolor={bgcolor}
     
      >
        <Typography variant="h6" color={"white"}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {/* <Grid container mt={2} justifyContent={"center"} size={"grow"}>
          <Image src={DeletePic} alt="delete" />
        </Grid> */}

        {/* <Typography
          color="textPrimary"
          mt={2}
          variant="h4"
          textAlign={"center"}
        >
          Deleted Info
        </Typography> */}
        <Typography color="textPrimary" mt={2} textAlign={"center"}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions>
        {onConfirm && (
          <Button onClick={onConfirm} color={color} variant="contained">
            Confirm
          </Button>
        )}
        {onClose && (
          <Button onClick={onClose} color="inherit" variant="contained" sx={{color:"#000"}}>
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CommonDialog;
