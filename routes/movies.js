var express = require('express');
var router = express.Router();

const axios = require('axios');

router.get('/', async function(req, res, next) {
  let page = req.query['page'] ? parseFloat(req.query['page']) : 1;
  let results = [];
  try {
    axios.get(`${process.env.THEMOVIEDB_UPCOMING_MOVIES_URL}/?api_key=${process.env.THEMOVIEDB_API_KEY}&language=en-US&page=${page}`)
        .then((firstResponse)=>{
          results = [...results,...firstResponse.data.results];
            axios.get(`${process.env.THEMOVIEDB_UPCOMING_MOVIES_URL}/?api_key=${process.env.THEMOVIEDB_API_KEY}&language=en-US&page=${page+1}`)
              .then((secResponse)=>{
                results = [...results,...secResponse.data.results];
                results = formatImagesURL(results);
                res.status(200).json({
                  page,
                  results,
                  totalPages: secResponse.data.total_pages
                });
              });
        });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

router.get('/movie/:movie_id', async function(req, res, next) {
    try {
        axios.get(`${process.env.THEMOVIEDB_MOVIES_DETAILS_URL}/${req.params.movie_id}?api_key=${process.env.THEMOVIEDB_API_KEY}&language=en-US`)
            .then((response)=>{
                res.status(200).json(completeImagesURLs(response.data));
            });
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

router.get('/search', async function(req, res, next) {
    let query = req.query['q'] || '';
    let page = req.query['page'] ? parseFloat(req.query['page']) : 1;
    let results = [];
    if(req.query['q'] === ''){
        try {
            axios.get(`${process.env.THEMOVIEDB_UPCOMING_MOVIES_URL}/?api_key=${process.env.THEMOVIEDB_API_KEY}&language=en-US&page=${page}`)
                .then((firstResponse)=>{
                    results = [...results,...firstResponse.data.results];
                    axios.get(`${process.env.THEMOVIEDB_UPCOMING_MOVIES_URL}/?api_key=${process.env.THEMOVIEDB_API_KEY}&language=en-US&page=${page+1}`)
                        .then((secResponse)=>{
                            results = [...results,...secResponse.data.results];
                            results = formatImagesURL(results);
                            res.status(200).json({
                                page,
                                results,
                                totalPages: secResponse.data.total_pages
                            });
                        });
                });
        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        }
    }else{
        try {
            axios.get(`${process.env.THEMOVIEDB_MOVIES_SEARCH_URL}?&include_adult=false&api_key=${process.env.THEMOVIEDB_API_KEY}&language=en-US&query=${query}`)
                .then((response)=>{
                    results = [...results,...response.data.results];
                    results = formatImagesURL(results);
                    res.status(200).json({
                        page,
                        results,
                        totalPages: response.data.total_pages
                    });
                });
        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        }
    }
});

const formatImagesURL = (moviesList) => {
    for(let i = 0, ilen = moviesList.length; i < ilen; i++){
        moviesList[i] = completeImagesURLs(moviesList[i]);
    }
    return moviesList;
};

const completeImagesURLs = (obj) => {
    obj.poster_path = `${process.env.THEMOVIEDB_MOVIES_THUMB_URL}${obj.poster_path}`;
    obj.backdrop_path = `${process.env.THEMOVIEDB_MOVIES_THUMB_URL}${obj.backdrop_path}`;
    return obj;
};

module.exports = router;
