const express = require(('express'));
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');


const Movies = Models.Movie;
const Users = Models.User;

const { check, validationResult } = require('express-validator');

//mongoose.connect('mongodb://localhost:27017/electricCinema', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

//app.use(morgan('common'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app); //.app ensures Express is available in the auth.js file as well
//Now we require the passport module and the passport.js file
const passport = require('passport');
require('./passport');

//CREATE 

app.post('/users', 
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//READ
//Get all users

app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch ((err) => {
      console.error(err);
      res.status(500).send('Error bro ' + err);
    });
 });

 //Get all movies

 app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch ((err) => {
      console.error(err);
      res.status(500).send('Error bro ' + err);
    });
 });

 //GET movie info

 app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((title) => {
      res.json(title);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});



//GET one specific user by username

app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET genre by name 

app.get('/movies/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.Name })  
    .then((movies) => {
      res.json(movies.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET Director by name

app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ "Director.Name": req.params.Name})
  .then ((movies) => {
    res.json(movies.Director);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//UPDATE PLEASE CHECK

app.put('/users/:Username', passport.authenticate('jwt', { session: false }),

[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//POST
// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//DELETE
// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


  //READ TEST
  app.get('/testurl', (req, res) => {
      res.status(200).send('hello there');
    });

  app.get('/', (req, res) => {
      res.send('Welcome to Electric Cinema!');
    });
    
  app.get('/documentation', (req, res) => {                  
      res.sendFile('public/documentation.html', { root: __dirname });
    });
    



const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});

/* app.listen(8080, () => {
  console.log('Your app is listening on port 8080.')
  })
  */

/*let topMovies = [
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
    }); 
    
    app.get('/movies', (req, res) => {
    res.json(topMovies);
    });

    app.get('/secreturl', (req, res) => {
        res.send('This is a secret url with super top-secret content.');
    });

    app.get('/testurl', (req, res) => {
        res.send('lets see if this works!');
    });
    
    app.use(express.static('public')); */
/*
    let users = [
      {
        id: 1,
        name: "Diego",
        favoriteMovies: []
      },
      {
        id: 2,
        name: "Paula",
        favoriteMovies: ["Dobermann"]
      },
    ];
    
    let movies = [
      {
        "Title": "Movie 1",
        "Description": "",
        "Genre": {
          "Name": "Action",
          "Description":"."
        },
        "Director":{
          "Name":"Director 1",
          "Bio":"Bio Director 1",
          "Birth":1974,
        },
        "ImageURL":"",
        "Featured": false
      },
      {
        "Title": "Movie 2",
        "Description": "",
        "Genre": {
          "Name": "Drama",
          "Description":""
        },
        "Director":{
          "Name":"Director 2",
          "Bio":"Bio Director 2",
          "Birth":1987,
        },
        "ImageURL":"",
        "Featured": false
      },
      {
        "Title": "Interstellar",
        "Description": "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
        "Genre": {
          "Name": "Sci-Fi",
          "Description":"Science fiction (sometimes shortened to Sci-Fi or SF) is a genre of speculative fiction which typically deals with imaginative and futuristic concepts such as advanced science and technology, space exploration, time travel, parallel universes, extraterrestrial life, sentient artificial intelligence, cybernetics, certain forms of immortality (like mind uploading), and the singularity. Science fiction predicted several existing inventions, such as the atomic bomb, robots and borazon, whose names entirely match their fictional predecessors."
        },
        "Director":{
          "Name":"Christopher Nolan",
          "Bio":"Over the course of 15 years of filmmaking, Nolan has gone from low-budget independent films to working on some of the biggest blockbusters ever made",
          "Birth":1970,
        },
        "ImageURL":"https://en.wikipedia.org/wiki/Interstellar_(film)#/media/File:Interstellar_film_poster.jpg",
        "Featured": false
      },
    ];

//READ

app.get('/movies', (req, res) => {
  res.status(200).json(movies);
})

//READ
app.get('/movies/:title', (req, res) => { //:title = soemthing that will be written in the req -url string-, a placeholder
  // const title = req.params.title;
  const { title } = req.params;
  const movie = movies.find( movie => movie.Title === title ); //find method which sits on the array
  
  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('movie not found')
  }

})

  //READ
app.get('/movies/genre/:genreName', (req, res) => {
  // const genre = req.params.genre;
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre; 
    
  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('genre not found')
  } 
  
})

//READ - Director by name

app.get('/movies/directors/:directorName', (req, res) => {
  // const genre = req.params.genre;
  const { directorName } = req.params;
  const director = movies.find( movie => movie.Director.Name === directorName ).Director; 
    
  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('genre not found')
  } 
  
})

//CREATE - Create new user

app.post ('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  }else{
    res.status(400).send('users need name')
  }
})

//UPDATE - Update existing user

app.put ('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find ( user => user.id == id );

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('not such user')
  }
})

//CREATE 

app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find ( user => user.id == id );

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
})

//DELETE

app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find ( user => user.id == id );

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }
})

//DELETE -deregister user

app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find ( user => user.id == id );

  if (user) {
    users = users.filter( user => user.id != id);
    //res.json(users)
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send('no such user')
  }
})


app.use(express.static('public'));

/*app.use((err, req, res, next) => {
 console.error(err.stack);
 res.status(500).send('Something broke!');
    }); */
    
/* app.listen(8080, () => {
console.log('Your app is listening on port 8080.')
})
*/