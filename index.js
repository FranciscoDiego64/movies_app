const express = require(('express'));
const morgan = require('morgan');


const app = express();

app.use(morgan('common'));

let topMovies = [
    {
      title: 'Interestellar',
      director: 'Christopher Nolan'
    },
    {
      title: 'Lost In Translation',
      director: 'Sofia Coppola'
    },
    {
      title: 'Dobermann',
      director: 'Jan Kounen'
    },
    {
      title: 'The Warriors',
      director: 'Walter Hill'
    },
    {
      title: 'Whiplash',
      director: 'Damien Chazelle'
    },
    {
      title: 'Alien',
      director: 'Ridley Scott'
    }
    ];
    
    //GET requests
    
    app.get('/', (req, res) => {
    res.send ('welcome to whatever');
    });
    
   /* app.get('/documentation', (req, res) => {                  
      res.sendFile('public/documentation.html', { root: __dirname });
    }); */
    
    app.get('/movies', (req, res) => {
    res.json(topMovies);
    });

    app.get('/secreturl', (req, res) => {
        res.send('This is a secret url with super top-secret content.');
    });

    app.get('/testurl', (req, res) => {
        res.send('lets see if this works!');
    });
    
    app.use(express.static('public'));

    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
      });
    
    app.listen(8080, () => {
      console.log('Your app is listening on port 8080.');
    });