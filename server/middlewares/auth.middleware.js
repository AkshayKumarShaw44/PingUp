export const protect = async (req,res,next) => {
    try {
        const { userId } =  req.auth
        if(!userId){
            return res.json({success: false, message: "Not Authenticated"})
        }
        next()
    } catch (error) {
        res.json({success: false, message: "Not Authenticated"})
    }
}

// export const protect = async (req, res, next) => {
//     try {
//         // 1. Remove 'await'. req.auth is already populated by clerkMiddleware()
//         const  userId  = req.auth; 

//         console.log("Auth Middleware - req.auth:", userId); // Debugging line
//         // 2. Check for 'userId', not 'user' (which was undefined)
//         if (!userId) {
//             return res.json({ success: false, message: "Not Authenticated" });
//         }

//         // Optional: You can attach the userId to the request for easy access
//         req.userId = userId;

//         next();
//     } catch (error) {
//         console.error("Auth Middleware Error:", error);
//         res.json({ success: false, message: "Not Authenticated" });
//     }
// };

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

// export const protect = async (req, res, next) => {
//     try {
//         // 1. Destructure correctly to get the String ID
//         const { userId } = req.auth; 

//         // 2. Debugging: This should now print "user_2j..." not the whole object
//         console.log("Auth Middleware - Clean UserID:", userId); 

//         if (!userId) {
//             return res.json({ success: false, message: "Not Authenticated" });
//         }

//         // Attach it to req for your controllers
//         req.userId = userId;

//         next();
//     } catch (error) {
//         console.error("Auth Middleware Error:", error);
//         res.json({ success: false, message: "Not Authenticated" });
//     }
// };

// export const protect = async (req, res, next) => {
//     try {
//         console.log("AUTH:", req.auth);

//         // ✅ SAFE CHECK
//         if (!req.auth || !req.auth.userId) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Not Authenticated"
//             });
//         }

//         req.userId = req.auth.userId;

//         next();
//     } catch (error) {
//         console.error("Auth Middleware Error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Server Error"
//         });
//     }
// };