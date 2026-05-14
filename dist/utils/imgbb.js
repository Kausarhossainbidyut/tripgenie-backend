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
exports.uploadToImgBB = void 0;
const imgbb_uploader_1 = __importDefault(require("imgbb-uploader"));
const db_1 = __importDefault(require("../config/db"));
const uploadToImgBB = (base64Image, name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, imgbb_uploader_1.default)({
            apiKey: db_1.default.imgbb_api_key,
            base64string: base64Image,
            name: name || undefined,
        });
        return {
            url: result.image.url,
            delete_url: result.delete_url,
            thumb_url: result.thumb.url,
        };
    }
    catch (error) {
        throw new Error('Failed to upload to imgBB');
    }
});
exports.uploadToImgBB = uploadToImgBB;
