// require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { DB_NAME } from './constants.js';
import connectDB from './db/index.js';

dotenv.config({
    path:'./env'
})

connectDB()






//Approach1
// import express from 'express'
// const app = express()

// ;(async ()=>{
//     try{
//       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) // This line connect the database
//       app.on('error',(err)=>{
//         console.log('there is an error in connecting express to database \n',err)
//         throw err
//       }) //to check whether the express is connecting to the database or not

//       app.listen(process.env.PORT,()=>{
//         console.log(`App is listening on port ${process.env.PORT}`)
//       })
//     }
//     catch(e)
//     {
//        console.log(e)
//        throw e
//     }
// })()