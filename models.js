const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
      Name: String,
      Description: String
    },
    Director: {
      Name: String,
      Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
  });
  
let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
  });
  

  //After defining schemas we need to create models that use the schemas we just defined. These nodels will be used in index.js to enforce attributes as we perform CRUD operations
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;


