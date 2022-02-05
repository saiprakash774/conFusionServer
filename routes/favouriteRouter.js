const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favourites = require('../models/favourites');
const { findOneAndRemove } = require('../models/favourites');

const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({})
        .populate('user')
        .populate('dishes')
        .then((favourites) => {
            // extract favourites that match the req.user.id
            if (favourites) {
                user_favourites = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                if(!user_favourites) {
                    var err = new Error('You have no favourites!');
                    err.status = 404;
                    return next(err);
                }
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(user_favourites);
            } else {
                var err = new Error('There are no favourites');
                err.status = 404;
                return next(err);
            }
            
        }, (err) => next(err))
        .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({ user: req.user._id }, (err, favourites)).then((favourites) => {
        if (err) return next(err);
        if (!favourites) {
            Favourites.create({ user: req.user._id })
                .then((favourites) => {
                    for (i = 0; i < req.body.length; i++) {
                        if (favourites.dishes.indexOf(req.body[i]._id))
                            favourites.dishes.push(req.body[i])
                        favourites.save()
                            .then((favourites) => {
                                Favourites.findById(favourites._id)
                                    .populate('user')
                                    .populate('dishes')
                                    .then((favourites) => {
                                        res.statusCode = 200;
                                        res.setHeader("Content-Type", 'appplication/json');
                                        res.json(favourites);
                                    })
                            }).catch((err) => {
                                return next(err);
                            })
                    }
                }).catch((err) => {
                    return next(err);
                })
        } else {
            for (i = 0; i < req.body.length; i++) {
                if (favourites.dishes.indexOf(req.body[i]._id))
                    favourites.dishes.push(req.body[i])
                favourites.save()
                    .then((favourites) => {
                        Favourites.findById(favourites._id)
                            .populate('user')
                            .populate('dishes')
                            .then((favourites) => {
                                res.statusCode = 200;
                                res.setHeader("Content-Type", 'appplication/json');
                                res.json(favourites);
                            })
                    }).catch((err) => {
                        return next(err);
                    })
            }
        }
    })
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favourites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({})
        .populate('user')
        .populate('dishes')
        .then((favourites) => {
            var favToRemove;
            if (favourites) {
                favToRemove = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
            } 
            if(favToRemove){
                favToRemove.remove()
                    .then((result) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(result);
                    }, (err) => next(err));
                
            } else {
                var err = new Error('You do not have any favourites');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
});

favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({user:req.user._id})
        .then((favourites) => {
            if(!favourites){
                res.statusCode=200;
                res.setHeader("Content-Type", 'appplication/json');
                return res.json({"exists":false, "favourites": favourites})
            }
            else{
                if(favourites.dishes.indexOf(req.params.dishid) < 0){
                    res.statusCode=200;
                    res.setHeader("Content-Type", 'appplication/json');
                    return res.json({"exists":false, "favourites": favourites}) 
                }
                else{
                    res.statusCode = 200;
                    res.setHeader("Content-Type", 'appplication/json');
                    return res.json({ "exists": true, "favourites": favourites })
                }
            }
        }, (err) => next(err))
        .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourites.findOne({user: req.user._id},(err, favourites)).then((favourites)=>{})
            if(err) return next(err);
            if(!favourites){
                Favourites.create({user: req.user._id})
                .then((favourites)=>{
                    favourites.dishes.push({"_id":req.params.dishId})
                    favourites.save()
                    .then((favourites) =>{
                        Favourites.findById(favourites._id)
                        .populate('user')
                        .populate('dishes')
                        .then((favourites) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", 'appplication/json');
                            res.json(favourites);  
                    }).catch((err) => {
                        return next(err);
                    })
                }).catch((err) => {
                    return next(err);
                })
            }).catch((err) => {
                return next(err);
            })
            }else{
                    if( favourites.dishes.indexOf(req.params.dishId) < 0){
                    favourites.dishes.push({"_id": req.params.dishId})
                    favourites.save()
                    .then((favourites) =>{
                        Favourites.findById(favourites._id)
                        .populate('user')
                        .populate('dishes')
                        .then((favourites) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", 'appplication/json');
                            res.json(favourites);  
                    }).catch((err) => {
                        return next(err);
                    })
                    }).catch((err) => {
                    return next(err);
                })
            }
            else{
                res.statusCode = 403;
                res.setHeader("Content-Type", 'appplication/json');
                res.end('Dish' + req.params.dishId + 'already exists!');
            }
        } 
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader("Content-Type", 'appplication/json');
    res.end('PUT operation is not supported on /favourites/:dishId' +req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({user: req.user._id}, (err, favourites)).then((favourites) =>{
        if(err) return next(err);

        var index= favourites.dishes.indexOf(req.params.dishId)
        if(index >= 0){
            favourites.dishes.splice(index, 1);
            favourites.save()
            .then((favourites)=>{
                Favourites.findById(favourites._id)
                        .populate('user')
                        .populate('dishes')
                        .then((favourites) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", 'appplication/json');
                            res.json(favourites);  
                    }).catch((err) => {
                        return next(err);
                    })
            }).catch((err) => {
                return next(err);
            })
        }else{
            res.statusCode = 404;
            res.setHeader("Content-Type", 'text/plain');
            res.end("Dish" +req.params._id + 'not in your Favourites list')
        }
    })
});

module.exports = favouriteRouter;