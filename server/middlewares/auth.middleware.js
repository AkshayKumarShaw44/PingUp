// export const protect = async (req,res,next) => {
//     try {
//         const { userId } = req.auth
//         if(!userId){
//             return res.json({success: false, message: "Not Authenticated"})
//         }
//         next()
//     } catch (error) {
//         res.json({success: false, message: "Not Authenticated"})
//     }
// }

export const protect = async (req, res, next) => {
    try {
        // 1. Remove 'await'. req.auth is already populated by clerkMiddleware()
        const { userId } = req.auth; 

        // 2. Check for 'userId', not 'user' (which was undefined)
        if (!userId) {
            return res.json({ success: false, message: "Not Authenticated" });
        }

        // Optional: You can attach the userId to the request for easy access
        // req.userId = userId;

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.json({ success: false, message: "Not Authenticated" });
    }
};