# Strava API Test Suite

This repository contains a test suite for testing the Strava API using Frisby.js. The test suite covers various scenarios to ensure that the API endpoints are working as expected.

## Prerequisites

Before running the tests, make sure you have the following installed on your system:

- Node.js (>=12.0.0)
- NPM (Node Package Manager)

## Installation

1. Clone this repository to your local machine.
2. Navigate to the project directory in your terminal.
3. Install the required dependencies by running the following command:
    > npm install


## Configuration

1. Create a `.env` file in the project root directory.
2. Set the following environment variables in the `.env` file:

```
STRAVA_USERNAME='username-string'
STRAVA_CITY='city-string'
STRAVA_CLIENT_ID='int'
STRAVA_CLIENT_SECRET='client-secret'
STRAVA_REFRESH_TOKEN='refresh-token'
STRAVA_ATHLETE_ID = 'int'
```

##### Where you can get the data to build the .env?

* ###### Username and City: https://www.strava.com/settings/profile
* ###### Client ID and Client Secret: https://www.strava.com/settings/api
* ###### Refresh Token:

    > We will need a token with scope to read and write, to get this follow this instructions:

    Access this [link](    https://www.strava.com/oauth/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=activity:write,profile:write,activity:read_all,profile:read_all,read_all,activity:read
), change the CLIENT_ID to your CLIENT_ID and reload:

    You will be redirect to this url:

    ![img.png](docs/img.png)

    > Save the **code** content.

    Use the Postman to do a POST request (https://www.strava.com/oauth/token) and get your refresh token:
    > Change the values for your values and your code for the previous step
  
  ![img_1.png](docs/img_1.png)

    > Save the refresh_token into the .env


* ###### Athlete ID: GET Request against https://www.strava.com/api/v3/athlete

  ![img_2.png](docs/img_2.png) 

  Get the ID in response and save into your .env


## Running the Tests

To run the test suite, use the following command:

    Run all tests: npm test
    Run specified test inside a file: jest --testNamePattern="should list athlete activities - multiple activities" __tests__/api/api_test_activities_spec.js


The test runner will execute all the test cases in the `__tests__` directory and display the results in the terminal.

## Test Cases

The test cases cover the following scenarios:

1. **Create Activity**

-   _Description_: Verifies that a new activity can be successfully created.
-   _Steps_:
	1. Create a new activity using the `createActivity` function.
-   _Expected Outcome_:
    -   The function should return a positive integer ID for the newly created activity.
2. **Create Activity with Future Timestamp:**

-   _Description_: Verifies that an activity cannot be created with a future timestamp.
-   _Steps_:
    1.  Generate a timestamp for 7 days in the future.
    2.  Attempt to create an activity using the `createActivity` function with the future timestamp.
-   _Expected Outcome_:
    -   The function should return `null` since the activity creation should fail.
3. **Get Activity**:

-   _Description_: Verifies that an existing activity can be retrieved.
-   _Steps_:
    1.  Create a new activity using the `createActivity` function and get its ID.
    2.  Retrieve the activity using the `makeApiRequest` function with the GET method and the activity ID.
-   _Expected Outcome_:
    -   The response should have a status code of 200 (OK).
    -   The response data should include the same activity ID as the one retrieved. 
4. **Update Activity**:

    -   _Description_: Verifies that an existing activity can be updated.
    -   _Steps_:
        1.  Create a new activity using the `createActivity` function and get its ID.
        2.  Prepare data to update the activity (e.g., name and description).
        3.  Update the activity using the `makeApiRequest` function with the PUT method and the activity ID.
    -   _Expected Outcome_:
        -   The response should have a status code of 200 (OK).
        -   The response data should include the updated fields of the activity.
0.  **Create Activity with Missing Fields**:
    
    -   _Description_: Verifies that creating an activity without required fields returns a 400 (Bad Request) status.
    -   _Steps_:
        1.  Attempt to create an activity using the `makeApiRequest` function with missing required fields (e.g., name).
    -   _Expected Outcome_:
        -   The response should have a status code of 400 (Bad Request).
0.  **Create Activity with Invalid Fields**:
    
    -   _Description_: Verifies that creating an activity with invalid data returns a 400 (Bad Request) status.
    -   _Steps_:
        1.  Prepare activity data with invalid fields (e.g., invalid type, distance, trainer, and commute).
        2.  Attempt to create an activity using the `makeApiRequest` function with the invalid data.
    -   _Expected Outcome_:
        -   The response should have a status code of 400 (Bad Request).
0.  **Create Duplicate Activity**:
    
    -   _Description_: Verifies that creating a duplicate activity returns a 409 (Conflict) status.
    -   _Steps_:
        1.  Create a new activity using the `createActivity` function.
        2.  Get the data of the original activity using the `makeApiRequest` function.
        3.  Attempt to create a new activity using the same data as the original activity.
    -   _Expected Outcome_:
        -   The response should have a status code of 409 (Conflict).
0.  **Unauthorized Access to Activities**:
    
    -   _Description_: Verifies that accessing activities without authorization returns a 401 (Unauthorized) status.
    -   _Steps_:
        1.  Attempt to access the activities endpoint without an access token.
    -   _Expected Outcome_:
        -   The response should have a status code of 401 (Unauthorized).
0.  **Unauthorized Access with Invalid Token**:
    
    -   _Description_: Verifies that accessing activities with an invalid access token returns a 401 (Unauthorized) status.
    -   _Steps_:
        1.  Attempt to access the activities endpoint with an invalid access token.
    -   _Expected Outcome_:
        -   The response should have a status code of 401 (Unauthorized).


0.  **Check Sensitive Information in Response**:
    
    -   _Description_: Verifies that the response does not include sensitive information.
    -   _Steps_:
        1.  Get the list of activities using the `makeApiRequest` function with the GET method.
    -   _Expected Outcome_:
        -   The response should not include sensitive information (e.g., access_token, refresh_token, password, email, credit_card, social_security_number, bank_account_number).
0.  **List Athlete Activities with Pagination**:
    
    -   _Description_: Verifies that athlete activities are listed with pagination.
    -   _Steps_:
        1.  Retrieve the first page of athlete activities using the `makeApiRequest` function with pagination.
        2.  Calculate the total number of pages based on the total number of activities and activities per page.
        3.  Retrieve the remaining pages of activities using the `makeApiRequest` function with pagination.
    -   _Expected Outcome_:
        -   The response should have a status code of 200 (OK).
        -   The response data should be a list of activities.
        -   The total number of activities should match the expected value.
0.  **List Athlete Activities with Filtering**:
    
    -   _Description_: Verifies that athlete activities can be filtered by timestamp.
    -   _Steps_:
        1.  Create activities with different timestamps (e.g., 7 days ago, 3 days ago, 1 day ago, and current time).
        2.  Filter activities after a specified timestamp using the `makeApiRequest` function.
        3.  Filter activities before a specific timestamp using the `makeApiRequest` function.
    -   _Expected Outcome_:
        -   The response should have a status code of 200 (OK).
        -   The filtered activities should meet the timestamp conditions.
0.  **Handle per_page Limit Correctly**:
    
    -   _Description_: Verifies that the `per_page` parameter is handled correctly.
    -   _Steps_:
        1.  Test with the maximum allowed value for `per_page`.
        2.  Test with a value exceeding the limit for `per_page`.
    -   _Expected Outcome_:
        -   For the valid `per_page`, the response should have a status code of 200 (OK).
        -   For the invalid `per_page`, the response should have a status code of 400 (Bad Request) and include error information.



## Contributing

Contributions to this test suite are welcome! If you find any issues or want to add more test cases, feel free to submit a pull request.

