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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUploadedFile = exports.uploadMultipleFiles = exports.uploadSingleFile = void 0;
// Upload controller
const uploadSingleFile = (req, res, next) => {
    try {
        if (!req.fileInfo)
            throw new Error('No file uploaded');
        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            file: req.fileInfo
        });
    }
    catch (err) {
        next(err);
    }
};
exports.uploadSingleFile = uploadSingleFile;
// Multiple files controller
const uploadMultipleFiles = (req, res, next) => {
    try {
        if (!req.filesInfo)
            throw new Error('No files uploaded');
        res.status(200).json({
            success: true,
            message: 'Files uploaded successfully',
            files: req.filesInfo
        });
    }
    catch (err) {
        next(err);
    }
};
exports.uploadMultipleFiles = uploadMultipleFiles;
// Delete uploaded file (for imgBB, use the delete_url from upload response)
const deleteUploadedFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Support both query params and body
        const delete_url = req.query.delete_url || ((_a = req.body) === null || _a === void 0 ? void 0 : _a.delete_url);
        if (!delete_url)
            throw new Error('Delete URL is required. Pass as query param ?delete_url=... or in body');
        // For imgBB, deletion is done via the delete_url
        // You can make a request to delete_url or just acknowledge
        res.status(200).json({
            success: true,
            message: 'File deletion initiated. Use the delete_url from upload response to delete the file.',
            delete_url
        });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteUploadedFile = deleteUploadedFile;
