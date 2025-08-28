const express=require('express')
const logmiddleware=require('../../middlewares/logmiddleware')
const uploadFields=require('../../middlewares/multifile')
const {add_doctor, logindoctor, changePassword, viewdoctor, updatedoctor, viewdoctorby_id, addimagegallary, deleteimagefromgallary, addupcomingevents, add_awards_achievements, add_work_experience, edit_work_experience, deleteimagefrom_awardimage, update_awards_achievements, deleteimagefrom_picturegallary, deleteupcomingeventsimage, update_upcoming_events, delete_upcoming_events, delete_award, delete_work_experience} = require('../../controllers/doctor/adddoctor')
const upload = require('../../middlewares/siglefile')
const { add_course, viewcourse, viewcoursebyuserid, delete_course } = require('../../controllers/doctor/createcourse')
const { add_digitalcme, viewcme, delete_digitalcme } = require('../../controllers/doctor/createdigitalcme')
const { add_digitalcme_questionbank, view_digitalcme_questionbank, delete_question } = require('../../controllers/doctor/createquestionbank')
const { add_doctor_subadmin, view_subadmin, delete_subadmin } = require('../../controllers/doctor/subadmin')


const router=express.Router()

// ======================================add and update doctor routes===========================================

router.post('/adddoctor',upload.any('profile_pic'), add_doctor)
router.put('/updatedoctor/:_id',upload.any('profile_pic'),updatedoctor)

//===================== add and delete image gallary=================================================

router.put('/addimagegallary/:_id',upload.any('image_gallary'),addimagegallary)
router.put('/deleteimagefromgallary/:_id/:index',deleteimagefromgallary)

//===================== add delete update upcoming events============================================

router.put('/addupcomingevents/:_id',upload.any('event_image'),addupcomingevents)
router.put('/deleteupcomingeventsimage/:_id/:eventindex/:imageIndex',deleteupcomingeventsimage)
router.put('/updateupcomingevents/:_id/:eventindex',upload.any('event_image'),update_upcoming_events)
router.delete('/deleteupcomingevents/:_id/:eventindex',delete_upcoming_events)

//================= add update and delete awards achievements=======================================

router.put('/addawards/:_id',uploadFields,add_awards_achievements)
router.put('/deleteawardimage/:_id/:awardIndex/:imageIndex',deleteimagefrom_awardimage)
router.put('/deletepicturegallary/:_id/:awardIndex/:imageIndex',deleteimagefrom_picturegallary)
router.put('/updateaward/:_id/:awardIndex',uploadFields,update_awards_achievements)
router.delete('/deleteawards/:_id/:awardIndex',delete_award)
// router.put("/addawards/:_id",upload.any("doctors_award_image"),add_awards_achievements);

//================== add delete and update work experience===================================

router.put('/addworkexperience/:_id', add_work_experience)
router.put('/updateworkexperience/:_id/:index',edit_work_experience)
router.delete('/deleteworkexperience/:_id/:workindex',delete_work_experience)

//============================ view login and change password ===========================================
router.get('/getalldoctor',viewdoctor)
router.get('/getdoctorbyid/:_id',viewdoctorby_id)
router.post('/login',logindoctor)
router.post('/changedpassword',changePassword)



// ===========================creating course route===============================================

router.post('/createcourse',upload.any('course_image'), add_course)
router.get('/getcourse',viewcourse)
router.get('/getcoursebyuserid/:user_id',viewcoursebyuserid)
router.delete('/deletecourse/:_id',delete_course)


//=========================== digital cme routes==========================================

router.post('/createdigitalcme',upload.any('image_gallary'), add_digitalcme)
router.get('/getcme',viewcme)
router.delete('/deletecme/:_id',delete_digitalcme)


//======================create digital cme question bank routes==========================================

router.post('/createdigitalcmequestionbank',upload.any('image_gallary'), add_digitalcme_questionbank)
router.get('/getdigitalcmequestionbank',view_digitalcme_questionbank)
router.delete('/deletequestion/:_id',delete_question)

//========================= sub admin routes===================================================

router.post('/createsubadmin', add_doctor_subadmin)
router.get('/getsubadmindetails',view_subadmin)
router.delete('/deletesubadmin/:_id',delete_subadmin)


module.exports=router