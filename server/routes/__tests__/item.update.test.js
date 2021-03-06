const request = require('supertest');
const app = require('../../app');

describe('item update', () => {
    const query = app._db.query;

    beforeEach(() => {
        return app._db.refreshDb();
    });

    test('success', async () => {
        const sqlNewTag = `SELECT count(tag_id) AS count FROM tag WHERE account_id = $1 AND tag = $2`;
        const sqlNewTagValues = [1, 'new tag'];
        expect((await query(sqlNewTag, sqlNewTagValues)).rows[0].count).toBe(0);

        await request(app)
            .post('/api/item/update')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Other text',
                tags: ['something', 'new tag'],
                itemId: 1,
                textId: 1,
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Text saved');
            });

        expect((await query(sqlNewTag, sqlNewTagValues)).rows[0].count).toBe(1);
        const sqlMemTags = `SELECT count(tag_id) AS count FROM mem_tag WHERE mem_id = $1`;
        const sqlMemTagsValues = [1];
        expect((await query(sqlMemTags, sqlMemTagsValues)).rows[0].count).toBe(2);
    });

    test('success with same tags', async () => {
        await request(app)
            .post('/api/item/update')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Other text',
                tags: ['something', 'other'],
                itemId: 1,
                textId: 1,
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Text saved');
            });

        const sql = `SELECT count(tag_id) AS count FROM mem_tag WHERE mem_id = $1`;
        const values = [1];
        expect((await query(sql, values)).rows[0].count).toBe(2);
    });

    test('success without tags', async () => {
        await request(app)
            .post('/api/item/update')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Other text',
                itemId: 1,
                textId: 1,
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Text saved');
            });

        const sql = `SELECT count(tag_id) AS count FROM mem_tag WHERE mem_id = $1`;
        const values = [1];
        expect((await query(sql, values)).rows[0].count).toBe(0);
    });

    test('fail on outdated textId', async () => {
        await request(app)
            .post('/api/item/resave')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'New text',
                itemId: 1,
            })
        await request(app)
            .post('/api/item/update')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Some text',
                itemId: 1,
                textId: 1,
            })
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Outdated');
                expect(body).toHaveProperty('outdated', true);
            });
    });

    test('fail without data', async () => {
        await request(app)
            .post('/api/item/update')
            .set('Cookie', 'token=someToken')
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });
});
