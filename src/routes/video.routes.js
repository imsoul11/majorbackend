// import { Router } from "express";
// import { verifyJWT } from './../middlewares/auth.middleware.js';
// import { upload } from "../middlewares/multer.middleware.js";
// import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controllers.js";
// import { checkOwner } from "../middlewares/owner.middleware.js";
// import { Video } from "../models/video.model.js";

// const router = Router();
// router.use(verifyJWT); // every routes will be protected
// router.route("/")
//     .get(getAllVideos)
//     .post(upload.fields([
//         {
//             name: "videoFile",
//             maxCount:1
//         }, {
//             name: "thumbnail",
//             maxCount:1
//         }
//     ]),
//         publishAVideo
//     )

// router.route("/:videoId")
//     .get(getVideoById)
//     .all(checkOwner('videoId', Video))
//     .delete(deleteVideo)
//     .patch(upload.single("thumbnail"), updateVideo);

// router.route("/toggle/publish/:videoId").patch(togglePublishStatus);







// export default router;




// import { Router } from "express";
// import { verifyJWT } from './../middlewares/auth.middleware.js';
// import { upload } from "../middlewares/multer.middleware.js";
// import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
// import { checkOwner } from "../middlewares/owner.middleware.js";
// import { Video } from "../models/video.model.js";

// const router = Router();
// router.use(verifyJWT); // every routes will be protected
// router.route("/")
//     .get(getAllVideos)
//     .post(upload.fields([
//         {
//             name: "videoFile",
//             maxCount:1
//         }, {
//             name: "thumbnail",
//             maxCount:1
//         }
//     ]),
//         publishAVideo
//     )

// router.route("/:videoId")
//     .get(getVideoById)
//     .all(checkOwner('videoId', Video))
//     .delete(deleteVideo)
//     .patch(upload.single("thumbnail"), updateVideo);

// router.route("/toggle/publish/:videoId").patch(togglePublishStatus);







// export default router;


import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"
import {verifyjwt} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyjwt); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router


