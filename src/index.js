import "dotenv/config";

import connectDB from "./db/index.js";

connectDB();

//Connect to MongoDB through mongoose with IIFFEs function
//IIFEs - Immediately Invoked Function Expressions
/*
import express from "express";
const app = express();
(async () => {
    try {
        await mongoose.connect(`${URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.log("Hi, Faisal mongoose connection error: ", error);
            throw error;
        });
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("ERROR: ", error);
        throw error;
    }
})();
*/
