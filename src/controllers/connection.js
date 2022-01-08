const Joi = require("joi");
const responseCreator = require("../utils/responseCreator");
const { sequelize, Sequelize } = require("../database/models");
const config = require("config");

const addConnection = {
    security: {
        authenticationLayer: true,
        authorizationLayer: false,
        validationLayer: true,
    },

    validationSchema: {
        body: {
            connectedUserID: Joi.string()
                .required()
                .label("Connected User ID")
        },
    },

    async handler(req, res) {
        try {
            if (req.user.userID === req.body.connectedUserID) {
                return res
                    .status(400)
                    .send(responseCreator("error", "Can not add connection to same user"));
            }
            console.log("User ID: ", req.user.userID);
            console.log("Connected User ID: ", req.body.connectedUserID);
            await sequelize.models.Connection.create({
                userID: req.user.userID,
                connectedUserID: req.body.connectedUserID
            });
            res
                .status(200)
                .send(
                    responseCreator("success", "Successfully added new connection")
                );
        } catch (e) {
            const errorMsg = e.message;
            console.log(errorMsg);
            res
                .status(400)
                .send(responseCreator("error", "Request can't be proceed"));
        }
    },
};

const removeConnection = {
    security: {
        authenticationLayer: true,
        authorizationLayer: false,
        validationLayer: true,
    },

    validationSchema: {
        body: {
            connectedUserID: Joi.string()
                .required()
                .label("Connected User ID")
        },
    },

    async handler(req, res) {
        try {
            if (req.user.userID === req.body.connectedUserID) {
                return res
                    .status(400)
                    .send(responseCreator("error", "No connection with user himself"));
            }

            await sequelize.models.Connection.destroy({
                where: {
                    userID: {
                        [Sequelize.Op.eq]: req.user.userID,
                    },
                    connectedUserID: {
                        [Sequelize.Op.eq]: req.body.connectedUserID
                    }
                }
            });

            res
                .status(200)
                .send(
                    responseCreator("success", "Successfully removed connection")
                );
        } catch (e) {
            const errorMsg = e.message;
            console.log(errorMsg);
            res
                .status(400)
                .send(responseCreator("error", "Request can't be proceed"));
        }
    },
};

const getConnections = {
    security: {
        authenticationLayer: true,
        authorizationLayer: false,
        validationLayer: false,
    },

    async handler(req, res) {
        try {
            const connections = await sequelize.models.Connection.findAll({
                where: {
                    userID: {
                        [Sequelize.Op.eq]: req.user.userID
                    }
                },
                include: sequelize.models.User,
                attributes: {
                    exclude: ['userID', "connectedUserID"]

                }
            });
            console.log("Connections", connections);
            res
                .status(200)
                .send(
                    responseCreator("success", "Successfully retrieved connections", connections)
                );
        } catch (e) {
            const errorMsg = e.message;
            console.log(errorMsg);
            res
                .status(400)
                .send(responseCreator("error", "Request can't be proceed"));
        }
    },
}

const getAllUsers = {
    security: {
        authenticationLayer: true,
        authorizationLayer: false,
        validationLayer: false,
    },

    async handler(req, res) {
        try {
            const users = await sequelize.models.User.findAll({
                where: {
                    userID: {
                        [Sequelize.Op.ne]: req.user.userID
                    }
                },
                include: {
                    model: sequelize.models.UserAccount,
                    attributes: {
                        exclude: ["userID", 'password', "temporaryPassword", "status"]

                    }
                },

            });
            console.log("users", users);
            res
                .status(200)
                .send(
                    responseCreator("success", "Successfully retrieved users", users)
                );
        } catch (e) {
            const errorMsg = e.message;
            console.log(errorMsg);
            res
                .status(400)
                .send(responseCreator("error", "Request can't be proceed"));
        }
    },
}

const getDisconnectedUsers = {
    security: {
        authenticationLayer: true,
        authorizationLayer: false,
        validationLayer: false,
    },

    async handler(req, res) {
        try {
            const disconnectedUsers = await sequelize
                .query(`SELECT * 
                        FROM Users
                        WHERE userID != '${req.user.userID}' AND userID NOT IN (SELECT connectedUSerID
                        FROM Connections
                        WHERE userID ='${req.user.userID}')`, { type: sequelize.QueryTypes.SELECT });
            res
                .status(200)
                .send(
                    responseCreator("success", "Successfully retrieved disconnected users", disconnectedUsers)
                );
        } catch (e) {
            const errorMsg = e.message;
            console.log(errorMsg);
            res
                .status(400)
                .send(responseCreator("error", "Request can't be proceed"));
        }
    },
}

module.exports = {
    addConnection,
    removeConnection,
    getConnections,
    getDisconnectedUsers,
    getAllUsers
};
