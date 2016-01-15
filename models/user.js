 
 module.exports = function(sequelize,DataTypes) {
     return sequelize.define('user',{
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            len: [7,100]
        }
     });
 }