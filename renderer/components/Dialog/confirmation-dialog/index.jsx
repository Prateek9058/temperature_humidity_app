import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
} from "@mui/material";
import { IoMdClose } from "react-icons/io";

export default function CustomizedDialogs({
  title,
  message,
  handleCloseFirst,
  icon,
}) {
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleCloseBoth = () => {
    setOpen(false);
    handleCloseFirst();
  };

  return (
    <div>
      {icon ? (
        <IconButton
          aria-label="close"
          onClick={handleClickOpen}
          size="small"
          sx={{
            color: (theme) => theme.palette.common.white,
            backgroundColor: "transparent",
            position: "absolute",
            right: 10,
            top: 10,
          }}
        >
          <IoMdClose />
        </IconButton>
      ) : (
        <Button variant="outlined" color="info" onClick={handleClickOpen}>
          Cancel
        </Button>
      )}

      <Dialog
        fullWidth={true}
        maxWidth={"xs"}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle
          sx={{
            backgroundColor: (theme) => theme.palette.error.main,
            position: "relative",
          }}
        >
          <Typography variant="h6" color="background.paper">
            {title}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            size="small"
            sx={{
              position: "absolute",
              right: 0,
              top: 0,
              color: (theme) => theme.palette.common.white,
              backgroundColor: (theme) => theme.palette.error.main,
            }}
          >
            <IoMdClose />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers className="dialog-content">
          <Typography variant="h6">{message}</Typography>
        </DialogContent>
        <DialogActions className="mt-5">
          <Button
            color="error"
            size="medium"
            variant="outlined"
            onClick={handleCloseBoth}
          >
            YES
          </Button>
          <Button
            color="info"
            size="medium"
            variant="outlined"
            onClick={handleClose}
          >
            NO
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
