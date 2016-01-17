module.exports = function(sequelize, DataTypes) {
    return sequelize.define('todo', {
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            notEmpty: true
        },
        completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },{
        hooks: {
            beforeValidate: function(user,options) {
                if(typeof(user.email) === "string"){
                    user.email = user.email.toLowerCase();
                }
            }
        }
    })
};