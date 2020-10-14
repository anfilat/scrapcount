const {Router} = require('express');
const item = require('./item');
const {stopOnError} = require('./util');

const router = Router();

// /api/item/add
router.post(
    '/add',
    [
        ...item.checkAdd,
        stopOnError('Empty text'),
    ],
    item.add
);

// /api/item/resave
router.post(
    '/resave',
    [
        ...item.checkResave,
        stopOnError('Incorrect data'),
    ],
    item.resave
);

// /api/item/update
router.post(
    '/update',
    [
        ...item.checkUpdate,
        stopOnError('Incorrect data'),
    ],
    item.update
);

// /api/item/del
router.post(
    '/del',
    [
        ...item.checkDell,
        stopOnError('Incorrect data'),
    ],
    item.del
);

module.exports = router;
