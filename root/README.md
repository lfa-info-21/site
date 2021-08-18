# Website

Introducing the website of the LFA tech club, made using node.js and the express framework.

Packages used:
* express
* express-session
* express-fileupload
* gray-matter (to read the md files of our articles)
* markdown-it (for rendering the articles)
* markdown-it-katex ( tex rendering plugin )

## Articles:

How to add an article? Given an article randomly named "**name.md**", here is the skeleton code : 

```markdown
---
title: "Title Here"
description: "A nice description of this post"
image: A nice image representing the blog post.
---

Content of the post.
```

You can now add this markdown file to the project directory **/static/articles/**

It will then be accessible in rendered form on the website at the path **/md/name** (no need to add "**.md**") or in raw form at **/public/articles/name.md** .

## Database :

We use SQLite as the basic Database framework. Because using SQL is a little bit of a pain, we prefered using a custom model tool to generate SQL code and run it. You will have to build by yourself the tables in a .sql file.

### Creating a Model

First of all, you will need to import from api/sql/model the Model class and create a new instance of it with the table name as first parameter (coming from the SQL file) and  the database you are using as the second one, described in api/api. After doing that you will be able to make queries, create new objects and update them
