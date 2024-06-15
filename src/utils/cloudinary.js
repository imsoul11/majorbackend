import {v2 as cloudinary} from 'cloudinary'
// our process to upload file will be a two step process
// first we will have it on our server, we will create an route for it to serve an api and then we will upload it to cloudinary
// that why we are using fs module to read the file from the server,which basically means we will have the file uploaded from frontend in the public folder here and then we will upload to cloudinary
import fs from 'fs'
// fs is filesystem module in node.js
// it helps in reading and writing files

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async (localfilepath) => {
    try {
        if(!localfilepath){
            fs.unlinkSync(localfilepath)
            return null
        }
        const response= await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto",
        })

        // here you get the response url which you can use to basically store in the database/ and sent to the database
        console.log("File uploaded successfully ot the url",response.url)
        fs.unlinkSync(localfilepath)
        return response
    }catch(error){
        fs.unlinkSync(localfilepath)
        // remove the locally saved temporary file if it fails to upload to cloudinary
        return null
    }
}

export {uploadOnCloudinary}