const router = require('express').Router();
const { request, response } = require('express');
let User = require('../models/user.model');

router.route('/').get((request, response) => {
    User.find()
        .then(users => response.json(users))
        .catch(err => response.status(400).json(`Error: ${err}`));
});

router.route('/add').post((request, response) => {
    console.log(request);
    const username = request.body.username;
    console.log(username);

    const newUser = new User({username});

    newUser.save()
        .then(() => response.json('User added!'))
        .catch(err => response.status(400).json(`Error: ${err}`));
});

//Gets a user based on id
router.route('/:id').get((request, response) => {
    User.findById(request.params.id)
        .then(user => response.json(user))
        .catch(err => response.status(400).json(`Error: ${err}`));
})

//Deletes a user based on id
router.route('/:id').delete((request, response) => {
    User.findByIdAndDelete(request.params.id)
        .then((user) => {
            if (!user) return response.status(404).json('User not found.');
            return response.json(`User deleted.`)
        })
        .catch(err => response.status(400).json(`Error: ${err}`));
});

router.route('/:id').post((request, response) => {
    User.findById(request.params.id)
        .then(user => {
            user.username = request.body.username;
            user.save()
                .then(() => response.json('User updated!'))
                .catch(err => response.status(400).json(`Error: ${err}`));
        })
        .catch(err => response.status(400).json(`Error ${err}`));
})

module.exports = router;