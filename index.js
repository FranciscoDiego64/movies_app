const express = require(('express'));
//const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const app = express();

//app.use(morgan('common'));
app.use(bodyParser.json());

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
    
app.listen(8080, () => {
console.log('Your app is listening on port 8080.')
})