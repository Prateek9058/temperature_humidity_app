import React from "react";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import { DialogTitle } from "@mui/material";
import Typography from "@mui/material/Typography";
// **  component
import CancelAlertDialog from "./confirmation-dialog";




const CommonDialog = ({
  message,
  title,
  onClose,
  children,
  titleConfirm,
  ...otherProps
}) => {
  return (
    <Dialog onClose={onClose} {...otherProps}>
      <DialogTitle
        sx={{
          backgroundColor: (theme) => theme.palette.primary.main,
        }}
      >
        {onClose ? (
          <CancelAlertDialog
            icon={true}
            message={message}
            title={titleConfirm}
            handleCloseFirst={onClose}
          />
        ) : null}
        <Typography variant="subtitle1" color="primary.contrastText">
          {title}
        </Typography>
      </DialogTitle>
      {children}
    </Dialog>
  );
};

export default CommonDialog;
