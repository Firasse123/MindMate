import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
  // Get token from Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
  }

  const token = authHeader.split(" ")[1]; // extract the token

  try {
	
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log("Decoded token:", decoded);

    req.userId = decoded.userId; // attach userId to request
    next();
  } catch (error) {
    console.log("Error in verifyToken", error);
    return res.status(401).json({ success: false, message: "Unauthorized - invalid or expired token" });
  }
};
