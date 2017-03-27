const Sequelize = require('sequelize');
const db = new Sequelize(`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost/food_app`);



//CREATE USER
db.User = db.define('user', {
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING
});

 
db.Food = db.define('food', {
	name: Sequelize.STRING,
	time: Sequelize.STRING,
	healthy: Sequelize.STRING,
	grams : Sequelize.INTEGER,
	unit : Sequelize.INTEGER,
	size: Sequelize.STRING,
	
});


//RELATIONS
db.User.hasMany(db.Food);
db.Food.belongsTo(db.User);


db.sync(
    {force: true}
)
    .then(function(db) {
        const user1 = {
            name: 'klaas',
            email: 'klaas@gmail.com',
            password: 'klaas123'
        }
        db.User.create(user1)
    })
    .catch( (error) => console.log(error));


module.exports = db;