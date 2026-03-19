import ImageKit from "imagekit";

if (!process.env.IMAGEKIT_PUBLIC_KEY) {
    console.error("❌ ImageKit Public Key is missing from .env");
}
if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    console.error("❌ ImageKit Private Key is missing from .env");
}
if (!process.env.IMAGEKIT_URL_ENDPOINT) {
    console.error("❌ ImageKit URL Endpoint is missing from .env");
}
const imageKit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export default imageKit;
