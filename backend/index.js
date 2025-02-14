import express from "express";
import router from "./routes/userRoute.js"
import academicRouter from "./routes/academicRout.js";
import jobPortalRouter from "./routes/jobPortalRout.js";
import mongoose from "mongoose";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";

// db connection
import connectDB from "./utils/DbConnection.js";
dotenv.config()
connectDB()
const PORT = process.env.PORT || 8000

const app = express()

// middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())


app.use("/api/users",router)
app.use("/api/academics",academicRouter)
app.use("/api/jobDetail",jobPortalRouter)

app.listen(PORT,()=>console.log(`server started at PORT : ${PORT}...`))