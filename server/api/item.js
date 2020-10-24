const {body} = require('express-validator');
const db = require('../db');

exports.checkAdd = [
    body('text')
        .custom(value => typeof value === 'string' && value.trim() !== '')
        .withMessage('Empty text'),
    body('tags')
        .custom(value => value == null || Array.isArray(value))
        .withMessage('Tags are not array'),
];

exports.add = async (req, res) => {
    const {text, tags} = req.body;
    const {memId: itemId, textId} = await db.addItem(req.userData.userId, text, tags);

    res
        .status(201)
        .json({
            message: 'Text saved',
            itemId,
            textId,
        });
}

exports.checkGet = [
    body('itemId')
        .notEmpty()
        .withMessage('No item id'),
];

exports.get = async (req, res) => {
    const {itemId} = req.body;
    const {text, textId, ok} = await db.getItem(req.userData.userId, itemId);

    if (ok) {
        res.json({
            text,
            textId,
        });
    } else {
        res
            .status(400)
            .json({
                message: 'Item not found',
            });
    }
}

exports.checkResave = [
    body('itemId')
        .notEmpty()
        .withMessage('No item id'),
    body('text')
        .custom(value => typeof value === 'string' && value.trim() !== '')
        .withMessage('Empty text'),
];

exports.resave = async (req, res) => {
    const {itemId, text} = req.body;
    const textId = await db.resaveItem(req.userData.userId, itemId, text);

    res.json({
        message: 'Text saved',
        itemId,
        textId,
    });
}

exports.checkUpdate = [
    body('itemId')
        .notEmpty()
        .withMessage('No item id'),
    body('textId')
        .notEmpty()
        .withMessage('No text id'),
    body('text')
        .custom(value => typeof value === 'string' && value.trim() !== '')
        .withMessage('Empty text'),
];

exports.update = async (req, res) => {
    const {itemId, textId, text} = req.body;
    const ok = await db.updateItem(req.userData.userId, itemId, textId, text);

    if (ok) {
        res.json({
            message: 'Text saved',
        });
    } else {
        res
            .status(400)
            .json({
                message: 'Outdated',
                outdated: true,
            });
    }
}

exports.checkDell = [
    body('itemId')
        .notEmpty()
        .withMessage('No item id'),
];

exports.del = async (req, res) => {
    const {itemId} = req.body;
    await db.delItem(req.userData.userId, itemId);

    res.json({
        message: 'Item deleted',
    });
}
