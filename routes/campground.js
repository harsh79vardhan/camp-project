const express=require('express');
const router=express.Router();
const Joi = require('joi');
const review=require('../models/review')
const catchAsync=require('../utils/catchAsyncError');
const expressError=require('../utils/ExpressError')
const Campground=require('../models/campground')
const {isLoggedIn,validateCampground,isAuthor}=require('../middleware');



router.get('/new',isLoggedIn, catchAsync((req,res)=>{
    res.render('new');
}))

router.get('/show/:id',catchAsync(async (req, res) => {
    let {id}=req.params;
    let camp = await Campground.findById(id).populate({   // this is a nested populate, it means populate the reviews 
        path:'reviews',                   // in the campground and for each review populate its author
        populate:{
            path:'author'
        }
    }).populate('author')            // and then separately populate one author to the campground
    // console.log(camp.reviews[0].author);
    res.render('campgrounds/show',{camp});
}))

router.get('', catchAsync(async (req,res)=>{
    let campgrounds= await Campground.find({});
    res.render('./campgrounds/index',{campgrounds});
}))


router.post('/new',catchAsync(async(req,res,next)=>{
    // const campgroundSchema=joi.object({
    //     Campground:joi.object({
    //         title:joi.string().required(),
    //         price:joi.number().required().min(0),
    //     }).required()
    // })
    // const {error}=campgroundSchema.validate(req.body);
    // console.log(error);
    // if (error) {
    //     const mssg = error.details.map(el => el.message).join(',');            throw new expressError(mssg, 400);
    // }
    const camp=new Campground(req.body);
    camp.author=req.user._id;
    await camp.save();
    req.flash('success','Successfully created the campground!!');
    res.redirect(`/campgrounds/show/${camp._id}`)
}))


router.get('/:id/edit',isAuthor,isLoggedIn, catchAsync(async (req,res)=>{
    const {id}=req.params;
    let camp= await Campground.findById(id);
    res.render('./campgrounds/edit',{camp});
    }))


    
    
    router.post('/:id/edit',isAuthor,isLoggedIn, catchAsync(async (req, res) => {
        const { id } = req.params;
        const it = req.body;
        
        await Campground.findByIdAndUpdate(id, {
            title: it.title,
            price: it.price,
            location: it.location,
            description: it.description
            })
            req.flash('success','Successfully updated the campground!!');
            res.redirect(`/campgrounds/show/${id}`)
            }));
            router.get('/:id/delete',isLoggedIn,catchAsync(async (req,res)=>{
                const {id}=req.params;
                 await Campground.findByIdAndDelete(id,{});
                 req.flash('success','Successfully deleted the campground!!');
                 res.redirect('/campgrounds');
             }))
            
            router.get('show/:id',catchAsync(async (req, res) => {
                    let {id}=req.params;
                    let camp = await Campground.findById(id).populate('reviews')
                    res.render('campgrounds/show',{camp});
                }))







module.exports=router;