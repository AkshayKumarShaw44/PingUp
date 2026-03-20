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
        const  userId  = req.auth; 

        console.log("Auth Middleware - req.auth:", userId); // Debugging line
        // 2. Check for 'userId', not 'user' (which was undefined)
        if (!userId) {
            return res.json({ success: false, message: "Not Authenticated" });
        }

        // Optional: You can attach the userId to the request for easy access
        req.userId = userId;

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.json({ success: false, message: "Not Authenticated" });
    }
};

// middlewares/auth.middleware.js
// export const protect = async (req, res, next) => {
//     try {
//         // In @clerk/express, auth is an object on req
//         const auth = req.auth; 

//         // Check if userId exists in the auth object
//         if (!auth || !auth.userId) {
//             return res.json({ success: false, message: "Not Authenticated" });
//         }

//         // Success! Pass to the next function
//         next();
//     } catch (error) {
//         console.error("Auth Middleware Error:", error);
//         res.json({ success: false, message: "Not Authenticated" });
//     }
// };