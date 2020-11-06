const jwt = require('jsonwebtoken')
const config = require('config')

// This is a middleware
// When a request comes with a token in its header, what we really care
// about is the user id of the requester in the database and not the token
// because the id will give us access to his/her data
// This middleware validates the token and injects the user id into the request
// and send the request to the next middleware

module.exports = function(req,res,next) {
    // Get Token from the header
    const token = req.header('x-auth-token');

    // Check if no token in the request
    if(!token){
        return res.status(401).json({ msg : 'No Token, authorization denied!'})
    }

    // Verify the token , remember the token is a decrypted id 
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        req.user = decoded.user;
        next();
    } catch(err){
        res.status(401).json({ msg : 'Token is not valid!'})
    }
}