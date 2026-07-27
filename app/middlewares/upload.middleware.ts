import multer from "multer"
import { application, Request } from "express"



const storage = multer.memoryStorage();


const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {

    const allowedMimeTypes = ["application/pdf", "text/csv", "text/plain", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type. Only PDF, CSV, and TXT files are allowed."))
    }

}

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024*1024*5}
})