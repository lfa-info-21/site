# Website

This is the website of the LFA tech club, it is made using node.js and the express framework.

Packages used:
* express
* express-session
* express-fileupload
* gray-matter (for reading the md files of our articles)
* markdown-it (for rendering the articles)
* markdown-it-katex ( tex rendering plugin )

## Articles:

How to add an article? Easy, let's say we want to add an article called "**name.md**", here's how it should be written: 

```markdown
---
title: "Title Here"
description: "A nice description of this post"
image: A nice image representing the blog post.
---

Content of the post.
```

Simply add this markdown file in the project directory **/static/articles/**

It will then be accessible in rendered form on the website at the path **/md/name** (no need to add "**.md**") or in raw form at **/public/articles/name.md** .

## How to use the database:

We use SQLite as the base Database framework. But because SQL is a little bit of a pain, we use a custom model tool to generate SQL code and run it. You will need to build yourself the tables in a .sql

### Creating a Model

First of all you will need to import from api/sql/model the Model class and create a new instance of it
with the first parameter which is the table name (from SQL file) and the second which is the database you are using, described in api/api. After that you will be able to do queryes, create object and update them
