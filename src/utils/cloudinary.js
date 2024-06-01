import {v2 as cloudinary} from 'cloudinary'
// our process to upload file will be a two step process
// first we will have it on our server, we will create an route for it to serve an api and then we will upload it to cloudinary
// that why we are using fs module to read the file from the server
import fs from 'fs'
// fs is filesystem module in node.js
// it helps in reading and writing files

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async (localfilepath) => {
    try {
        if(!localfilepath){
            return null
        }
        const response= await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto",
        })
        console.log("File uploaded successfully ot the url",response.url)
        return response
    }catch(error){
        fs.unlinkSync(localfilepath)
        // remove the locally saved temporary file if it fails to upload to cloudinary
        return null
    }
}

export {uploadOnCloudinary}