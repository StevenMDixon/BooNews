const express = require("express");
const db = require("../models");
const router = express.Router();
const cheerio = require("cheerio");
const axios = require("axios");

// get list of all users
router.get("/users", function(req, res) {
  db.User.find({}).then(data => {
    res.json(data);
  });
});

// get list of all articles
router.get("/article", function(req, res) {
  db.Article.find({}).then(data => {
    res.json(data);
  });
});

// get list of all articles with their comments
router.get("/articlewithcomment", function(req, res) {
  db.Article.find({})
    .populate("comments")
    .then(data => {
      res.json(data);
    });
});

// use cheerio and axios to scrape the site
router.get("/scrape", function(req, res) {
  axios
    .get("https://www.livescience.com/strange-news")
    .then(function(response) {
      const $ = cheerio.load(response.data);
      $("article").each(function() {
        let result = {};
        result.title = $(this)
          .find(".article-name")
          .text()
          .trim();
        result.byline = $(this)
          .find(".byline")
          .text()
          .trim();
        result.synopsis = $(this)
          .find(".synopsis")
          .text()
          .trim();
        result.url = $(this)
          .parent()
          .attr("href");
        db.Article.create(result).catch(err => {
          console.log(err);
        });
      });

      res.send("/");
    });
});

// add a comment to an article using post
router.post("/addcomment/:id", function(req, res) {
  if (!req.body.data) {
    return res.json({Error: "Missing comment"});
  }

  req.body.name = generateRandomName();

  db.Comment.create(req.body)
    .then(data => {
      return db.Article.findOneAndUpdate(
        {_id: req.params.id},
        {$push: {comments: data._id}},
        {new: true}
      );
    })
    .then(Articles => {
      res.json(Articles);
    })
    .catch(err => {
      res.json(err);
    });
});

router.post("/deleteComment/", function(req, res) {
  if (!req.body) {
    return res.json({Error: "Missing id"});
  }
  db.Comment.findOneAndRemove({_id: req.body.id}).then(data => res.json(data));
});

module.exports = router;

function generateRandomName() {
  const descriptors = [
    "Gross",
    "Massive",
    "Tumorous",
    "Icky",
    "Nasty",
    "Slimy",
    "Chunky",
    "Sticky",
    "Feral",
    "Smelly",
    "Sanguine",
    "Fetid"
  ];

  const names = [
    "Bat",
    "Vampire",
    "Ghost",
    "Goblin",
    "Troll",
    "Pumpkin",
    "Witch",
    "Wizard",
    "Warlock",
    "Mummy",
    "Frankenstein",
    "Blob"
  ];

  function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  return getRandom(descriptors) + getRandom(names);
}
