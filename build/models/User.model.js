"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
class UserModel {
    constructor(user) {
        this.user = user;
    }
    // Getters
    get id() {
        return this.user.id;
    }
    get email() {
        return this.user.email;
    }
    get name() {
        return this.user.name;
    }
    toJSON() {
        return {
            id: this.user.id,
            email: this.user.email,
            name: this.user.name,
            createdAt: this.user.createdAt,
            updatedAt: this.user.updatedAt,
        };
    }
}
exports.UserModel = UserModel;
