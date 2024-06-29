import multer, {Multer} from "multer";
import path from "path";
import {BadRequestError} from "../errors/customError";

export class MulterConfig {
    size: number
    multer: Multer

    constructor(fileType: "image" | "tabularDocument" = "image", size: number = 10 * 1024 * 1024,) {
        this.size = size;

        this.multer = multer({
            storage: multer.diskStorage({
                destination: (req, file, callback) => {
                    callback(null, path.join(process.cwd(), "/uploads"))
                },
                filename: function (req, file, cb) {
                    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                    cb(null, file.fieldname + "-" + uniqueSuffix + ".csv");
                },
            }),
            limits: {
                fileSize: this.size
            },
            fileFilter: function (req, file, callback) {
                let ext = path.extname(file.originalname);

                if (fileType == "tabularDocument" && ext !== '.csv') {
                    return callback(new BadRequestError('Only csv files are allowed'))
                }


                if (fileType == "image" && ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                    return callback(new BadRequestError('Only images are allowed'))
                }
                callback(null, true)
            },
        })
    }
}