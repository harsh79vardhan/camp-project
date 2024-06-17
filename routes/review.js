const express=require('express');
const router=express.Router();
const Joi = require('joi');
const review=require('../models/review')
const catchAsync=require('../utils/catchAsyncError');
const expressError=require('../utils/ExpressError')
const Campground=require('../models/campground')
const {isLoggedIn}=require('../middleware');

const validateCampground = (req, res, next) => {
    const campgroundSchema = Joi.object({
        Campground: Joi.object({
            title: Joi.string().required(),
            location: Joi.string().required(),
            image: Joi.string().required(),
            price: Joi.number().required().min(0),
            description: Joi.string().required()
        }).required()
    });

    const { error } = campgroundSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const mssg = error.details.map(el => el.message).join(',');
        throw new expressError(mssg, 400);
    } else {
        next();
    }
}



router.post('/:id',isLoggedIn,catchAsync(async(req,res,next)=>{
    const camp=await Campground.findById(req.params.id);
    const rev=new review(req.body.Review);
    rev.author=req.user._id;
    // console.log(rev.author.username);
    camp.reviews.push(rev);
    await camp.save();
    await rev.save();
    req.flash('success','Successfully created review!!');
    res.redirect(`/campgrounds/show/${camp._id}`);
}));

router.post('/:id/:reviewId',isLoggedIn,catchAsync(async(req,res,next)=>{
    const {id,reviewId}=req.params;
    // const rev=await review.findById(reviewId);
    // console.log(rev.author);
    // console.log(req.user);

    await Campground.findByIdAndUpdate(id,{$pull:{reviewId}});
    await review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review!!');
    res.redirect(`/campgrounds/show/${id}`);
}))

module.exports=router