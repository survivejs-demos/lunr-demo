import React from "react";

const App = () => {
  const [index, setIndex] = React.useState(null);
  const [value, setValue] = React.useState("");
  const [lines, setLines] = React.useState([]);
  const [results, setResults] = React.useState([]);

  const search = (lines, index, query) => {
    // Search against index and match README lines.
    return index.search(query.trim()).map((match) => lines[match.ref]);
  };

  const onChange = ({ target: { value } }) => {
    // Set captured value to input
    setValue(value);

    // Search against lines and index if they exist
    if (lines && index) {
      setResults(search(lines, index, value));

      return;
    }

    // If the index doesn't exist, it has to be set it up.
    // You could show loading indicator here as loading might
    // take a while depending on the size of the index.
    loadIndex()
      .then(({ index, lines }) => {
        setIndex(index);
        setLines(lines);

        // Search against the index now
        setResults(search(lines, index, value));
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="app-container">
      <div className="search-container">
        <label>Search against README:</label>
        <input type="text" value={value} onChange={onChange} />
      </div>
      <div className="results-container">
        <Results results={results} />
      </div>
    </div>
  );
};

const Results = ({ results }) => {
  if (results.length) {
    return (
      <ul>
        {results.map((result, i) => (
          <li key={i}>{result}</li>
        ))}
      </ul>
    );
  }

  return <span>No results</span>;
};

function loadIndex() {
  // Here's the magic. Set up `import` to tell Webpack
  // to split here and load our search index dynamically.
  //
  // Note that you will need to shim Promise.all for
  // older browsers and Internet Explorer!
  return Promise.all([import("lunr"), import("../search_index.json")]).then(
    ([{ Index }, { index, lines }]) => {
      return {
        index: Index.load(index),
        lines,
      };
    }
  );
}

export default App;
