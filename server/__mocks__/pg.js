const { newDb } = require('pg-mem');

let pgMem;
let pgMemPool;
let backup;

function createPgMem() {
    pgMem = newDb();

    const adapter = pgMem.adapters.createPg();
    pgMemPool = new adapter.Pool({
        connectionString: process.env.APP_PG_CONNECT,
    });
}

async function refreshDb() {
    if (backup) {
        backup.restore();
        return;
    }

    await pgMemPool.query(sqlInit);

    backup = pgMem.backup();
}

let pgMock;
let pgMockQuery;
let pgMockConnect;
let pgMockOn;

function createPgMock() {
    pgMock = jest.createMockFromModule('pg');
    pgMockQuery = jest.fn();
    pgMockConnect = jest.fn(() => ({
        query: pgMockQuery,
        release: jest.fn(),
    }))
    pgMockOn = jest.fn();
}

function switchToPgMem() {
    pool.query = pgMemPool.query.bind(pgMemPool);
    pool.connect = pgMemPool.connect.bind(pgMemPool);
    pool.on = pgMemPool.on.bind(pgMemPool);
}

function switchToPgMock() {
    pool.query = pgMockQuery;
    pool.connect = pgMockConnect;
    pool.on = pgMockOn;
}

let pool = {
    refreshDb,
    switchToPgMem,
    switchToPgMock,
};

module.exports = {
    Pool: function() {
        createPgMem();
        createPgMock();
        switchToPgMem();

        return pool;
    }
};

const sqlInit = `
    CREATE TABLE account (
        account_id serial PRIMARY KEY,
        email VARCHAR(128) NOT NULL,
        password VARCHAR(128),
        
        CONSTRAINT account_email_key UNIQUE (email)
    );

    CREATE TABLE token (
        token CHAR(36) PRIMARY KEY,
        account_id int NOT NULL
    );

    ALTER TABLE token ADD CONSTRAINT token_account_id_fk FOREIGN KEY (account_id) REFERENCES account(account_id);

    CREATE TABLE text (
        text_id serial PRIMARY KEY,
        account_id int NOT NULL,
        text TEXT,
        time timestamp NOT NULL
    );

    ALTER TABLE text ADD CONSTRAINT text_account_id_fk FOREIGN KEY (account_id) REFERENCES account(account_id);

    CREATE INDEX text_account_id_idx ON text(account_id);

    CREATE TABLE mem (
        mem_id serial PRIMARY KEY,
        account_id int NOT NULL,
        text_id int NOT NULL,
        create_time timestamp NOT NULL,
        last_change_time timestamp NOT NULL
    );

    ALTER TABLE mem ADD CONSTRAINT mem_account_id_fk FOREIGN KEY (account_id) REFERENCES account(account_id);
    ALTER TABLE mem ADD CONSTRAINT mem_text_id_fk FOREIGN KEY (text_id) REFERENCES text(text_id);

    CREATE INDEX mem_account_id_idx ON mem(account_id);

    CREATE TABLE mem_text (
        mem_id int NOT NULL,
        text_id int NOT NULL,

        PRIMARY KEY (mem_id, text_id)
    );

    ALTER TABLE mem_text ADD CONSTRAINT mem_text_mem_id_fk FOREIGN KEY (mem_id) REFERENCES mem(mem_id);
    ALTER TABLE mem_text ADD CONSTRAINT mem_text_text_id_fk FOREIGN KEY (text_id) REFERENCES text(text_id);

    CREATE INDEX mem_text_mem_id_idx ON mem_text(mem_id);

    CREATE TABLE tag (
        tag_id serial PRIMARY KEY,
        account_id int NOT NULL,
        tag VARCHAR(200) NOT NULL,
        time timestamp NOT NULL,
        
        CONSTRAINT tag_account_id_tag UNIQUE (account_id, tag)
    );

    ALTER TABLE tag ADD CONSTRAINT tag_account_id_fk FOREIGN KEY (account_id) REFERENCES account(account_id);

    CREATE TABLE mem_tag (
        mem_id int NOT NULL,
        tag_id int NOT NULL,
        
        PRIMARY KEY (mem_id, tag_id)
    );

    ALTER TABLE mem_tag ADD CONSTRAINT mem_tag_mem_id_fk FOREIGN KEY (mem_id) REFERENCES mem(mem_id);
    ALTER TABLE mem_tag ADD CONSTRAINT mem_tag_tag_id_fk FOREIGN KEY (tag_id) REFERENCES tag(tag_id);

    CREATE INDEX mem_tag_mem_id_idx ON mem_tag(mem_id);


    INSERT INTO account (email, password) VALUES ('test@test.com', '$2b$10$Buow0yAuljN7cs8vmrtGFOMHd9/78dx7cYuPYop.aA5WdcDX380Ri');
    INSERT INTO token (token, account_id) VALUES ('someToken', 1);
    INSERT INTO text (account_id, text, time) VALUES (1, 'Some text', now());
    INSERT INTO mem (account_id, text_id, create_time, last_change_time) VALUES (1, 1, now(), now());
    INSERT INTO mem_text (mem_id, text_id) VALUES (1, 1);
    INSERT INTO tag (account_id, tag, time) VALUES (1, 'something', now());
    INSERT INTO tag (account_id, tag, time) VALUES (1, 'other', now());
    INSERT INTO tag (account_id, tag, time) VALUES (1, 'it', now());
    INSERT INTO tag (account_id, tag, time) VALUES (1, 'and it', now());
`;
