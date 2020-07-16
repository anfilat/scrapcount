const path = require('path');
const express = require('express');
const config = require('config');
const db = require('./db');

const app = express();

app.use(express.json({extended: true}));

app.use('/api/auth', require('./routes/auth.routes'));

if (process.env.NODE_ENV === 'production') {
    app.use('/', express.static(path.join(__dirname, 'client', 'build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

(async function start() {
    const PORT = config.get('port') ?? 5000;

    try {
        await db.initDb();
        app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`));
    } catch (e) {
        console.error('Server Error', e.message);
        process.exit(1);
    }
})();