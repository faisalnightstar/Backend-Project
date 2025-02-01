import "dotenv/config";
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.URI}/${DB_NAME}`
        );
        console.log(
            `\nMongoDB is connected !! DB Host: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.error("Hi Faisal, Its mongodb connection Error: ", error);
        process.exit(1); //Exit process with failure and 1 means failure, 0 means success. it should on use in development mode. for production mode use process.on('SIGTERM)
    }
};

export default connectDB;
