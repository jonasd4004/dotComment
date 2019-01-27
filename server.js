// Dependencies
const express = require("express");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");

// The Scraping Tools
const axios = require("axios");
const cheerio = require("cheerio");

// Designate Our Port
const PORT = process.env.PORT || 3000;

// Create The Const App
const app = express();

// Require The Routes Folder
// const routes = require("./routes");

// Require Models
const db = require("./models");

// Configuring The Data Types My Server Can Use
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve Our Public Folder
app.use(express.static("public"));

//Connect Handlebars To Express
app.engine("handlebars", exphbs({ defaultLayout: "main" }));

app.set("view engine", "handlebars");

//Pass Routes Into Express
// app.use(routes);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/BroadwayHeadlines";
mongoose.connect(MONGODB_URI);

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.broadwayworld.com/newsroom/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("div.article-classic").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(element)
                .find("a")
                .text();
            result.link = $(element)
                .find("a")
                .attr("href");

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
            // console.log(result);
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
app.get("/articles", async function (req, res) {
    // TODO: Finish the route so it grabs all of the articles
    const articles = await db.Article.find({});
    res.render("index", { article: articles });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", async function (req, res) {

    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
            //res.render()
        });

});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", async function (req, res) {
    // TODO
    // ====
    // save the new note that gets posted to the Notes collection
    // then find an article from the req.params.id
    // and update it's "note" property with the _id of the new note
    const newNote = await db.Note.create(req.body);
    const article = db.Article.findByIdAndUpdate(req.params.id, { $set: { note: newNote._id } });
    res.json(article);
});

app.listen(PORT, function () {
    console.log("App is listening on port: " + PORT);
});