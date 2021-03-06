const chai = require('chai');
const path = require('path');

const {
  joinWithNewLines,
} = require('../../../../../commonTestResources/utils');
const chaiResponseValidator = require('../../..');

const dirContainingApiSpec = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid/basePathDefinedDifferently',
);
const { expect, AssertionError } = chai;

describe('Using OpenAPI 2 specs that define basePath differently', () => {
  describe('spec has no basePath property', () => {
    before(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'noBasePathProperty.yml',
      );
      chai.use(chaiResponseValidator(pathToApiSpec));
    });

    describe('res.req.path matches an endpoint path', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/test/responseBody/string',
        },
        body: 'valid body (string)',
      };

      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });

      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(AssertionError, '');
      });
    });

    describe('res.req.path matches no endpoint paths', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/test/nonExistentEndpointPath',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          new RegExp(
            `${joinWithNewLines(
              "expected res to satisfy a '200' response defined for endpoint 'GET /test/nonExistentEndpointPath' in your API spec",
              "res had request path '/test/nonExistentEndpointPath', but your API spec has no matching path",
              'Paths found in API spec: /test/responseBody/string',
            )}$`,
          ),
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });
  });

  describe('spec has basePath property', () => {
    before(() => {
      const pathToApiSpec = path.join(
        dirContainingApiSpec,
        'basePathProperty.yml',
      );
      chai.use(chaiResponseValidator(pathToApiSpec));
    });

    describe('res.req.path matches the basePath and an endpoint path', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/test/responseBody/string',
        },
        body: 'valid body (string)',
      };

      it('passes', () => {
        expect(res).to.satisfyApiSpec;
      });

      it('fails when using .not', () => {
        const assertion = () => expect(res).to.not.satisfyApiSpec;
        expect(assertion).to.throw(AssertionError, '');
      });
    });

    describe('res.req.path does not match the basePath', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/responseBody/string',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          joinWithNewLines(
            "expected res to satisfy a '200' response defined for endpoint 'GET /responseBody/string' in your API spec",
            "res had request path '/responseBody/string', but your API spec has basePath '/test'",
          ),
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });

    describe('res.req.path matches the basePath but no endpoint paths', () => {
      const res = {
        status: 200,
        req: {
          method: 'GET',
          path: '/test/nonExistentEndpointPath',
        },
        body: 'valid body (string)',
      };

      it('fails', () => {
        const assertion = () => expect(res).to.satisfyApiSpec;
        expect(assertion).to.throw(
          joinWithNewLines(
            "expected res to satisfy a '200' response defined for endpoint 'GET /test/nonExistentEndpointPath' in your API spec",
            "res had request path '/test/nonExistentEndpointPath', but your API spec has no matching path",
            'Paths found in API spec: /responseBody/string',
            "'/test/nonExistentEndpointPath' matches basePath `/test` but no <basePath/endpointPath> combinations",
          ),
        );
      });

      it('passes when using .not', () => {
        expect(res).to.not.satisfyApiSpec;
      });
    });
  });
});
