//packages for markdown rendering
const matter = require('gray-matter');
const md = require('markdown-it');
const path = require("path");

// router
const express = require("express");

const router = express.Router();

//path of where to get the articles
const article_dir = path.join( __dirname, '/ARTICLES/')

//mardown view
router.get('/md/:name/', (req, res) => {
    var name = req.params.name
    if (!name.endsWith(".md")){
        name= name+".md"
    }

    // read the markdown file
    const file = matter.read(path.join(article_dir, name));

    // use markdown-it to convert content to HTML
    markDownFile = md()
    let content = file.content;
    var result = markDownFile.render(content);

    res.render("article", {
    post: result,
    title: file.data.title,
    description: file.data.description,
    image: file.data.image
    });
})

module.exports = router;