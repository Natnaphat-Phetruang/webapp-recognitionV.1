import React, { useState } from "react";
import { Box, Typography, Button, Grid, IconButton } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteIcon from "@mui/icons-material/Delete";

function Face() {
  const [images, setImages] = useState([]);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleUpload = () => {
    // Handle the upload logic here
    console.log("Uploading images:", images);
  };

  const handleAddMore = () => {
    // Trigger the file input click
    document.getElementById("file-input").click();
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f0f0f0",
        p: 3,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Upload Your Images
      </Typography>

      <Box
        sx={{
          border: "2px dashed #aaa",
          borderRadius: 2,
          width: "100%",
          maxWidth: 600,
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          backgroundColor: "#f9f9f9",
          p: 2,
          overflow: "auto",
        }}
      >
        {images.length === 0 ? (
          <Typography variant="subtitle1" color="textSecondary">
            No images uploaded yet.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {images.map((image, index) => (
              <Grid item xs={4} key={index}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: 100,
                    overflow: "hidden",
                    borderRadius: 1,
                  }}
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`upload-${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    onClick={() => handleRemoveImage(index)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      color: "#ffffff",
                      backgroundColor: "#ff0000",
                      "&:hover": {
                        backgroundColor: "#cc0000",
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <input
        type="file"
        id="file-input"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleImageChange}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 300,
          mt: 3,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={handleAddMore}
          sx={{
            backgroundColor: "#3f51b5",
            "&:hover": {
              backgroundColor: "#303f9f",
            },
          }}
        >
          Add more file
        </Button>

        <Button
          variant="contained"
          color="secondary"
          endIcon={<UploadIcon />}
          onClick={handleUpload}
          sx={{
            backgroundColor: "#f50057",
            "&:hover": {
              backgroundColor: "#c51162",
            },
          }}
        >
          Upload
        </Button>
      </Box>
    </Box>
  );
}

export default Face;
