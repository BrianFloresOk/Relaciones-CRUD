const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const { validationResult } = require('express-validator')


//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll()
            .then(movies => {
                res.render('moviesList.ejs', {movies})
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                res.render('moviesDetail.ejs', {movie});
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    add: async function (req, res) {
        try {
            let generos = await Genres.findAll()
            res.render('moviesAdd', {
                allGenres: generos
            })
        } catch (error) {
            throw new Error(error)
        }
    },
    create: async function (req,res) {
        let errors = validationResult(req)
        if(errors.isEmpty()) {
            try {
                const {title, rating, release_date, awards, length, genre_id} = req.body
                let newMovie = await Movies.create({ title, rating, release_date, awards, length, genre_id })
                res.redirect('/movies')
            } catch (error) {
                throw new Error(error)
            }
        } else {
                res.send(errors)
            }
    },
    edit: async function (req,res) {
        try {
            let movie = await Movies.findByPk(req.params.id, {include: ["genero"]})
            let genres = await Genres.findAll()
            res.render('moviesEdit', {
                Movie: movie,
                allGenres: genres
            })
        } catch (error) {
            throw new Error(error)
        }
    },
    update: function (req,res) {
        let errors = validationResult(req);

        if(errors.isEmpty()) 
        {
            const {title, rating, release_date, awards, length, genre_id} = req.body
            db.Movie.update({
                title,
                rating,
                release_date,
                awards,
                length,
                genre_id
            }, {
                where: {
                    id: req.params.id
                }
            })
            .then((response) => {
                if(response) {
                    res.redirect('/movies')
                } else {
                    res.send('No se pudo actualizar')
                }
            })
            .catch((errors)=> res.send(errors))
        }
    },
    delete: function (req,res) {
        db.Movie.findByPk(+req.params.id)
            .then(movie => res.render('moviesDelete', {Movie: movie}))
            .catch(error => res.send(error))
    },
    destroy: function (req,res) {
        db.Movie.destroy({
            where: {
                id: +req.params.id
            },
            include: ['genero']
        })
        .then(() => res.redirect('/movies'))
        .catch(error => res.send(error))
    }
}

module.exports = moviesController;