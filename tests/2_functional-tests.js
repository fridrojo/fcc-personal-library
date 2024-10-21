/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../server.js');

const assert = chai.assert;

chai.use(chaiHttp);

suite('Functional Tests', function () {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  *
  test('#example Test GET /api/books', function (done) {
    chai.request(server)
        .get('/api/books')
        .end(function (err, res) { 
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body[0], 'title', 'Books in array should contain title');
          assert.property(res.body[0], '_id', 'Books in array should contain _id');
          done();
        });
  });
  *
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function () {

    let trueId = "";
    const fakeId = "ffffffffffffffffffffffff";
    const invalidId = "fff";

    const basePath = "/api/books";
    const getTrueIdPath = () => `${basePath}/${trueId}`;
    const fakeIdPath = `${basePath}/${fakeId}`;
    const invalidIdPath = `${basePath}/${invalidId}`;

    const okStatus = 200;
    const createdStatus = 201; 
    const badRequestStatus = 400;

    const urlEncodedType = "application/x-www-form-urlencoded";
    const jsonType = "application/json";
    const htmlType = "text/html";

    const noTitleMsg = "missing required field title";
    const noCommentMsg = "missing required field comment";
    const noBookMsg = "no book exists";    
    const delMsg = "delete successful";
    const fullDelMsg = "complete delete successful";    

    const titleData = {
      title: "Test Book Title"
    };
    const commentData = {
      comment: "Test book comment."
    };
    const bookData = {
      get _id() {
        return trueId;
      },
      ...titleData,
      comments: [],
      get commentcount() {
        return this.comments.length;
      }
    };
    const invalidIdData = {
      error: "An error occurred while processing your request: the book identifier must be a 24-character hexadecimal string."
    };
 
    suite('POST /api/books -> create book object with title / expect created book object or error message', function () {
      
      test('Test POST /api/books with title field', function (done) {
        
        const reqBody = titleData;
        const resBody = {
          ...bookData
        };
        delete resBody.comments;
        delete resBody.commentcount;

        chai.request(server)
            .post(basePath)
            .type(urlEncodedType)
            .send(reqBody)
            .end(function (err, res) {
               
              if (err) {

                done(err);

              } else {
                
                assert.strictEqual(res.status, createdStatus, `The response status code should be ${createdStatus}.`);
                assert.strictEqual(res.type, jsonType, `The media type of the response body should be ${jsonType}.`);
                assert.isObject(res.body, "The response body should be an object literal.");
                assert.hasAllKeys(res.body, Object.keys(resBody), `The response body object literal should have all and only all of the following property keys: ${Object.keys(resBody).map((elem) => `'${elem}'`).join(", ")}.`);
                assert.isString(res.body._id, "The '_id' property value in the response body object literal should be a string.");
                assert.match(res.body._id, /^[0-9a-f]{24}$/, "The '_id' property string value in the response body object literal should consist of 24 hexadecimal characters.");
                assert.isString(res.body.title, "The 'title' property value in the response body object literal should be a string.");
                assert.strictEqual(res.body.title, resBody.title, `The 'title' property string value in the response body object literal should be '${resBody.title}'.`);

                trueId = res.body._id;
                
                //done();
                done();

              };

            });        

      });
      
      test('Test POST /api/books without title field', function (done) {

        chai.request(server)
            .post(basePath)            
            .end(function (err, res) {
               
              if (err) {

                done(err);

              } else {               

                assert.strictEqual(res.status, okStatus, `The response status code should be ${okStatus}.`); // Properly: 422 (Unprocessable Content)
                assert.strictEqual(res.type, htmlType, `The media type of the response body should be ${htmlType}.`);
                assert.isString(res.text, "The response body text should be a string.");
                assert.strictEqual(res.text, noTitleMsg, `The value of the response body text string should be '${noTitleMsg}'.`);
                
                //done();
                done();

              };

            });   
        
      });
      
    });

    suite('GET /api/books -> expect array of all book objects', function () {
      
      test('Test GET /api/books', function (done) {

        const resBodyTestElem = {
          ...bookData
        };
        delete resBodyTestElem.comments;

        chai.request(server)
            .get(basePath)            
            .end(function (err, res) {

              if (err) {

                done(err);

              } else {

                const randElem = res.body[Math.trunc(Math.random() * res.body.length)];
                const testElem = res.body.find((elem) => elem._id === trueId);

                assert.strictEqual(res.status, okStatus, `The response status code should be ${okStatus}.`); 
                assert.strictEqual(res.type, jsonType, `The media type of the response body should be ${jsonType}.`);
                assert.isArray(res.body, "The response body should be an array.");

                assert.isObject(randElem, "A random element in the response body array should be an object literal.");
                assert.hasAllKeys(randElem, Object.keys(resBodyTestElem), `A random object literal element in the response body array should have all and only all of the following property keys: ${Object.keys(resBodyTestElem).map((elem) => `'${elem}'`).join(", ")}.`);
                assert.isString(randElem._id, "The '_id' property value in a random object literal element in the response body array should be a string.");
                assert.match(randElem._id, /^[0-9a-f]{24}$/, "The '_id' property string value in a random object literal element in the response body array should consist of 24 hexadecimal characters.");
                assert.isString(randElem.title, "The 'title' property value in a random object literal element in the response body array should be a string.");
                assert.isFinite(randElem.commentcount, "The 'commentcount' property value in a random object literal element in the response body array should be a finite number.");
                assert.match(randElem.commentcount, /^\d+$/, "The 'commentcount' property finite number value in a random object literal element in the response body array should be a non-negative integer.");

                assert.isObject(testElem, "The test element in the response body array should be an object literal.");
                assert.deepStrictEqual(testElem, resBodyTestElem, `The test object literal element in the response body array should be strictly and deeply equal to the following one: ${JSON.stringify(resBodyTestElem).replaceAll("\"", "'")}.`);
                
                //done();
                done();

              };

            });  
            
      });
      
    });    

    suite('POST /api/books/{id} => add comment to book object with id / expect modified book object or error message', function () {
      
      test('Test POST /api/books/{id} with true id in db and with comment field', function (done) {

        bookData.comments.push(commentData.comment);

        const reqBody = commentData;        
        const resBody = {
          ...bookData
        };
        delete resBody.commentcount; 

        chai.request(server)
            .post(getTrueIdPath())
            .type(urlEncodedType)
            .send(reqBody)
            .end(function (err, res) {

              if (err) {

                done(err);

              } else {

                assert.strictEqual(res.status, okStatus, `The response status code should be ${okStatus}.`);
                assert.strictEqual(res.type, jsonType, `The media type of the response body should be ${jsonType}.`);
                assert.isObject(res.body, "The response body should be an object literal.");
                assert.deepStrictEqual(res.body, resBody, `The response body object literal should be strictly and deeply equal to the following one: ${JSON.stringify(resBody).replaceAll("\"", "'")}.`);
                
                //done();
                done();

              };

            });
        
      });

      test('Test POST /api/books/{id} with true id in db and without comment field', function (done) {

        chai.request(server)
            .post(getTrueIdPath())
            .end(function (err, res) {

              if (err) {

                done(err);

              } else {

                assert.strictEqual(res.status, okStatus, `The response status code should be ${okStatus}.`); // Properly: 422 (Unprocessable Content)
                assert.strictEqual(res.type, htmlType, `The media type of the response body should be ${htmlType}.`);
                assert.isString(res.text, "The response body text should be a string.");
                assert.strictEqual(res.text, noCommentMsg, `The value of the response body text string should be '${noCommentMsg}'.`);
                
                //done();
                done();

              };

            });
        
      });

      test('Test POST /api/books/{id} with fake id not in db and with comment field', function (done) {

        const reqBody = commentData;

        chai.request(server)
            .post(fakeIdPath)
            .type(urlEncodedType)
            .send(reqBody)
            .end(function (err, res) {

              if (err) {

                done(err);

              } else {

                assert.strictEqual(res.status, okStatus, `The response status code should be ${okStatus}.`); // Properly: 404 (Not Found)
                assert.strictEqual(res.type, htmlType, `The media type of the response body should be ${htmlType}.`);
                assert.isString(res.text, "The response body text should be a string.");
                assert.strictEqual(res.text, noBookMsg, `The value of the response body text string should be '${noBookMsg}'.`);
                
                //done();
                done();

              };

            });
        
      });

      test('Test POST /api/books/{id} with fake id not in db and without comment field', function (done) {        

        chai.request(server)
            .post(fakeIdPath)            
            .end(function (err, res) {

              if (err) {

                done(err);

              } else {

                assert.strictEqual(res.status, okStatus, `The response status code should be ${okStatus}.`); // Properly: 404 (Not Found)
                assert.strictEqual(res.type, htmlType, `The media type of the response body should be ${htmlType}.`);
                assert.isString(res.text, "The response body text should be a string.");
                assert.strictEqual(res.text, noBookMsg, `The value of the response body text string should be '${noBookMsg}'.`);
                
                //done();
                done();

              };

            });
        
      });

      test("Test POST /api/books/{id} with invalid id not in db and with comment field", function (done) {

        const reqBody = commentData;
        const resBody = invalidIdData;

        chai.request(server)
            .post(invalidIdPath)
            .type(urlEncodedType)
            .send(reqBody)
            .end(function (err, res) {

              if (err) {

                done(err);

              } else {

                assert.strictEqual(res.status, badRequestStatus, `The response status code should be ${badRequestStatus}.`); 
                assert.strictEqual(res.type, jsonType, `The media type of the response body should be ${jsonType}.`);
                assert.isObject(res.body, "The response body should be an object literal.");
                assert.deepStrictEqual(res.body, resBody, `The response body object literal should be strictly and deeply equal to the following one: ${JSON.stringify(resBody).replaceAll("\"", "'")}.`);
                
                //done();
                done();

              };

            });
        
      });

      test("Test POST /api/books/{id} with invalid id not in db and without comment field", function (done) {  
        
        const resBody = invalidIdData;

        chai.request(server)
            .post(invalidIdPath)            
            .end(function (err, res) {

              if (err) {

                done(err);

              } else {

                assert.strictEqual(res.status, badRequestStatus, `The response status code should be ${badRequestStatus}.`); 
                assert.strictEqual(res.type, jsonType, `The media type of the response body should be ${jsonType}.`);
                assert.isObject(res.body, "The response body should be an object literal.");
                assert.deepStrictEqual(res.body, resBody, `The response body object literal should be strictly and deeply equal to the following one: ${JSON.stringify(resBody).replaceAll("\"", "'")}.`);
                
                //done();
                done();

              };

            });
        
      });
      
    });

    suite('GET /api/books/{id} -> expect book object with id or error message', function () {      
      
      test('Test GET /api/books/{id} with true id in db',  function (done) {

        const resBody = {
          ...bookData
        };
        delete resBody.commentcount;

        chai.request(server)
            .get(getTrueIdPath())            
            .end(function (err, res) {

              if (err) {

                done(err);

              } else {

                assert.strictEqual(res.status, okStatus, `The response status code should be ${okStatus}.`);
                assert.strictEqual(res.type, jsonType, `The media type of the response body should be ${jsonType}.`);
                assert.isObject(res.body, "The response body should be an object literal.");
                assert.deepStrictEqual(res.body, resBody, `The response body object literal should be strictly and deeply equal to the following one: ${JSON.stringify(resBody).replaceAll("\"", "'")}.`);
                
                //done();
                done();

              };

            });
       
      });

      test('Test GET /api/books/{id} with fake id not in db',  function (done) {        
        
        chai.request(server)
            .get(fakeIdPath)            
            .end(function (err, res) {

              if (err) {

                done(err);

              } else {

                assert.strictEqual(res.status, okStatus, `The response status code should be ${okStatus}.`); // Properly: 404 (Not Found)
                assert.strictEqual(res.type, htmlType, `The media type of the response body should be ${htmlType}.`);
                assert.isString(res.text, "The response body text should be a string.");
                assert.strictEqual(res.text, noBookMsg, `The value of the response body text string should be '${noBookMsg}'.`);
                
                //done();
                done();

              };

            });
        
      });

      test("Test GET /api/books/{id} with invalid id not in db",  function (done) {        

        const resBody = invalidIdData;
        
        chai.request(server)
            .get(invalidIdPath)            
            .end(function (err, res) {

              if (err) {

                done(err);

              } else {

                assert.strictEqual(res.status, badRequestStatus, `The response status code should be ${badRequestStatus}.`); 
                assert.strictEqual(res.type, jsonType, `The media type of the response body should be ${jsonType}.`);
                assert.isObject(res.body, "The response body should be an object literal.");
                assert.deepStrictEqual(res.body, resBody, `The response body object literal should be strictly and deeply equal to the following one: ${JSON.stringify(resBody).replaceAll("\"", "'")}.`);
                
                //done();
                done();

              };

            });
        
      });
      
    });    

    suite('DELETE /api/books/{id} -> delete book object with id / expect confirmation or error message', function () {

      test('Test DELETE /api/books/{id} with true id in db', function (done) {

        chai.request(server)
            .delete(getTrueIdPath())
            .end(function (err, res) {

              if (err) {

                done(err);

              } else {

                assert.strictEqual(res.status, okStatus, `The response status code should be ${okStatus}.`);
                assert.strictEqual(res.type, htmlType, `The media type of the response body should be ${htmlType}.`);
                assert.isString(res.text, "The response body text should be a string.");
                assert.strictEqual(res.text, delMsg, `The value of the response body text string should be '${delMsg}'.`);
                
                //done();
                done();

              };

            });
        
      });

      test('Test DELETE /api/books/{id} with fake id not in db', function (done) {

        chai.request(server)
            .delete(fakeIdPath)
            .end(function (err, res) {

              if (err) {

                done(err);

              } else {

                assert.strictEqual(res.status, okStatus, `The response status code should be ${okStatus}.`); // Properly: 404 (Not Found)
                assert.strictEqual(res.type, htmlType, `The media type of the response body should be ${htmlType}.`);
                assert.isString(res.text, "The response body text should be a string.");
                assert.strictEqual(res.text, noBookMsg, `The value of the response body text string should be '${noBookMsg}'.`);
                
                //done();
                done();

              };

            });        
        
      });

      test("Test DELETE /api/books/{id} with invalid id not in db", function (done) {

        const resBody = invalidIdData;
        
        chai.request(server)
            .delete(invalidIdPath)            
            .end(function (err, res) {

              if (err) {

                done(err);

              } else {

                assert.strictEqual(res.status, badRequestStatus, `The response status code should be ${badRequestStatus}.`); 
                assert.strictEqual(res.type, jsonType, `The media type of the response body should be ${jsonType}.`);
                assert.isObject(res.body, "The response body should be an object literal.");
                assert.deepStrictEqual(res.body, resBody, `The response body object literal should be strictly and deeply equal to the following one: ${JSON.stringify(resBody).replaceAll("\"", "'")}.`);
                
                //done();
                done();

              };

            });
        
      }); 

    });

    suite("DELETE /api/books -> delete all book objects / expect confirmation message", function () {

      test("Test DELETE /api/books", function (done) {

        chai.request(server)
            .delete(basePath)
            .end(function (err, res) {

              if (err) {

                done(err);

              } else {

                assert.strictEqual(res.status, okStatus, `The response status code should be ${okStatus}.`);
                assert.strictEqual(res.type, htmlType, `The media type of the response body should be ${htmlType}.`);
                assert.isString(res.text, "The response body text should be a string.");
                assert.strictEqual(res.text, fullDelMsg, `The value of the response body text string should be '${fullDelMsg}'.`);
                
                //done();
                done();

              };

            });        

      });

    });

  });

});
