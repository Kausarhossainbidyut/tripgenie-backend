"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultipleImgBB = exports.uploadSingleImgBB = void 0;
const multer_1 = __importDefault(require("multer"));
const http_errors_1 = __importDefault(require("http-errors"));
const imgbb_1 = require("../utils/imgbb");
// Memory storage for imgBB uploads
const memoryStorage = multer_1.default.memoryStorage();
const imgbbUpload = (0, multer_1.default)({
    storage: memoryStorage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type. Only images allowed for imgBB'));
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB (imgBB free limit is 32MB)
});
// Single file upload to imgBB
const uploadSingleImgBB = (fieldName) => {
    return (req, res, next) => {
        imgbbUpload.single(fieldName)(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                return next((0, http_errors_1.default)(400, err.message));
            if (!req.file)
                return next((0, http_errors_1.default)(400, 'No file uploaded'));
            try {
                // Convert buffer to base64
                const base64Image = req.file.buffer.toString('base64');
                const result = yield (0, imgbb_1.uploadToImgBB)(base64Image, req.file.originalname);
                req.fileInfo = {
                    url: result.url,
                    delete_url: result.delete_url,
                    thumb_url: result.thumb_url,
                    filename: req.file.originalname,
                    size: req.file.size,
                    mimetype: req.file.mimetype
                };
                next();
            }
            catch (error) {
                next((0, http_errors_1.default)(500, 'imgBB upload failed'));
            }
        }));
    };
};
exports.uploadSingleImgBB = uploadSingleImgBB;
// Multiple files upload to imgBB
const uploadMultipleImgBB = (fieldName, maxCount = 5) => {
    return (req, res, next) => {
        imgbbUpload.array(fieldName, maxCount)(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                return next((0, http_errors_1.default)(400, err.message));
            if (!req.files || !Array.isArray(req.files))
                return next((0, http_errors_1.default)(400, 'No files uploaded'));
            try {
                const files = req.files;
                const uploadPromises = files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                    const base64Image = file.buffer.toString('base64');
                    return yield (0, imgbb_1.uploadToImgBB)(base64Image, file.originalname);
                }));
                const results = yield Promise.all(uploadPromises);
                req.filesInfo = {};
                req.filesInfo[fieldName] = results.map((result, index) => ({
                    url: result.url,
                    delete_url: result.delete_url,
                    thumb_url: result.thumb_url,
                    filename: files[index].originalname,
                    size: files[index].size,
                    mimetype: files[index].mimetype
                }));
                next();
            }
            catch (error) {
                next((0, http_errors_1.default)(500, 'imgBB upload failed'));
            }
        }));
    };
};
exports.uploadMultipleImgBB = uploadMultipleImgBB;
