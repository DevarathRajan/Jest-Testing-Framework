To run test:
NODE_ENV=test npm test

We have setup the server to run only if the node env is not test.

if you modify the test make sure to clear cache:
npx jest --clearCache