import mongoose from "mongoose";

const Connection = mongoose.createConnection(process.env.MONGODB_URI!) 
export {Connection}