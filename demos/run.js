const DemoRunner = require('./DemoRunner');
(new DemoRunner(
  'NightDay: Two-way replacements',
  'nightday',
  ['night', 'day'],
  {
    baseUrl: 'https://en.wikipedia.org',
    config: {
      css: `
        .replaced-term {
          background-color: rgba(139, 195, 74, 0.5);
          padding: 0 0.2em;;
        }
        .replaced-term.ambiguous-term {
          background-color: rgba(255, 193, 7, 0.5);
        }`
    }
  }
)).run();

(new DemoRunner(
  'Obama: Large HTML page, multiple replacements',
  'obama',
  ['men', 'women'],
  {
    baseUrl: 'https://en.wikipedia.org',
    config: {
      css: `
        .replaced-term {
          background-color: rgba(139, 195, 74, 0.5);
          padding: 0 0.2em;;
        }
        .replaced-term.ambiguous-term {
          background-color: rgba(255, 193, 7, 0.5);
        }`
    }
  }
)).run();
