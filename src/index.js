import "dotenv/config";
const PORT = process.env.PORT || 5000;
import express from "express";
import connectDB from "./db/index.js";

const app = express();

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log("Error in connecting to DB: ", error);
    });
