"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientInfo = void 0;
const getClientInfo = (req) => {
    var _a, _b;
    // 1. Get IP Address
    let ip = req.headers["x-forwarded-for"] ||
        ((_a = req.connection) === null || _a === void 0 ? void 0 : _a.remoteAddress) ||
        ((_b = req.socket) === null || _b === void 0 ? void 0 : _b.remoteAddress) ||
        req.ip ||
        "Unknown";
    if (Array.isArray(ip)) {
        ip = ip[0];
    }
    // 2. Get User-Agent
    const ua = (req.headers["user-agent"] || "").toLowerCase();
    // 3. Detect Browser
    let browser = "Unknown";
    if (ua.includes("chrome"))
        browser = "Chrome";
    else if (ua.includes("firefox"))
        browser = "Firefox";
    else if (ua.includes("safari") && !ua.includes("chrome"))
        browser = "Safari";
    else if (ua.includes("edg"))
        browser = "Edge";
    else if (ua.includes("msie") || ua.includes("trident"))
        browser = "Internet Explorer";
    // 4. Detect OS
    let os = "Unknown";
    if (ua.includes("windows"))
        os = "Windows";
    else if (ua.includes("mac os"))
        os = "MacOS";
    else if (ua.includes("android"))
        os = "Android";
    else if (ua.includes("iphone") || ua.includes("ipad"))
        os = "iOS";
    else if (ua.includes("linux"))
        os = "Linux";
    // 5. Device Type
    let deviceType = "Desktop";
    if (ua.includes("mobile"))
        deviceType = "Mobile";
    else if (ua.includes("tablet"))
        deviceType = "Tablet";
    // 6. Phone Brand Detection
    let brand = "Unknown";
    if (/iphone|ipad|ipod/.test(ua))
        brand = "Apple";
    else if (/samsung|sm-|gt-|sch-|shv-/.test(ua))
        brand = "Samsung";
    else if (/redmi|mi |xiaomi/.test(ua))
        brand = "Xiaomi";
    else if (/oppo/.test(ua))
        brand = "Oppo";
    else if (/vivo/.test(ua))
        brand = "Vivo";
    else if (/oneplus/.test(ua))
        brand = "OnePlus";
    else if (/huawei/.test(ua))
        brand = "Huawei";
    else if (/nokia/.test(ua))
        brand = "Nokia";
    else if (/motorola|moto/.test(ua))
        brand = "Motorola";
    else if (/realme/.test(ua))
        brand = "Realme";
    return {
        ip,
        browser,
        os,
        deviceType,
        brand,
        rawUserAgent: ua,
    };
};
exports.getClientInfo = getClientInfo;
