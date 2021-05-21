# Website

This is the website of the LFA tech club, it is made using node.js and the express framework.

Packages used:
* express
* express-session
* express-fileupload
* gray-matter (for reading the md files of our articles)
* markdown-it (for rendering the articles)

## Articles

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
