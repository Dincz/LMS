// const Joi = require("joi");
import Joi from 'joi'

const regSchema = Joi.object({
    fullName: Joi.string()
        .alphanum()
        .min(3)
        .message("Minimum length is 3")
        .max(30)
        .required(),
    email: Joi.string()
        .min(3)
        .max(22)
        .email()
        .required(),
    password: Joi.string()
        .min(8)
        .max(30)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,30}$/)
        .message("Password must be 8-30 characters long and include at least one uppercase letter, one lowercase letter, and one digit")
        .invalid("password", "123456", "helloworld"),
});

const logSchema = Joi.object({
    email: Joi.string()
        .min(3)
        .max(22)
        .email()
        .required(),
    password: Joi.string()
        .min(8)
        .max(30)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,30}$/)
        .message("Password must be 8-30 characters long and include at least one uppercase letter, one lowercase letter, and one digit")
        .invalid("password", "123456", "helloworld"),
});

// module.exports = { regSchema };
export {regSchema ,logSchema};
