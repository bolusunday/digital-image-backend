const jwt = require("jsonwebtoken");
require("dotenv").config();

function verifyToken(req, res, next) {
  //Get token header (Format: Bearer <token>)
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; //Adds {id: user_id} to thr request object
    next(); // Move to the actual endpoint codem
  } catch (err) {
    res.status(401).json({ error: "Token is not valid." });
  }
}

module.exports = verifyToken;
