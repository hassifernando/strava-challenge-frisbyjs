const frisby = require('frisby');
const faker = require('faker');
const Joi = frisby.Joi;

require('dotenv').config();

/**
 * Function to generate the access token.
 * @returns {Promise<string|null>} A promise that resolves with the access token or null in case of an error.
 */
const generateAccessToken = () => {
          const clientId = process.env.STRAVA_CLIENT_ID;
          const clientSecret = process.env.STRAVA_CLIENT_SECRET;
          const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

          const tokenUrl = 'https://www.strava.com/api/v3/oauth/token';
          const payload = {
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
          };

          return frisby
                    .post(tokenUrl, payload)
                    .expect('status', 200)
                    .then((response) => {
                              const tokenData = response.json;
                              const accessToken = tokenData.access_token;
                              //  console.log('Novo token de acesso:', accessToken);
                              return accessToken;
                    })
                    .catch((error) => {
                              console.error(
                                        'Failed to generate access token:',
                                        error
                              );
                              return null;
                    });
};

/**
 * Function to make an API request.
 * @param {string} endpoint - The API endpoint.
 * @param {string} [method='GET'] - The HTTP method of the request.
 * @param {object} [data=null] - The request data for POST or PUT method.
 * @returns {Promise<Response>} A promise that resolves with the response of the request.
 */
const makeApiRequest = (endpoint, method = 'GET', data = null) => {
          return generateAccessToken().then((accessToken) => {
                    const url = `https://www.strava.com/api/v3/${endpoint}`;
                    const headers = {
                              Authorization: `Bearer ${accessToken}`,
                    };

                    let request;
                    switch (method) {
                              case 'GET':
                                        request = frisby.get(url, {
                                                  headers: {
                                                            Authorization: `Bearer ${accessToken}`,
                                                            'Content-Type':
                                                                      'application/json',
                                                  },
                                        });
                                        break;
                              case 'POST':
                                        request = frisby.post(url, {
                                                  headers: {
                                                            Authorization: `Bearer ${accessToken}`,
                                                            'Content-Type':
                                                                      'application/json',
                                                  },
                                                  body: JSON.stringify(data),
                                        });
                                        break;
                              case 'PUT':
                                        request = frisby.put(url, {
                                                  headers: {
                                                            Authorization: `Bearer ${accessToken}`,
                                                            'Content-Type':
                                                                      'application/json',
                                                  },
                                                  body: JSON.stringify(data),
                                        });
                                        break;
                              default:
                                        throw new Error(
                                                  `Unsupported HTTP method: ${method}`
                                        );
                    }

                    return request;
          });
};
/**
 * Function to create an activity.
 * @param {Date|null} [timestamp=null] - The timestamp of the activity. If not provided, a random timestamp will be generated.
 * @returns {Promise<number>} A promise that resolves with the ID of the created activity.
 * @throws {Error} Throws an error if creating the activity fails.
 */
const createActivity = async (timestamp = null) => {
          const startDateTime = timestamp
                    ? timestamp.toISOString()
                    : faker.date.recent().toISOString();

          const activityData = {
                    name: faker.random.word(),
                    sport_type: faker.random.arrayElement([
                              'AlpineSki',
                              'BackcountrySki',
                              'Badminton',
                              'Canoeing',
                              'Crossfit',
                              'EBikeRide',
                              'Elliptical',
                              'EMountainBikeRide',
                              'Golf',
                              'GravelRide',
                              'Handcycle',
                              'HighIntensityIntervalTraining',
                              'Hike',
                              'IceSkate',
                              'InlineSkate',
                              'Kayaking',
                              'Kitesurf',
                              'MountainBikeRide',
                              'NordicSki',
                              'Pickleball',
                              'Pilates',
                              'Racquetball',
                              'Ride',
                              'RockClimbing',
                              'RollerSki',
                              'Rowing',
                              'Run',
                              'Sail',
                              'Skateboard',
                              'Snowboard',
                              'Snowshoe',
                              'Soccer',
                              'Squash',
                              'StairStepper',
                              'StandUpPaddling',
                              'Surfing',
                              'Swim',
                              'TableTennis',
                              'Tennis',
                              'TrailRun',
                              'Velomobile',
                              'VirtualRide',
                              'VirtualRow',
                              'VirtualRun',
                              'Walk',
                              'WeightTraining',
                              'Wheelchair',
                              'Windsurf',
                              'Workout',
                              'Yoga',
                    ]),
                    start_date_local: startDateTime,
                    elapsed_time: faker.datatype.number({ min: 1, max: 3600 }),
                    description: faker.lorem.sentence(),
                    distance: faker.datatype.number({ min: 1, max: 10000 }),
                    trainer: 0,
                    commute: 0,
          };

          try {
                    const response = await makeApiRequest(
                              'activities',
                              'POST',
                              activityData
                    );

                    if (response.status !== 201) {
                              throw new Error(
                                        `Failed to create activity. Status: ${response.status}`
                              );
                    }

                    const responseData = response.json;

                    return responseData.id;
          } catch (error) {
                    console.error('Failed to create activity:', error);
                    throw error;
          }
};
/**
 * Function to get the total number of athlete's activities.
 * @returns {Promise<number|null>} A promise that resolves with the total number of activities or null in case of an error.
 */
const getTotalActivities = async () => {
          const perPage = 200;
          let totalActivities = 0;
          let page = 1;
          let hasMoreActivities = true;

          while (hasMoreActivities) {
                    try {
                              const response = await makeApiRequest(
                                        `athlete/activities?page=${page}&per_page=${perPage}`,
                                        'GET'
                              );

                              if (response.status !== 200) {
                                        return null;
                              }

                              const data = await response.json;
                              const activityCount = data.length;
                              totalActivities += activityCount;

                              if (activityCount < perPage) {
                                        hasMoreActivities = false;
                              } else {
                                        page += 1;
                              }
                    } catch (error) {
                              return null;
                    }
          }

          return totalActivities;
};

module.exports = {
          generateAccessToken,
          makeApiRequest,
          createActivity,
          getTotalActivities,
};
