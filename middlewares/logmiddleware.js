// logMiddleware.js
// const logger = require("../logger");

// function logMiddleware(req, res, next) {
//   if (["POST", "PUT", "PATCH"].includes(req.method)) {
//     const data = JSON.stringify(req.body);
//     logger.info(
//       `${req.method} request to ${req.originalUrl} | Data: ${data}`
//     );
//   }
//   next();
// }

// module.exports = logMiddleware;



// logMiddleware.js
const logger = require("../logger");
const jwt = require("jsonwebtoken");
require('dotenv').config()

function logMiddleware(req, res, next) {
  let user = "Unknown User";

  // Example: extract user from Authorization header
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // replace with your JWT secret
      user = decoded.firstName || decoded.id || "Unknown User";
    } catch (err) {
      user = "Invalid Token";
    }
  }
 // Only log on POST/PUT/PATCH
 if (["POST", "PUT", "PATCH"].includes(req.method)) {
//   let data;

//   try {
//     data = {
//       body: req.body && Object.keys(req.body).length ? req.body : "No text fields",
//       files: req.files && req.files.length ? req.files.map(f => f.originalname) : "No files"
//     };
//     data = JSON.stringify(data);
//   } catch (err) {
//     data = "Could not parse body/files";
//   }

//   logger.info(
//     `${req.method} request to ${req.originalUrl} | User: ${user} | Data: ${data}`
//   );
  logger.info(
    `${req.method} request to ${req.originalUrl} | User: ${user}`
  );
}


  next();
}

module.exports = logMiddleware;
