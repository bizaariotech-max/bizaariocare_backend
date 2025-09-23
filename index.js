
const express=require('express')
const cors=require('cors');
const path = require('path');
const connect = require('./connectdb');
const bodyParser = require('body-parser');
require('dotenv').config();
const logMiddleware=require('./middlewares/logmiddleware')

const app=express();


app.use(bodyParser.json({ limit: "50mb" })); // Increase limit for JSON payloads
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); // Increase limit for form data

app.use(express.json({ limit: '50mb' }));

// * use this  only in index file not in every page
// Cloudinary Config
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// app.use(logMiddleware);

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(cors())

connect();
app.get('/',(req,res)=>
{
    res.send("welcome to bizarriocare")
})
app.use('/doctor',require('./routers/doctor/doctoroutes'));
app.use('/hospital',require('./routers/hospital/hospitalroutes'));

// new api routes use this pattern = BASE_URL/api/v1/name

// *common api routes
app.use("/api/v1/common", require("./routers/common/lookup.Routes")); // common lookup list
// upload api routes
//* use this single api to upload image in web it returns url which can be stored in any schema
app.use("/api/v1/common", require("./routers/common/upload.Routes"));
// app.use("/api/v1/common", require("./routers/common/login.Routes"));


// * admin api routes
// lookup
app.use("/api/v1/admin", require("./routers/AdminLookup/adminLookup.Routes")); //lookup
// station
app.use("/api/v1/admin", require("./routers/common/station.Routes"));
// station
app.use("/api/v1/admin", require("./routers/Asset/asset.Routes"));
// 
app.use("/api/v1/admin", require("./routers/common/lookup.Routes"));
// login api routes
app.use("/api/v1/admin", require("./routers/common/login.Routes"));
// asset section routes
app.use("/api/v1/asset-sections", require("./routers/Asset/assetSections.Routes"));

// ContentMaster
app.use("/api/v1/admin", require("./routers/common/contentMaster.Routes"));

// EventMaster
app.use("/api/v1/admin", require("./routers/common/eventMaster.Routes"));

app.use("/api/v1/admin", require("./routers/common/investigationMaster.Routes"));


// patient Master
app.use("/api/v1/admin", require("./routers/Patient/patientMaster.Routes"));
// patient Profiling
app.use("/api/v1/admin/patientprofiling", require("./routers/Patient/patientProfiling.Routes"));
// patient Referral
app.use("/api/v1/admin/patientreferral", require("./routers/Patient/patientReferral.Routes"));



const server=app.listen(process.env.PORT,()=>
{
    console.log(`server is running on port:${process.env.PORT}`);
})
server.setTimeout(5 * 60 * 1000); // 300000 ms = 5 minutes

