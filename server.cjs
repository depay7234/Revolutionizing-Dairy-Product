const mongoose = require('mongoose');
const app = require("./app");
const port = 3001;

// MongoDB connection
mongoose.connect("mongodb+srv://developerdp7:GoCHILct0lX9D2Me@cluster0.aaaujv5.mongodb.net/")

  .then(() => {
    console.log('Mongoose Connected');
  })
  .catch((e) => {
    console.log('Failed to connect to MongoDB:', e.message);
  });


  // GoCHILct0lX9D2Me
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
