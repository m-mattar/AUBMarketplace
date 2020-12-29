const express = require('express')
const router = express.Router();
const Product = require('../../../models/Product')
const FileUpload = require('../ImageUploader/file-upload')
const auth = require('../../../middleware/auth')

const singleUpload = FileUpload.upload.single('image')

// Uploads an image to Amazon S3 object store and stores the image's link in the product's images table.
router.post('/:id', auth,  async (req,res) => {
    singleUpload(req,res, async function(err){
        if(err){
            return res.json({'error' : err})
        }
        try{
            const product = await Product.findOne({_id:req.params.id, owner: req.user.id})
            if(!product){
                return res.status(401).json({err : "You are not the owner of the post"}) 
            }
            product.images.push(req.file.location)
            await product.save()
            return res.json({'imageURL' : req.file.location})
        } catch (err){
            res.status(401).json({err : "Couldn't find post"})
        }
    })
})

router.delete('/:postid/:imageURL', auth, async(req,res) => {
    try{
        const product = await Product.findOne({_id:req.params.postid, owner: req.user.id})
        if(!product){
            return res.status(401).json({err : "You are not the owner of the post"})
        }

        const s3 = FileUpload.s3
        const DeleteImage = FileUpload.DeleteImage
        const params = {
            Bucket: "aubmarketplace",
            Key: req.params.imageURL
        }
        DeleteImage(s3,params)
        res.status(201).json({Message : "Image Deleted Successfully"})
    } catch(err){
        res.status(401).json({err})
    } 
})

module.exports = router
