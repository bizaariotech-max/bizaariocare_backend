const express=require('express')

const upload = require('../../middlewares/siglefile')
const { add_hospital, viewhospital } = require('../../controllers/hospital/addhospital')


const router=express.Router()

router.post('/addhospital', add_hospital)
router.get('/getallhospital',viewhospital)






module.exports=router