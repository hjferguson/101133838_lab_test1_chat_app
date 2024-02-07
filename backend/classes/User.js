const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
    constructor(userName, password, email){
        this._id = uuidv4(); //i want to generate an id just in case. not super necessary for mongo tho
        this.userName = userName;
        this.password = password;
        this.email = email;
        this.timestamp = Date.now();
        
    }

    async hashPassword(){
        const salt = await bcrypt.genSalt(10);
        this.password = await bycript.hash(this.password,salt);
    }
}