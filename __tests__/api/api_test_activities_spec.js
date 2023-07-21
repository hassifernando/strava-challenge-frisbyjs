const frisby = require('frisby');
const faker = require('faker');
const {
          createActivity,
          makeApiRequest,
          getTotalActivities,
} = require('../../utils/common');

describe('Activities API', () => {
          it('should create an activity', async () => {
                    try {
                              const activityId = await createActivity();
                              console.log('Created Activity ID:', activityId);

                              // Assuming that the Strava API returns a positive integer ID for a successfully created activity
                              expect(typeof activityId).toBe('number');
                              expect(activityId).toBeGreaterThan(0);

                              // Additional checks can be added here, if needed
                    } catch (error) {
                              // Handle any errors that might occur during the test
                              console.error('Test failed:', error);
                              throw error;
                    }
          });

          it('should not create an activity with a future timestamp', async () => {
                    // Getting a timestamp for 7 days in the future

                    const futureTimestamp = new Date();
                    futureTimestamp.setDate(futureTimestamp.getDate() + 7);

                    // Trying to create an activity with a future timestamp
                    const activityId = await createActivity(futureTimestamp);

                    // Check if the activity was not created (activityId should be null)
                    expect(activityId).toBeNull();
          });

          it('should get an activity', async () => {
                    // Creating a new activity and getting the ID
                    const activityId = await createActivity();

                    // Making the GET request for the created activity
                    const response = await makeApiRequest(
                              `activities/${activityId}`,
                              'GET'
                    );

                    // Check the response status code
                    expect(response.status).toBe(200);

                    // Check the 'id' field in the response and if it matches the ID of the created activity
                    const responseData = response.json;
                    expect(responseData).toHaveProperty('id', activityId);
          });

          it('should update an activity', async () => {
                    // Creating a new activity to update
                    const activityId = await createActivity();

                    // Data to update the activity
                    const updateActivityData = {
                              name: 'Updated Activity',
                              description: 'Updated description',
                    };

                    // Updating the activity using the makeApiRequest function with the PUT method
                    const response = await makeApiRequest(
                              `activities/${activityId}`,
                              'PUT',
                              updateActivityData
                    );

                    // Check if the response has a status code of 200 (OK)
                    expect(response.status).toBe(200);

                    // Check if the updated fields are in the response
                    const responseData = response.json;
                    expect(responseData).toHaveProperty('id', activityId);
                    expect(responseData).toHaveProperty(
                              'name',
                              'Updated Activity'
                    );
                    expect(responseData).toHaveProperty(
                              'description',
                              'Updated description'
                    );
          });

          it('should return 400 (Bad Request) when required fields are missing', async () => {
                    // Making the request to create an activity without the required fields
                    const activityData = {
                              name: faker.random.word(),
                    };

                    const response = await makeApiRequest(
                              'activities',
                              'POST',
                              activityData
                    );

                    // Check if the response has a status code of 400 (Bad Request)
                    expect(response.status).toBe(400);
          });

          it('should create activity with invalid fields', () => {
                    const activityData = {
                              name: faker.random.word(),
                              type: 'InvalidType',
                              start_date_local: faker.date
                                        .recent()
                                        .toISOString(),
                              elapsed_time: faker.datatype.number({
                                        min: 1,
                                        max: 3600,
                              }),
                              description: faker.lorem.sentence(),
                              distance: 'InvalidDistance',
                              trainer: 'InvalidTrainer',
                              commute: 'InvalidCommute',
                    };

                    return makeApiRequest('activities', 'POST', activityData)
                              .expect('status', 400)
                              .then((response) => {
                                        const responseData = response.json;
                                        // Add further assertions if needed
                              })
                              .catch((error) => {
                                        console.error(
                                                  'Failed to create activity with invalid fields:',
                                                  error
                                        );
                                        throw error;
                              });
          });

          it('should return 409 when creating duplicate activity', async () => {
                    const originalActivityId = await createActivity();

                    // Get the data of the original activity
                    const response = await makeApiRequest(
                              `activities/${originalActivityId}`
                    );
                    expect(response.status).toBe(200);

                    const originalActivityData = {
                              name: response.json.name,
                              type: response.json.type,
                              start_date_local: response.json.start_date_local,
                              elapsed_time: response.json.elapsed_time,
                              description: response.json.description,
                              distance: response.json.distance,
                              trainer: response.json.trainer,
                              commute: response.json.commute,
                    };

                    return makeApiRequest(
                              'activities',
                              'POST',
                              originalActivityData
                    )
                              .expect('status', 409)
                              .then((response) => {
                                        // Add further assertions if needed
                              })
                              .catch((error) => {
                                        console.error(
                                                  'Failed to create duplicate activity:',
                                                  error
                                        );
                                        throw error;
                              });
          });

          it('should return 401 Unauthorized when accessing activities without authorization', () => {
                    const url = 'https://www.strava.com/api/v3/activities';

                    return frisby
                              .get(url)
                              .expect('status', 401)
                              .then((response) => {
                                        // Add further assertions if needed
                              })
                              .catch((error) => {
                                        console.error(
                                                  'Failed to access activities without authorization:',
                                                  error
                                        );
                                        throw error;
                              });
          });

          it('should return 401 Unauthorized with invalid token', () => {
                    const url = 'https://www.strava.com/api/v3/activities';
                    const headers = {
                              Authorization: 'Bearer invalid token',
                    };

                    return frisby
                              .get(url, { headers })
                              .expect('status', 401)
                              .then((response) => {
                                        // Add further assertions if needed
                              })
                              .catch((error) => {
                                        console.error(
                                                  'Failed to access activities with invalid token:',
                                                  error
                                        );
                                        throw error;
                              });
          });

          it('should not include sensitive information in the response', async () => {
                    const response = await makeApiRequest(`activities`, 'GET');

                    expect(response.status).toBe(200);

                    const responseBody = await response.json;

                    // Check if the response does not include sensitive information
                    expect(responseBody.access_token).toBeUndefined();
                    expect(responseBody.refresh_token).toBeUndefined();
                    expect(responseBody.password).toBeUndefined();
                    expect(responseBody.email).toBeUndefined();
                    expect(responseBody.credit_card).toBeUndefined();
                    expect(responseBody.social_security_number).toBeUndefined();
                    expect(responseBody.bank_account_number).toBeUndefined();
          });
});

describe('Athlete/Activities API', () => {
          it('should list athlete activities - single activities', async () => {
                    const response = await makeApiRequest(
                              'athlete/activities',
                              'GET'
                    );

                    expect(response.status).toBe(200);
          });

          it('should list athlete activities - multiple activities', async () => {
                    // Generating a random number of activities
                    const numActivities = faker.datatype.number({
                              min: 2,
                              max: 5,
                    });

                    // Creating activities using the createActivity function
                    for (let i = 0; i < numActivities; i++) {
                              await createActivity();
                    }

                    // Listing athlete activities using the makeApiRequest function with the GET method
                    const response = await makeApiRequest('athlete/activities');

                    // Check if the response is a list of activities (array)
                    expect(response.status).toBe(200);

                    const responseData = response.json;
                    expect(Array.isArray(responseData)).toBe(true);

                    // Check if the response contains at least the expected number of activities
                    expect(responseData.length).toBeGreaterThanOrEqual(
                              numActivities
                    );
          });

          it('should list athlete activities and check response structure', async () => {
                    const response = await makeApiRequest(
                              'athlete/activities',
                              'GET'
                    );
                    expect(response.status).toBe(200);

                    const data = response.json;
                    expect(Array.isArray(data)).toBe(
                              true,
                              'The response is not a list of activities'
                    );

                    if (data.length > 0) {
                              // Check if the response contains the expected fields for at least one activity
                              const expectedFields = [
                                        'id',
                                        'name',
                                        'type',
                                        'start_date',
                                        'distance',
                                        'elapsed_time',
                              ];
                              for (const field of expectedFields) {
                                        expect(data[0]).toHaveProperty(field);
                              }
                    }
          });

          it('should list athlete activities with pagination', async () => {
                    // Generate a random number of activities per page
                    const per_page = faker.datatype.number({ min: 2, max: 99 });
                    // Get the total number of activities for the athlete
                    const total_activities = await getTotalActivities();
                    // If the number of activities is lower than 10, create activities
                    if (total_activities < 10) {
                              const num_activities = faker.datatype.number({
                                        min: 2,
                                        max: 5,
                              });
                              for (let i = 0; i < num_activities; i++) {
                                        await createActivity();
                              }
                    }

                    //Retrieve the first activity page
                    const first_page_response = await makeApiRequest(
                              `athlete/activities?per_page=${per_page}`
                    );
                    expect(first_page_response.status).toBe(200);

                    const first_page_data = first_page_response.json;
                    expect(Array.isArray(first_page_data)).toBe(true);
                    expect(first_page_data.length).toBeLessThanOrEqual(
                              per_page
                    );

                    //Calculate the total number of page using the number of activities as a base
                    const total_pages = Math.ceil(total_activities / per_page);
                    // Retrieve the remaining pages of activities
                    if (total_pages > 1) {
                              for (let page = 2; page <= total_pages; page++) {
                                        const response = await makeApiRequest(
                                                  `athlete/activities?page=${page}&per_page=${per_page}`
                                        );
                                        expect(response.status).toBe(200);

                                        const data = response.json;
                                        expect(Array.isArray(data)).toBe(true);
                                        expect(data.length).toBeLessThanOrEqual(
                                                  per_page
                                        );
                              }
                    }
          });

          it('should list athlete activities with filtering', async () => {
                    // Create activities with a different timestamps
                    const current_time = new Date();
                    const activity_timestamps = [
                              new Date(
                                        current_time.getTime() -
                                                  7 * 24 * 60 * 60 * 1000
                              ), // 7 days ago
                              new Date(
                                        current_time.getTime() -
                                                  3 * 24 * 60 * 60 * 1000
                              ), // 3 days ago
                              new Date(
                                        current_time.getTime() -
                                                  1 * 24 * 60 * 60 * 1000
                              ), // 1 day ago
                              current_time,
                    ];

                    for (const timestamp of activity_timestamps) {
                              await createActivity(timestamp);
                    }

                    // Filter activities after a specified timestamp
                    const after_timestamp = new Date(
                              current_time.getTime() - 4 * 24 * 60 * 60 * 1000
                    ); // 4 days ago
                    const responseAfter = await makeApiRequest(
                              `athlete/activities?after=${
                                        after_timestamp.getTime() / 1000
                              }&page=1`
                    );

                    expect(responseAfter.status).toBe(200);

                    const dataAfter = responseAfter.json;
                    expect(Array.isArray(dataAfter)).toBe(true);

                    // Check if all activities in the response are after the specified timestamp
                    for (const activity of dataAfter) {
                              const activity_timestamp = new Date(
                                        activity.start_date
                              );
                              expect(activity_timestamp > after_timestamp).toBe(
                                        true
                              );
                    }

                    // Filter activities before a specific timestamp
                    const before_timestamp = new Date(
                              current_time.getTime() - 2 * 24 * 60 * 60 * 1000
                    ); // 2 days ago
                    const responseBefore = await makeApiRequest(
                              `athlete/activities?before=${
                                        before_timestamp.getTime() / 1000
                              }&page=1`
                    );
                    expect(responseBefore.status).toBe(200);

                    const dataBefore = responseBefore.json;
                    expect(Array.isArray(dataBefore)).toBe(true);

                    // Check if all activities in the response are before the specified timestamp
                    for (const activity of dataBefore) {
                              const activity_timestamp = new Date(
                                        activity.start_date
                              );
                              expect(
                                        activity_timestamp < before_timestamp
                              ).toBe(true);
                    }
          });

          it('should handle per_page limit correctly', async () => {
                    const maxPerPage = 200;

                    // Test with the maximum allowed value
                    const responseMaxPerPage = await makeApiRequest(
                              `athlete/activities?per_page=${maxPerPage}`
                    );
                    expect(responseMaxPerPage.status).toBe(200);

                    // Test with a value exceeding the limit
                    const invalidPerPage = maxPerPage + 1;
                    const responseInvalidPerPage = await makeApiRequest(
                              `athlete/activities?per_page=${invalidPerPage}`
                    );
                    expect(responseInvalidPerPage.status).toBe(400);

                    const dataInvalidPerPage = responseInvalidPerPage.json;
                    expect(dataInvalidPerPage).toHaveProperty('message');
                    expect(dataInvalidPerPage).toHaveProperty('errors');

                    const errors = dataInvalidPerPage.errors;
                    expect(Array.isArray(errors)).toBe(true);
                    expect(errors.length).toBe(1);

                    const error = errors[0];
                    expect(error).toHaveProperty('resource', 'Application');
                    expect(error).toHaveProperty('field', 'per page');
                    expect(error).toHaveProperty('code', 'limit exceeded');
          });
});
