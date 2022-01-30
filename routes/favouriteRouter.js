const express = require('express');
const bodyParser = require('body-parser');
var authenticate = require('../authenticate')
const Favourites = require('../models/favourites');
const cors = require('./cors');

const mongoose = require('mongoose');
mongoose.set('useFindAndModify',false);
const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); }) // options that are provided for preflight requests
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favourites.findOne({'user': req.user._id })
    .populate('user')
    .populate('dishes')
    .then((fav) => {
        if (req.user._id.equals(fav.user.id)){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(fav);
        }else{
            err = new Error('Favourites not found !!');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
Favourites.findOne({})
    .then((fav) => {
        if (fav === null && req.body.length > 0) {
                Favourites.create(req.body[0])
                .then((fav) => {
                        fav.dishes=req.body;
                        fav.user=req.user._id;
                        fav.save()
                        .then((fav) => {
                            Favourites.findById(fav._id)
                            .populate('dishes')
                            .populate('user')
                            .then((fav) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(fav);
                            })             
                        }, (err) => next(err));
                    }, (err) => next(err))
        }
        else if(fav && req.body.length > 0) {
                let dishIds = fav.dishes;
                req.body.map((dish, index) => {
                    if (fav.dishes.indexOf(dish._id) !== -1) {
                        fav.dishes.splice(index, 1);
                    }
                    dishIds.push(dish)
                })
                fav.dishes = dishIds;
                fav.user = req.user._id;
                fav.save()
                    .then((fav) => {
                        Favourites.findById(fav._id)
                            .populate('user')
                            .populate('dishes')
                            .then((fav) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(fav);
                            })
                    }, (err) => next(err));
        }else{
                err = new Error('Favourites not found !!');
                err.status = 404;
                return next(err);
        }
    })
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favourite');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOneAndRemove({"user": req.user._id})
    .then((fav) => {   
            if (fav !== null) {
              
                if (req.user._id.id === (fav.user.id)) {
                    fav.dishes.map((dish, index) => {
                        fav.dishes.id ===(dish[index]._id).remove();
                    })
                }
                    fav.save()
                    .then((resp) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(resp);
                    }, (err) => next(err))
                    .catch((err) => next(err)); 
                
            }else {
                err = new Error('favourite not found');
                err.status = 404;
                return next(err);
            }
        
}, (err) => next(err))
    .catch((err) => next(err));    
});

favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on: /favourites/' + req.params.id);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourites.findOne({ 'user': req.user._id }) 
        .then((fav) =>{
            if (fav === null ||  fav.dishes.length === 0 ) {
                let dishId =req.params.dishId
                Favourites.create({dishId})
                    .then((fav) => {
                        let dishId=req.params.dishId
                        fav.dishes.push([dishId]);
                        fav.user=req.user._id;
                        fav.save()
                        .then((fav) => {
                            Favourites.findById(fav._id)
                            .populate('dishes')
                            .populate('user')
                            .then((fav) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(fav);
                    }, (err) => next(err));
                }).catch((err) => next(err));
            }).catch((err) => next(err));
            }else if(fav.dishes.length > 0){
                fav.dishes.map((dish) => {
                    if (dish.id !== (req.params.dishId)) {
                        fav.dishes.push([req.params.dishId]);
                    }
                })
                fav.user = req.user._id;
                fav.save()
                    .then((fav) => {
                        Favourites.findById(fav._id)
                            .populate('user')
                            .populate('dishes')
                            .then((fav) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(fav);
                            })
                    }, (err) => next(err));
            }
        }).catch((err) => next(err));

})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favourites/'+ req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({user: req.user._id})
    .then((fav) => {
        if (req.user._id.equals(fav.user)) {
            if (fav !== null && fav.dishes.id !== null) {
                fav.dishes.map((dish) => {
                    if (dish.id === (req.params.dishId)) {
                        dish.remove()
                    }
                })
                fav.save()
                .then((fav) =>{
                    Favourites.findById(fav._id)
                    .then((fav) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fav);
                    })
                })
            }
            else {
                err = new Error('favourite ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favouriteRouter;