const { makeApiRequest } = require('../../utils/common');
require('dotenv').config();
const frisby = require('frisby');

const athleteId = process.env.STRAVA_ATHLETE_ID;

describe('Athlete Endpoint', () => {
          it('should return a 200 (OK) response code', async () => {
                    const response = await makeApiRequest('athlete', 'GET');
                    expect(response.status).toBe(200);
          });

          it('should have the expected fields in the response', async () => {
                    const response = await makeApiRequest('athlete', 'GET');
                    expect(response.status).toBe(200);

                    // Check if the response contains the expected fields
                    const expectedFields = [
                              'id',
                              'username',
                              'resource_state',
                              'firstname',
                              'lastname',
                              'bio',
                              'city',
                              'state',
                              'country',
                              'sex',
                              'premium',
                              'summit',
                              'created_at',
                              'updated_at',
                              'badge_type_id',
                              'weight',
                              'profile_medium',
                              'profile',
                              'friend',
                              'follower',
                    ];

                    const responseData = response.json;
                    for (const field of expectedFields) {
                              expect(responseData).toHaveProperty(field);
                    }

                    // Check the data types of the fields
                    expect(typeof responseData.id).toBe('number');
                    expect(typeof responseData.username).toBe('string');
                    expect(typeof responseData.resource_state).toBe('number');
                    expect(typeof responseData.firstname).toBe('string');
                    expect(typeof responseData.lastname).toBe('string');
                    expect(
                              responseData.bio === null ||
                                        typeof responseData.bio === 'string'
                    ).toBe(true);
                    expect(typeof responseData.city).toBe('string');
                    expect(typeof responseData.state).toBe('string');
                    expect(typeof responseData.country).toBe('string');
                    expect(typeof responseData.sex).toBe('string');
                    expect(typeof responseData.premium).toBe('boolean');
                    expect(typeof responseData.summit).toBe('boolean');
                    expect(typeof responseData.created_at).toBe('string');
                    expect(typeof responseData.updated_at).toBe('string');
                    expect(typeof responseData.badge_type_id).toBe('number');
                    expect(typeof responseData.weight).toBe('number');
                    expect(typeof responseData.profile_medium).toBe('string');
                    expect(typeof responseData.profile).toBe('string');
                    expect(
                              responseData.friend === null ||
                                        typeof responseData.friend === 'string'
                    ).toBe(true);
                    expect(
                              responseData.follower === null ||
                                        typeof responseData.follower ===
                                                  'string'
                    ).toBe(true);
          });

          it('should have the expected values for specific fields', async () => {
                    const response = await makeApiRequest('athlete', 'GET');
                    expect(response.status).toBe(200);

                    const responseData = response.json;

                    // Check specific field values
                    const expectedUsername = process.env.STRAVA_USERNAME;
                    const expectedCity = process.env.STRAVA_CITY;

                    expect(responseData.username).toBe(
                              expectedUsername,
                              "The value of the 'username' field does not match the expected value"
                    );

                    expect(responseData.city).toBe(
                              expectedCity,
                              "The value of the 'city' field does not match the expected value"
                    );
          });

          it('should return 401 Unauthorized', () => {
                    const url = 'https://www.strava.com/api/v3/athlete';
                    return frisby.get(url).expect('status', 401);
          });

          it('should return 401 Unauthorized with invalid token', () => {
                    const url = 'https://www.strava.com/api/v3/athlete';
                    const headers = {
                              Authorization: 'Bearer invalid token',
                    };

                    return frisby.get(url, { headers }).expect('status', 401);
          });

          it('should not include sensitive information in the response', async () => {
                    const response = await makeApiRequest('athlete', 'GET');
                    const responseData = response.json;

                    expect(responseData).not.toHaveProperty('access_token');
                    expect(responseData).not.toHaveProperty('refresh_token');
                    expect(responseData).not.toHaveProperty('password');
                    expect(responseData).not.toHaveProperty('email');
                    expect(responseData).not.toHaveProperty('credit_card');
                    expect(responseData).not.toHaveProperty(
                              'social_security_number'
                    );
                    expect(responseData).not.toHaveProperty(
                              'bank_account_number'
                    );
          });
});

describe('Athlete/stats Endpoint', () => {
          it('should return a 200 (OK) response code - athlete stats', async () => {
                    const response = await makeApiRequest(
                              `athletes/${athleteId}/stats`,
                              'GET'
                    );
                    expect(response.status).toBe(200);
          });

          it('should return a 404 Not Found response code - nonexistent athlete', async () => {
                    const response = await makeApiRequest(
                              'athletes/01010101010101100101/stats',
                              'GET'
                    );
                    expect(response.status).toBe(404);
          });

          it('should have the expected field values in the response', async () => {
                    const response = await makeApiRequest(
                              `athletes/${athleteId}/stats`,
                              'GET'
                    );
                    expect(response.status).toBe(200);

                    const data = response.json;

                    // Check the values of specific fields
                    expect(data.biggest_ride_distance).toBeGreaterThanOrEqual(
                              0
                    );

                    const fields = {
                              recent_ride_totals: [
                                        'count',
                                        'distance',
                                        'moving_time',
                                        'elapsed_time',
                                        'elevation_gain',
                                        'achievement_count',
                              ],
                              recent_run_totals: [
                                        'count',
                                        'distance',
                                        'moving_time',
                                        'elapsed_time',
                                        'elevation_gain',
                                        'achievement_count',
                              ],
                              recent_swim_totals: [
                                        'count',
                                        'distance',
                                        'moving_time',
                                        'elapsed_time',
                                        'elevation_gain',
                              ],
                              ytd_ride_totals: [
                                        'count',
                                        'distance',
                                        'moving_time',
                                        'elapsed_time',
                                        'elevation_gain',
                              ],
                              ytd_run_totals: [
                                        'count',
                                        'distance',
                                        'moving_time',
                                        'elapsed_time',
                                        'elevation_gain',
                              ],
                              ytd_swim_totals: [
                                        'count',
                                        'distance',
                                        'moving_time',
                                        'elapsed_time',
                                        'elevation_gain',
                              ],
                              all_ride_totals: [
                                        'count',
                                        'distance',
                                        'moving_time',
                                        'elapsed_time',
                                        'elevation_gain',
                              ],
                              all_run_totals: [
                                        'count',
                                        'distance',
                                        'moving_time',
                                        'elapsed_time',
                                        'elevation_gain',
                              ],
                              all_swim_totals: [
                                        'count',
                                        'distance',
                                        'moving_time',
                                        'elapsed_time',
                                        'elevation_gain',
                              ],
                    };

                    for (const [field, subfields] of Object.entries(fields)) {
                              const fieldData = data[field];
                              expect(fieldData).toBeDefined();

                              for (const subfield of subfields) {
                                        expect(
                                                  fieldData[subfield]
                                        ).toBeDefined();
                                        expect(
                                                  typeof fieldData[subfield]
                                        ).toMatch(/number/);
                                        expect(
                                                  fieldData[subfield]
                                        ).toBeGreaterThanOrEqual(0);
                              }
                    }
          });

          it('Athlete Stats Authorization - should return a 401 Unauthorized response code', async () => {
                    const url = `https://www.strava.com/api/v3/athletes/${athleteId}/stats`;
                    return frisby.get(url).expect('status', 401);
          });

          it('Athlete Stats Authentication with Invalid Token - should return a 401 Unauthorized response code', async () => {
                    const url = `https://www.strava.com/api/v3/athletes/${athleteId}/stats`;
                    const headers = {
                              Authorization: 'Bearer invalid token',
                    };

                    return frisby.get(url, { headers }).expect('status', 401);
          });

          it('Athlete Stats Security - should not include sensitive information in the response', async () => {
                    const response = await makeApiRequest(
                              `athletes/${athleteId}/stats`,
                              'GET'
                    );

                    const data = response.json;

                    expect(data.access_token).toBeUndefined();
                    expect(data.refresh_token).toBeUndefined();
                    expect(data.password).toBeUndefined();
                    expect(data.email).toBeUndefined();
                    expect(data.credit_card).toBeUndefined();
                    expect(data.social_security_number).toBeUndefined();
                    expect(data.bank_account_number).toBeUndefined();
          });
});
