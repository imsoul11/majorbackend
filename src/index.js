// in this file we are basically connecting the express to the database and then we are listening to the port


// require('dotenv').config({path:'./env'}) old way of importing dotenv
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { DB_NAME } from './constants.js';
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({
    path:'./.env'
})

connectDB() // whenever a asynchronous methoos is called it returns a promise so we can use then and catch
.then(()=>{
    try{
        app.listen(process.env.PORT || 8000,()=>{
            console.log(` Server is running on port: ${process.env.PORT}`)
        })
    }
    catch(e){
        console.log('There was an error in listening via express\n',e)
    }
    
})
.catch((err)=>{
    console.log('MONGO db connection failed !!',err)
})




//Approach1
// import express from 'express'
// const app = express() this is a factory function which creates an express application
// ;(async ()=>{               iife function which is called immediately after its declaration
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