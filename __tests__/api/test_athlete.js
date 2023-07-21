const { makeApiRequest } = require('../../utils/common');

describe('GET Athlete Endpoint', () => {
          it('should return a 200 (OK) response code', async () => {
                    const response = await makeApiRequest('athlete', 'GET');
                    expect(response.status).toBe(200);
          });
});
