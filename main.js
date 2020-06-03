(function() {
  var libraryObject = {};

  var libraryHandler = function(libraryName) {
    if (libraryObject[libraryName].value === null) {
      var dependencyReferences = libraryObject[libraryName].dependencies.map(function(name) {
        return libraryHandler(name);
      });

      libraryObject[libraryName].value = libraryObject[libraryName].callback.apply(null, dependencyReferences);
    }
    return libraryObject[libraryName].value;
  };

  var librarySystem = function(libraryName, dependencyNames, callback) {
    if (arguments.length === 1) {
      return libraryHandler(libraryName);
    } else {
      dependencyNames = Array.isArray(dependencyNames) ? dependencyNames : [];

      libraryObject[libraryName] = {
        callback: callback,
        dependencies: dependencyNames,
        value: null,
      };
    }
  };

  window.librarySystem = librarySystem;
  window.libraryObject = libraryObject;

  tests({
    'It should work with libraries that have no dependency.': function() {
      libraryObject = {};

      librarySystem('name', [], function() {
        return 'Gordon';
      });
      eq(librarySystem('name'), 'Gordon');
    },
    'If should work with libraries that have more than one dependency.': function() {
      libraryObject = {};

      librarySystem('name', [], function() {
        return 'Gordon';
      });
      librarySystem('company', [], function() {
        return 'Watch and Code';
      });
      librarySystem('workBlurb', ['name', 'company'], function(name, company) {
        return name + ' works at ' + company;
      });
      eq(librarySystem('workBlurb'), 'Gordon works at Watch and Code');
    },
    'It should work with the libraries created out of order.': function() {
      libraryObject = {};

      librarySystem('workBlurb', ['name', 'company'], function(name, company) {
        return name + ' works at ' + company;
      });
      librarySystem('name', [], function() {
        return 'Gordon';
      });
      librarySystem('company', [], function() {
        return 'Watch and Code';
      });
      eq(librarySystem('workBlurb'), 'Gordon works at Watch and Code');
    },
    'It should run the library\'s callback function only once.': function () {
      libraryObject = {};

      var numberOfTimesCallbackHasRun = 0;
      librarySystem('name', [], function() {
        numberOfTimesCallbackHasRun++;
        return 'Gordon';
      });
      librarySystem('name');
      librarySystem('name');
      librarySystem('name');
      eq(numberOfTimesCallbackHasRun, 1);
    },
    'It should work with libraries that have multi-level nested dependencies.': function() {
      libraryObject = {};

      // chujunlu's test
      librarySystem('objective', ['position', 'fun'], function (position, fun) {
        return 'I want to work as a ' + position + ' In my free time, ' + fun;
      });

      librarySystem('position', [], function () {
        return 'front-end developer.'
      });

      librarySystem('fun', ['activity', 'destination'], function (activity, destination) {
        return 'I enjoy ' + activity + 'I want to travel to ' + destination;
      });

      librarySystem('activity', [], function () {
        return 'rock climbing, hiking and sailing. ';
      });

      librarySystem('destination', [], function () {
        return 'Jordan.'
      });

      eq(librarySystem('objective'), 'I want to work as a front-end developer. In my free time, I enjoy rock climbing, hiking and sailing. I want to travel to Jordan.');
    }
  });
})();
