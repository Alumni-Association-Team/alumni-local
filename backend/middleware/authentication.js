import jwt, { decode } from "jsonwebtoken";
import User from "../model/User/userInfo.js";

const authentication = async (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(400).json({ message: "Please Login" });
  }
  try {
    const decodeToken = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decodeToken.userId).select("-password")

    if(!user){
      return res.status(400).json({ message: "User not found" });     
    }

    if(user.isVerified){
      req.user = user;
      return next();
    }
    else return res.status(400).json({ message: "Please verify your Email" });
    
  } catch (error) {
    console.log("error : ", error.message);
    return res.status(400).json({ message: "Error in authentication" });
  }
};

export default authentication