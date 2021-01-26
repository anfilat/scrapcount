const {initDb, closeDb} = require('./core');
const {addAccount, getAccount} = require('./auth.db');
const {addItem, getItem, reSaveItem, updateItem, delItem} = require('./item.db');
const {getLastSearchIds, setLastSearchIds, getSearchIds, listItems} = require('./search.db');
const {listTags} = require('./tag.db');
const {addToken, getToken, delToken, deleteOldTokens} = require('./token.db');

module.exports = {
    initDb,
    closeDb,

    addAccount,
    getAccount,

    addItem,
    getItem,
    reSaveItem,
    updateItem,
    delItem,

    getLastSearchIds,
    setLastSearchIds,
    getSearchIds,
    listItems,

    listTags,

    addToken,
    getToken,
    delToken,
    deleteOldTokens,
};
