var bcrypt = require('bcrypt');
var _ = require('underscore');
var jwt = require('jsonwebtoken');
var cryptojs = require('crypto-js');

module.exports = function(sequelize, DataTypes) {
    var user = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        salt: {
            type: DataTypes.STRING
        },
        password_hash: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                len: [7, 100]
            },
            set: function(value) {
                var salt = bcrypt.genSaltSync(10);
                var hashedPassword = bcrypt.hashSync(value, salt);

                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);
            }
        }
    }, {
        hooks: {
            beforeValidate: function(user, options) {
                if (typeof(user.email) === "string") {
                    user.email = user.email.toLowerCase();
                }
            }
        },
        classMethods: {
            authenticate: function(body) {
                return new Promise(function(resolve, reject) {
                    if (typeof body.email === 'string' && typeof body.password === 'string') {

                        user.findOne({
                            where: {
                                email: body.email
                            }
                        }).then(function(user) {
                            if (user && bcrypt.compareSync(body.password, user.get('password_hash'))) {
                                resolve(user);
                            }
                            else {
                                reject();
                            }
                        }, function(error) {
                            reject(error);
                        });
                    }
                    else {
                        reject('Bad Request');
                    }
                });
            },
            findByToken: function(token) {
                return new Promise(function(resolve,reject) {
                    try{
                        var decodeJWT = jwt.verify(token,'narmadha');
                        var bytes = cryptojs.AES.decrypt(decodeJWT.token,'yuvaraj111');
                        var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
                        
                        user.findById(tokenData.id).then(function(user) {
                            if(user){
                                resolve(user);
                            }else {
                                reject();
                            }
                        }, function(error){
                            reject(error);
                        })
                    }catch(e){
                        reject(e);
                    }
                })
            }
        },
        instanceMethods: {
            toPublicJSON: function() {
                var json = this.toJSON();
                return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
            },
            generateToken: function(type) {

                if (!type) {
                    return undefined;
                }
                try {
                    var stringData = JSON.stringify({
                        id: this.get('id'),
                        type: type
                    });
                    
                    console.log(stringData);
                    var encryptedData = cryptojs.AES.encrypt(stringData, 'yuvaraj111').toString();
                    var token = jwt.sign({
                        token: encryptedData
                    }, 'narmadha');
                    return token;
                }
                catch (e) {
                    console.log(e);
                    return undefined;
                }
            }
        }

    });

    return user;
}