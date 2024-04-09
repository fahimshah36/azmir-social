const mongoose = require("mongoose")
const Schema = mongoose.Schema
const { ObjectId } = mongoose.Schema

const UserModel = new Schema(
    {
        fName: {
            type: String,
            require: true,
            trim: true,
            text: true
        },
        lName: {
            type: String,
            require: true,
            trim: true,
            text: true
        },
        username: {
            type: String,
            require: true,
            trim: true,
            unique: true,
            text: true
        },
        email: {
            type: String,
            require: true,
            trim: true
        },
        password: {
            type: String,
            require: true
        },
        profilePicture: {
            type: String,
            default: ""
        },
        cover: {
            type: String,
            trim: true,
        },
        bMonth: {
            type: Number,
            require: true,
            trim: true,
        },
        bDay: {
            type: Number,
            require: true,
            trim: true,
        },
        bYear: {
            type: Number,
            require: true,
            trim: true,
        },
        gender: {
            type: String,
            require: true
        },
        verified: {
            type: Boolean,
            default: false
        },
        friends: [
            {
                type: ObjectId,
                ref: 'usermodel'
            }
        ],
        followers: [
            {
                type: ObjectId,
                ref: 'usermodel'
            }
        ],
        following: [
            {
                type: ObjectId,
                ref: 'usermodel'
            }
        ],
        request: [
            {
                type: ObjectId,
                ref: 'usermodel'
            }
        ],
        search: [
            {
                user: {
                    type: ObjectId,
                    ref: 'usermodel',
                    require: true,
                    text: true
                },
                createdAt: {
                    type: Date,
                    require: true
                }
            }
        ],
        details: {
            bio: {
                type: String
            },
            othername: {
                type: String
            },
            job: {
                type: String
            },
            currentcity: {
                type: String
            },
            workplace: {
                type: String
            },
            college: {
                type: String
            },
            highschool: {
                type: String
            },
            hometown: {
                type: String
            },
            relationship: {
                type: String,
                enum: [
                    "Single",
                    "In A Relationship",
                    "It's Complicated",
                    "Married",
                    "Divorced"
                ]
            },
            instagram: {
                type: String
            }
        },
        savePost: [
            {
                post: {
                    type: ObjectId,
                    ref: "post"
                },
                savedAt: {
                    type: Date,
                    require: true
                }
            }
        ]
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('usermodel', UserModel);