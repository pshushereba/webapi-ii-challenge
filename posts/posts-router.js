const express = require("express");
const router = express.Router();
const db = require("../data/db.js");

router.get('/', (req, res) => {
    db.find()
        .then((posts) => {
            res.status(200).json(posts);
        })
        .catch(() => {
            res.status(500).json({ error: "The posts information could not be retrieved." })
        })
});

router.get('/:id', (req, res) => {
    const {id} = req.params;

    db.findById(id)
        .then((post) => {
            console.log(post)
            if (post.length) {
                res.status(200).json(post)
            } else {
                res.status(404).json({ message: "The post with the specified ID does not exist." })
            }
        })
        .catch(() => {
            res.status(500).json({ error: "The post information could not be retrieved." })
        })
});

router.post('/', (req, res) => {
    const postInfo = req.body;
    
    if (postInfo.title === undefined || postInfo.contents === undefined) {
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
    } else {
        db.insert(postInfo)
            .then((id) => {
                console.log(id);
                db.findById(id.id)
                    .then((newPost) => {
                        res.status(201).json(newPost);
                    })
                    .catch(() => {
                        res.status(500).json({ error: "There was an error while saving the post to the database" })
                    })
            })
            .catch(() => {
                res.status(500).json({ error: "There was an error while saving the post to the database" })
            })
    }
});

router.get('/:id/comments', (req, res) => {
    const postId = req.params.id;

    if (postId === undefined) {
        res.status(404).json({ message: "The post with the specified ID does not exist." })
    } else {
        db.findPostComments(postId)
            .then((comments) => {
                res.status(200).json(comments)
            })
            .catch(() => {
                res.status(500).json({ error: "The comments information could not be retrieved." })
            })
    }
});

router.post('/:id/comments', (req, res) => {
    const commentInfo = req.body;

    if (commentInfo.text === undefined) {
        res.status(400).json({ errorMessage: "Please provide text for the comment." })
    } else if (commentInfo.post_id === undefined) {
        res.status(404).json({ message: "The post with the specified ID does not exist." })
    } else {
        db.insertComment(commentInfo)   
        .then((id) => {
                console.log(id);
                db.findCommentById(id.id)
                    .then((newComment) => {
                        res.status(201).json(newComment);
                    })
                    .catch(() => {
                        res.status(500).json({ error: "There was an error while saving the comment to the database" })
                    })
            })
            .catch(() => {
                res.status(500).json({ error: "There was an error while saving the comment to the database" })
            })
    }    
})

router.put("/:id", (req, res) => {
    const id = req.params.id;
    const postInfo = req.body;
  
    if (postInfo.title === undefined || postInfo.contents === undefined) {
      res.status(400).json({
        errorMessage: "Please provide title and contents for the post."
      });
    } else {
      db.findById(id)
        .then(post => {
          if (post.length > 0) {
            db.update(id, postInfo)
              .then(() => {
                db.findById(id)
                  .then(newPost => {
                    res.status(200).json(newPost);
                  })
                  .catch(err => {
                    res.status(500).json({ error: "The post information could not be modified." });
                  });
              })
              .catch(err => {
                res
                  .status(500)
                  .json({ error: "The post information could not be modified." });
              });
          } else {
            res.status(404).json({
              message: "The post with the specified ID does not exist."
            });
          }
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: "The post information could not be modified." });
        });
    }
  });

router.delete("/:id", (req, res) => {
    const {id} = req.params;

    db.remove(id)
        .then((post) => {
            if (post) {
                res.status(204).json({message: "The post has been deleted."})
            } else {
                res.status(404).json({ message: "The post with the specified ID does not exist." })
            }
        })
        .catch(() => {
            res.status(500).json({ error: "The post could not be removed" })
        })
});

module.exports = router;