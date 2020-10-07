const request = require('supertest');
const app = require('../app');

test('get index.html', () => {
    return request(app)
        .get('/')
        .expect('Content-Type', /text\/html/)
        .expect(200)
        .expect(({text}) => expect(text).toMatchSnapshot());
});

test('get some page html', () => {
    return request(app)
        .get('/name')
        .expect('Content-Type', /text\/html/)
        .expect(200)
        .expect(({text}) => expect(text).toMatchSnapshot());
});

test('api wrong endpoint', () => {
    return request(app)
        .get('/api/wrong')
        .expect(404);
});

test('api wrong verb', () => {
    return request(app)
        .get('/api/auth/login')
        .expect(404);
});
