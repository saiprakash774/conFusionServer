// Course: Server side development with NodeJS, Express and MongoDB
// Assignment: #1
// Created by: Muhammad Ovais Naeem

const express = require("express");
const bodyParser = require("body-parser");

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter
  .all("/", (req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .get("/", (req, res, next) => {
    res.end("Will send all the dishes to you!");
  })

  .get("/:dishId", (req, res, next) => {
    res.end("Will send details of the dish: " + req.params.dishId + " to you!");
  })

  .post("/", (req, res, next) => {
    res.end(
      "Will add the dish: " +
        req.body.name +
        " with details: " +
        req.body.description
    );
  })

  .post("/:dishId", (req, res, next) => {
    res.end(
      "Updating the dish: " +
        req.params.dishId +
        "\n" +
        "Will update the dish: " +
        req.body.name +
        " with details: " +
        req.body.description
    );
  })

  .put("/", (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
  })

  .put("/:dishId", (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on " + req.params.dishId);
  })

  .delete("/", (req, res, next) => {
    res.end("Deleting all dishes");
  })

  .delete("/:dishId", (req, res, next) => {
    res.end("Deleting dish id: " + req.params.dishId + " from dishes");
  });

module.exports = dishRouter;