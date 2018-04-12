import mongoose from 'mongoose'
import { Router } from 'express'
import Foodtruck from '../model/foodtruck'
import Review from '../model/review'
import bodyParsers from 'body-parser'

import { authenticate } from '../middleware/authMiddleware'

export default ({ config, db }) => {
  let api = Router();

  // '/v1/foodtruck/add' - POST add a foodtruck
  api.post('/add', authenticate, (req, res) => {
    let newFoodTruck = new Foodtruck();
    newFoodTruck.name = req.body.name;
    newFoodTruck.foodtype = req.body.foodtype;
    newFoodTruck.avgcost = req.body.avgcost;
    newFoodTruck.geometry.coordinates = req.body.geometry.coordinates;

    newFoodTruck.save(err => {
      if (err) {
        res.send(err);
      }
      res.json({ message: 'Foodtruck saved succesfully' });
    });
  });

  // '/v1/foodtruck' - GET all foodtrucks
  api.get('/', (req, res) => {
    Foodtruck.find({}, (err, foodtrucks) => {
      if (err) {
        res.send(err);
      }
      res.json(foodtrucks);
    });
  });

  // '/v1/foodtruck/:id' - GET a specific foodtruck
  api.get('/:id', (req, res) => {
    Foodtruck.findById(req.params.id, (err, foodtruck) => {
      if (err) {
        res.send(err);
      }
      res.json(foodtruck);
    });
  });

  // '/v1/foodtruck/:id' - PUT update an existing record
  api.put('/:id', authenticate, (req, res) => {
    Foodtruck.findById(req.params.id, (err, foodtruck) => {
      if (err) {
        res.send(err);
      }
      foodtruck.name = req.body.name;
      foodtruck.foodtype = req.body.foodtype;
      foodtruck.avgcost = req.body.avgcost;
      foodtruck.geometry.coordinates = req.body.geometry.coordinates;
      foodtruck.save(err => {
        if (err) {
          res.send(err);
        }
        res.json({ message: "Foodtruck info updated" });
      });
    });
  });

  // '/v1/foodtruck/:id' - DELETE remove a foodtruck
  api.delete('/:id', authenticate, (req, res) => {
    Foodtruck.remove({
      _id: req.params.id
    }, (err, foodtruck) => {
      if (err) {
        res.send(err);
      }
      Review.remove({
        foodtruck: req.params.id
      }, (err, review) => {
        if (err) {
          res.send(err);
        }
        res.json({ message: "Foodtruck removed "});
      });
    });
  });

  // '/v1/foodtruck/reviews/add/:id' - POST a review for a foodtruck
  api.post('/reviews/add/:id', authenticate, (req, res) => {
    Foodtruck.findById(req.params.id, (err, foodtruck) => {
      if (err) {
        res.send(err);
      }
      let newReview = new Review();

      newReview.title = req.body.title;
      newReview.text = req.body.text;
      newReview.foodtruck = foodtruck._id
      newReview.save((err, review) => {
        if (err) {
          res.send(err);
        }
        foodtruck.reviews.push(newReview);
        foodtruck.save(err => {
          if (err) {
            res.send(err);
          }
          res.json({ message: "Foodtruck review saved "});
        });
      });
    });
  });

  // '/v1/foodtruck/reviews/:id' - GET reviews for specific foodtruck
  api.get('/reviews/:id', (req, res) => {
    Review.find({foodtruck: req.params.id}, (err, reviews) => {
      if (err) {
        res.send(err);
      }
      res.json(reviews);
    });
  });

  return api
}
