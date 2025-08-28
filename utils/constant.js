const jwt = require("jsonwebtoken");

const _jwtSecret = process.env.JWT_SECRET;
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

/**
 * Creates a response object with a response code, response message, and data.
 * @param {number} response_code - The response code.
 * @param {string} response_message - The response message.
 * @param {*} data - The data to be included in the response object.
 * @returns {object} - The response object.
 */
function __requestResponse(response_code, response_message, data) {
  // console.log(data, "data in __requestResponse ");
  return {
    response: {
      response_code,
      response_message,
    },
    data,
  };
}

/**
 * Generates a JSON Web Token (JWT) for a given user object.
 * @param {Object} user - The user object.
 * @param {string} user._id - The user ID.
 * @returns {string} - The generated JWT.
 */
function __generateAuthToken(user) {
    const data = {
        user: {
            id: user._id,
        },
    };
    const authtoken = jwt.sign(data, _jwtSecret);
    // const authtoken = jwt.sign(data, process.env.JWT_SECRET, {
    //     expiresIn: "12h",
    // });
    return authtoken;
}

/**
 * Generates a random 4-digit number between 1000 and 9999.
 * @returns {number} The random 4-digit number.
 */
function __randomNumber() {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const __deleteFile = (filePath) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`File not found at path: ${filePath}`);
            return;
        }

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
                return;
            }
            console.log(`File at path: ${filePath} has been deleted.`);
        });
    });
};

// Delete from Cloudinary
const __deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType, // "image" | "video" | "raw"
    });
    return result;
  } catch (error) {
    console.error("Cloudinary Delete Error:", error.message);
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
    console.log("Deleted from Cloudinary:", publicId);
  } catch (error) {
    console.error("Cloudinary Delete Error:", error.message);
  }
};


function __deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function __transformData({ list, name, id }) {
    return list.map((item) => {
        return {
            id: item[id],
            name: item[name],
        };
    });
}
const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
function __formatDate(date) {
    let inputDate = new Date(date);
    if (!(inputDate instanceof Date)) {
        throw new Error("Input must be a valid Date object");
    }

    const day = inputDate.getDate().toString().padStart(2, "0");

    const month = Number(inputDate.getMonth()) + 1;
    const year = inputDate.getFullYear();

    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
}
function __formatDateddMMMyyyy(date) {
    let inputDate = new Date(date);
    if (!(inputDate instanceof Date)) {
        throw new Error("Input must be a valid Date object");
    }

    const day = inputDate.getDate().toString().padStart(2, "0");

    const month = monthNames[Number(inputDate.getMonth())];
    const year = inputDate.getFullYear();

    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
}

function __calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of the Earth in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    console.log(phi1, phi2, deltaPhi, deltaLambda);

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) *
            Math.cos(phi2) *
            Math.sin(deltaLambda / 2) *
            Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return (distance / 1000).toFixed(0) + " KM";
}

module.exports = {
    __requestResponse,
    __generateAuthToken,
    __randomNumber,
    __deleteFile,
    __deepClone,
    __transformData,
    __formatDate,
    __formatDateddMMMyyyy,
    __calculateDistance,
};
