const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {checkAuth, refreshCookie} = require('./helpers/token');

function handler404(req, res, next) {
    res
        .status(404)
        .send('404 - Not Found\n');
}

function handler500(err, req, res, next) {
    console.error(err);
    res
        .status(500)
        .json({message: 'Something went wrong, try again'});
}

module.exports = function setupAPI(app) {
    app.use('/api/',
        bodyParser.json({extended: true}),
        cookieParser()
    );

    app.use('/api/auth', require('./routes/auth.routes'));

    app.use('/api/item',
        checkAuth,
        refreshCookie,
        require('./routes/item.routes')
    );

    app.use('/api/',
        handler404,
        handler500
    );
}
