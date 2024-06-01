import multer from 'multer';
// cb stands for callback
// we are using diskstorage instead of memory storage because the mermory storage is not efficient for large files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/temp')
    },              // destination where the file will be stored    
    filename: (req, file, cb) => {
        //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        // cb(null, file.fieldname + '-' + uniqueSuffix)
        cb(null, file.originalname)
        // you should not use original name because it can be same for multiple files so that can cause a overwrite problem
        // but since this is for a short time we can use it
    }               // filename of the file
})

// export const upload = multer({ storage: storate })
export const upload = multer({ storage}) // as we are using ES6 we can use this
// destination: (req, file, func) => {
//     func(null, 'tmp/my-uploads');
// }


/*
User Hits the Upload Route:

The user submits a form to upload a file. This form sends a POST request to the /upload route on the server.
Middleware (upload.single('myFile')):

The upload.single('myFile') middleware is called. This middleware is responsible for handling the file upload.
'myFile' is the name of the form field that contains the file.
Multer Storage Configuration:

The upload middleware is created using Multer with a specific storage configuration.
This storage configuration is set up using multer.diskStorage.
multer.diskStorage Function:

This function creates a storage engine with two properties: destination and filename.
Destination Property:

javascript
Copy code
destination: (req, file, cb) => {
    cb(null, 'tmp/my-uploads');
}
This function determines the directory where the uploaded file will be stored.
It takes three arguments: req (request object), file (file object), and cb (callback function).
The callback function cb is called with null (indicating no error) and the directory path 'tmp/my-uploads'.
Filename Property:

javascript
Copy code
filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
}
This function determines the name of the uploaded file.
It takes three arguments: req (request object), file (file object), and cb (callback function).
The callback function cb is called with null (indicating no error) and a unique filename. The filename is generated using the original field name of the file and a unique suffix (current timestamp + random number).
File Storage:

Multer uses the provided storage configuration to save the file to the specified directory with the generated unique filename.
Route Handling:

After the file is saved, the control moves to the next middleware in the route handler.
javascript
Copy code
(req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.status(200).send(`File uploaded successfully: ${req.file.filename}`);
}
This middleware checks if a file was uploaded by verifying req.file.
If no file is found, it responds with a 400 status code and an error message.
If a file is found, it responds with a 200 status code and a success message, including the filename of the uploaded file.
Complete Example with Explanation
Here's the complete code with comments explaining each part:

javascript
Copy code
const express = require('express');
const multer = require('multer');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Set the destination folder for uploaded files
        cb(null, 'tmp/my-uploads');
    },
    filename: (req, file, cb) => {
        // Generate a unique filename for each uploaded file
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

// Initialize multer with the defined storage configuration
const upload = multer({ storage: storage });

// Serve the HTML form for file upload
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle file upload via POST request
app.post('/upload', upload.single('myFile'), (req, res) => {
    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    // Respond with success message and filename
    res.status(200).send(`File uploaded successfully: ${req.file.filename}`);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
HTML Form for File Upload (index.html)
html
Copy code
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Upload</title>
</head>
<body>
    <h1>Upload a File</h1>
    <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="myFile" />
        <button type="submit">Upload</button>
    </form>
</body>
</html>
Summary of the Working
Form Submission: User submits the form, triggering a POST request to /upload.
Middleware: upload.single('myFile') middleware processes the file upload using Multer.
Storage Configuration:
destination: Specifies the directory (tmp/my-uploads) for saving files.
filename: Generates a unique filename using the original field name and a unique suffix.
File Storage: Multer saves the file in the specified directory with the generated filename.
Route Handling: The route handler checks if the file was uploaded and responds accordingly.
This sequence ensures that the file is uploaded, stored in the designated location, and a response is sent back to the user confirming the upload.

destination: (req, file, cb) => {
    cb(null, 'tmp/my-uploads');
}

from where are we getting this req,cb we arent apassign it  
ChatGPT
In the multer.diskStorage configuration, the destination function receives three parameters: req, file, and cb (callback function). These parameters are provided by Multer when it calls the destination function internally during the file upload process.

Here's a breakdown of each parameter:

req: The req parameter is the HTTP request object. It contains information about the incoming request, such as headers, query parameters, and form data.

file: The file parameter represents the uploaded file. It includes information about the file, such as its original name, size, and MIME type.

cb: The cb parameter is a callback function that you must call to indicate where the uploaded file should be stored. It follows the Node.js convention of (error, destination) where error is null if there is no error, and destination is the path where the file should be stored.

When Multer calls the destination function, it provides these parameters to allow you to customize the destination directory based on the request or file information. In this case, the destination function simply specifies the directory where the file should be stored ('tmp/my-uploads').
*/