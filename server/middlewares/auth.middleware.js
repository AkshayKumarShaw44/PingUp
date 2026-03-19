export const protect = async (req,res,next) => {
    try {
        const { userId } = await req.auth
        if(!user){
            return res.json({success: false, message: "Not Authenticated"})
        }
        next()
    } catch (error) {
        res.json({success: false, message: "Not Authenticated"})
    }
}