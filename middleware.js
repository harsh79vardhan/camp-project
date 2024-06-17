const Campground=require('./models/campground')
const expressError=require('./utils/ExpressError')
const Joi = require('joi');
module.exports.isLoggedIn = function(req,res,next){
    if(!req.isAuthenticated()){      // passport adds this method to the request , it 
        req.session.returnTo=req.originalUrl;
        req.flash('error','You have to be logged in first');
        return res.redirect('/user/login');
    }
    next();
}
module.exports.validateCampground = (req, res, next) => {
    console.log(req.body);
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


module.exports.isAuthor=async(req,res,next)=>{
    let {id}=req.params;
    const camp= await Campground.findById(id);
            if(req.user && !camp.author.equals(req.user._id)){
                req.flash('error',"You don't have the permission!");
                return res.redirect(`/campgrounds/show/${id}`);
            }
            next();
}