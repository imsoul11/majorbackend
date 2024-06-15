// In this file you are basically setting up the express server and setting up the middlewares
// there s a difference between the sending the request in formdata format and in raw format like when you send it int formdata format it basicaly waits for the file and then assign the req.body pasriable
import express from 'express'
import cors from 'cors'
import cookieparser from 'cookie-parser'

const app = express()

/*
The cors middleware function provided by the cors package allows you to configure various options to handle CORS requests in your Express application. The options you can configure include:

origin: This option specifies the origins (domains, protocols, and ports) from which you want to allow requests. You can set it to a specific origin (e.g., 'https://example.com'), an array of origins, or use a wildcard ('*') to allow requests from any origin. In your code, you're setting it to process.env.CORS_ORIGIN, which means the allowed origin(s) will be determined by an environment variable.
methods: This option allows you to specify the HTTP methods (e.g., GET, POST, PUT, DELETE) that should be allowed for cross-origin requests. If not specified, it defaults to allowing all methods.
allowedHeaders: This option allows you to specify the HTTP headers that should be allowed in cross-origin requests. If not specified, it defaults to allowing common headers like Origin, X-Requested-With, Content-Type, and others.
exposedHeaders: This option allows you to specify the HTTP headers that should be exposed to the client in cross-origin responses. If not specified, no headers are exposed.
credentials: This option allows you to specify whether or not to allow cookies to be included in cross-origin requests. Setting it to true allows cookies to be sent and received in cross-origin requests, while false (the default) means cookies are not included.
maxAge: This option allows you to specify the number of seconds for which the preflight response should be cached by the browser. A higher value can improve performance by reducing the number of preflight requests.
optionsSuccessStatus: This option allows you to specify the status code to be used for successful OPTIONS requests. The default is 204 (No Content).

*/
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}
))
// so whenever an request is made from frontend this middleware will be called and the request will be allowed to pass through the middleware
// we use app.use to use the middleware in the express
// cors is used to allow the request from the frontend to the backend
// origin is the url from which the request is coming
// credentials is used to allow the cookies to be set in the browser
app.use((req,res,next)=>{
    // console.log('I am being called before expree.json')
    // console.log('req.body:',req.body)
    next()
})
app.use(express.json({limit:"16kb"}),(req,res,next)=>{
    next()
})

app.use((req,res,next)=>{
    // console.log('I am being after before expree.json')
    // console.log('req.body:',req.body)
    next()
})
// to put a limit on the size of the file that can be recieved on the backend
app.use(express.urlencoded({extended:true,limit:"16kb"}))

// this to make ensure that the url is correctly interpreted like Hitesh choudhary when searched is encoded as  Hitesh%20choudhary in the url so to get it whe should decode it 
app.use(express.static("public"))
/* Yes, that's correct. The express.static("public") middleware allows you to serve static files (like images) directly from your server's "public" directory. This means you can first upload the image to your server's "public" directory, and then you can use a separate service like Cloudinary to upload and manage the image.*/
// to setup public folder because we have to serve the static files like images,css,js files 
// this is basically helphulf when deploying the project on apps like vercel as
/*
mproved Performance: Static files are typically cached by the browser, reducing the need to fetch them from the server on subsequent requests. This leads to faster loading times for your web application.
Simplified Deployment: When deploying your application to platforms like Vercel, the public directory is usually automatically served, making it easy to manage your static assets.
Enhanced Organization: Keeping static files separate from your application code promotes better code structure and maintainability.
*/
app.use(cookieparser(),(req,res,next)=>{
    // console.log('I am being after  cookieparser.json')
    // console.log('req.body:',req.body)
    next()
})
// to edit and set cookies in user browser in a secure mode

// (err,req,res,next) is the signature of the middleware function
// err is the error that is passed to the middleware
// req is the request object
// res is the response object
// next is the next middleware function
// if the next is not called the request will be stuck at the middleware : very important
// if the next is called the request will be passed to the next middleware




// routes import
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import commentRouter from './routes/comment.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import likeRouter from './routes/like.routes.js'

// routes declaration 
app.use('/api/v1/users',userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/likes", likeRouter)
// http://localhost:8000/api/v1/users
// check you have to http or https in the url
export { app }





