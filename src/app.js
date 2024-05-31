import express from 'express'
import cors from 'cors'
import cookieparser from 'cookie-parser'

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}
))
// we use app.use to use the middleware in the express
// cors is used to allow the request from the frontend to the backend
// origin is the url from which the request is coming
// credentials is used to allow the cookies to be set in the browser

app.use(express.json({limit:"16kb"}))
// to put a limit on the size of the file that can be recieved on the backend
app.use(express.urlencoded({extended:true,limit:"16kb"}))
// this to make ensure that the url is correctly interpreted like Hitesh choudhary when searched is encoded as  Hitesh%20choudhary in the url so to get it whe should decode it 
app.use(express.static("public"))
// to setup public folder because we have to serve the static files like images,css,js files 
// this is basically helphulf when deploying the project on apps like vercel as
/*
mproved Performance: Static files are typically cached by the browser, reducing the need to fetch them from the server on subsequent requests. This leads to faster loading times for your web application.
Simplified Deployment: When deploying your application to platforms like Vercel, the public directory is usually automatically served, making it easy to manage your static assets.
Enhanced Organization: Keeping static files separate from your application code promotes better code structure and maintainability.
*/
app.use(cookieparser())
// to edit and set cookies in user browser in a secure mode
// (err,req,res,next) is the signature of the middleware function
// err is the error that is passed to the middleware
// req is the request object
// res is the response object
// next is the next middleware function
// if the next is not called the request will be stuck at the middleware
// if the next is called the request will be passed to the next middleware

export { app }