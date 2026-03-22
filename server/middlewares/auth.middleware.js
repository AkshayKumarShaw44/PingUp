export const protect = async (req, res, next) => {
    try {
        const {userId} = await req.auth();
        
        if(!userId){
            return res.status(401).json({success: false, message: "Unauthorized xyx"})
        }
        next();
    } catch (error) {
        return res.status(500).json({success: false, message: "Internal Server Error"})
    }
}