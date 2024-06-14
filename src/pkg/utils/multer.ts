import multer, {Multer} from "multer";
import path from "path";

export class MulterConfig {
    size: number
    multer: Multer

    constructor( size: number = 10 * 1024 * 1024, fileType: "image" | "tabularDocument" = "image") {
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
                    return callback(new Error('Only csv files are allowed'))
                }


                if (fileType == "image" && ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                    return callback(new Error('Only images are allowed'))
                }
                callback(null, true)
            },
        })
    }
}