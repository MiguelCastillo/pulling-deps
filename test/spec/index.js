import { expect } from "chai";
import pulldeps from "../../src/index";

describe("Test suite", function() {
  var dependencies;

  describe("When parsing a single dynamic `import`", function() {
    before(function() {
      dependencies = pulldeps("import('module-name');").dependencies;
    });

    it("then dependencies length is `1`", function() {
      expect(dependencies).to.have.lengthOf(1);
    });

    it("then dependencies[0] is `module-name`", function() {
      expect(dependencies[0].name).to.equal("module-name");
    });
  });

  describe("When parsing a single dynamic `import` with `yield`", function() {
    before(function() {
      dependencies = pulldeps.fromSource(`
        function* someFUNC() {
          const b = yield import('module-name');
        }
      `).dependencies;
    });

    it("then dependencies length is `1`", function() {
      expect(dependencies).to.have.lengthOf(1);
    });

    it("then dependencies[0] is `module-name`", function() {
      expect(dependencies[0].name).to.equal("module-name");
    });
  });

  describe("When parsing a single dynamic `import` with `async` and `await`", function() {
    before(function() {
      dependencies = pulldeps.fromSource(`
        async function someFUNC() {
          return await import('module-name');
        }
      `, {
        options: {
          ecmaVersion: 8
        }
      }).dependencies;
    });

    it("then dependencies length is `1`", function() {
      expect(dependencies).to.have.lengthOf(1);
    });

    it("then dependencies[0] is `module-name`", function() {
      expect(dependencies[0].name).to.equal("module-name");
    });
  });

  describe("When parsing a single `import` with the default named export ", function() {
    before(function() {
      dependencies = pulldeps("import test from 'test'").dependencies;
    });

    it("then dependencies length is `1`", function() {
      expect(dependencies.length).to.equal(1);
    });

    it("then dependencies[0] is `test`", function() {
      expect(dependencies[0].name).to.equal("test");
    });
  });

  describe("When parsing a single `import` with an aliased named export", function() {
    before(function() {
      dependencies = pulldeps("import { test as t } from 'test'").dependencies;
    });

    it("then dependencies length is `1`", function() {
      expect(dependencies.length).to.equal(1);
    });

    it("then dependencies[0] is `test`", function() {
      expect(dependencies[0].name).to.equal("test");
    });
  });

  describe("When parsing a single `import` with no named export", function() {
    before(function() {
      dependencies = pulldeps("import 'test'").dependencies;
    });

    it("then dependencies length is `1`", function() {
      expect(dependencies.length).to.equal(1);
    });

    it("then dependencies[0] is `test`", function() {
      expect(dependencies[0].name).to.equal("test");
    });
  });

  describe("When parsing single `require`", function() {
    before(function() {
      dependencies = pulldeps("require('test')").dependencies;
    });

    it("then dependencies length is `1`", function() {
      expect(dependencies.length).to.equal(1);
    });

    it("then dependencies[0] is `test`", function() {
      expect(dependencies[0].name).to.equal("test");
    });
  });


  describe("When parsing single `require` with an array of dependencies", function() {
    before(function() {
      dependencies = pulldeps("require(['test'])").dependencies;
    });

    it("then dependencies length is `0`", function() {
      expect(dependencies.length).to.equal(0);
    });
  });


  describe("When parsing single `require` and `use strict`", function() {
    before(function() {
      dependencies = pulldeps("'use strict'; require('test')").dependencies;
    });

    it("then dependencies length is `1`", function() {
      expect(dependencies.length).to.equal(1);
    });

    it("then dependencies[0] is `test`", function() {
      expect(dependencies[0].name).to.equal("test");
    });
  });


  describe("When parsing single `require` assigned to a variable", function() {
    before(function() {
      dependencies = pulldeps("var test = require('test')").dependencies;
    });

    it("then dependencies length is `1`", function() {
      expect(dependencies.length).to.equal(1);
    });

    it("then dependencies[0] is `test`", function() {
      expect(dependencies[0].name).to.equal("test");
    });
  });


  describe("When parsing single `require` assigned to a variable in an if statement", function() {
    before(function() {
      dependencies = pulldeps("var x = true; if(x){var test = require('test')}").dependencies;
    });

    it("then dependencies length is `1`", function() {
      expect(dependencies.length).to.equal(1);
    });

    it("then dependencies[0] is `test`", function() {
      expect(dependencies[0].name).to.equal("test");
    });
  });


  describe("When parsing single `define` with an array", function() {
    before(function() {
      dependencies = pulldeps("define(['test'], function() {})").dependencies;
    });

    it("then dependencies length is `1`", function() {
      expect(dependencies.length).to.equal(1);
    });

    it("then dependencies[0] is `test`", function() {
      expect(dependencies[0].name).to.equal("test");
    });
  });


  describe("When parsing single named `define` with an array of two dependencies", function() {
    before(function() {
      dependencies = pulldeps("define('whatever name', ['test1', 'test2'], function() {})").dependencies;
    });

    it("then dependencies length is `2`", function() {
      expect(dependencies.length).to.equal(2);
    });

    it("then dependencies[0] is `test1`", function() {
      expect(dependencies[0].name).to.equal("test1");
    });

    it("then dependencies[1] is `test2`", function() {
      expect(dependencies[1].name).to.equal("test2");
    });
  });


  describe("When parsing single named `define` with an array of two dependencies and two require statements and one is an array", function() {
    before(function() {
      dependencies = pulldeps("define('whatever name', ['test1', 'test2'], function() {require('test3'); require(['test4']);})").dependencies;
    });

    it("then dependencies length is `3`", function() {
      expect(dependencies.length).to.equal(3);
    });

    it("then dependencies[0] is `test3`", function() {
      expect(dependencies[0].name).to.equal("test3");
    });

    it("then dependencies[1] is `test1`", function() {
      expect(dependencies[1].name).to.equal("test1");
    });

    it("then dependencies[2] is `test2`", function() {
      expect(dependencies[2].name).to.equal("test2");
    });
  });
});
