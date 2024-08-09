const express = require('express')
const router = express.Router()
const { newUser, verifiedUser, login, reVerification, findUser, resetCode, verifyCode, changePassword, getUser, updateProfilePicture, updateCoverPicture, updateDetails, addFriend, cancelRequest, follow, unFollow, acceptRequest, unFriend, deleteRequest, search } = require('../../controllers/userControllers')
const { authUser } = require('../../middleware/auth')

router.post('/', newUser)
router.post('/activate', authUser, verifiedUser)
router.post('/login', login)
router.post('/reverification', authUser, reVerification)
router.post('/resetpassword', findUser)
router.post('/resetcode', resetCode)
router.post('/verifyresetcode', verifyCode)
router.post('/changepassword', changePassword)
router.get('/getuser/:username', authUser, getUser)
router.put('/updateprofilepicture', authUser, updateProfilePicture)
router.put('/updatecoverpicture', authUser, updateCoverPicture)
router.put('/updatedetails', authUser, updateDetails)
router.put('/addfriend/:id', authUser, addFriend)
router.put('/cancelrequest/:id', authUser, cancelRequest)
router.put('/follow/:id', authUser, follow)
router.put('/unfollow/:id', authUser, unFollow)
router.put('/acceptrequest/:id', authUser, acceptRequest)
router.put('/unfriend/:id', authUser, unFriend)
router.put('/deleterequest/:id', authUser, deleteRequest)
router.post('/search/:searchTerm', authUser, search)


module.exports = router