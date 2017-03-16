import React from 'react';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      index: null,
      value: '',
      lines: [],
      results: [],
    };

    this.onChange = this.onChange.bind(this);
  }
  render() {
    const { results, value } = this.state;

    return (
      <div className="app-container">
        <div className="search-container">
          <label>Search against README:</label>
          <input
            type="text"
            value={value}
            onChange={this.onChange} />
        </div>
        <div className="results-container">
          <Results results={results} />
        </div>
      </div>
    );
  }
  onChange({ target: { value } }) {
    const { index, lines } = this.state;

    // Set captured value to input
    this.setState(() => ({ value }));

    // Search against lines and index if they exist
    if(lines && index) {
      return this.setState(() => ({
        results: this.search(lines, index, value),
      }));
    }

    // If the index doesn't exist, it has to be set it up.
    // You could show loading indicator here as loading might
    // take a while depending on the size of the index.
    loadIndex().then(({ index, lines }) => {
      // Search against the index now.
      this.setState(() => ({
        index,
        lines,
        results: this.search(lines, index, value),
      }));
    }).catch(err => console.error(err));
  }
  search(lines, index, query) {
    // Search against index and match README lines.
    return index.search(query.trim()).map(
      match => lines[match.ref],
    );
  }
};

const Results = ({results}) => {
  if(results.length) {
    return (<ul>{
      results.map((result, i) => <li key={i}>{result}</li>)
    }</ul>);
  }

  return <span>No results</span>;
};

function loadIndex() {
  // Here's the magic. Set up `import` to tell Webpack
  // to split here and load our search index dynamically.
  //
  // Note that you will need to shim Promise.all for
  // older browsers and Internet Explorer!
  return Promise.all([
    import('lunr'),
    import('../search_index.json')
  ]).then(([{ Index }, { index, lines }]) => {
    return {
      index: Index.load(index),
      lines,
    };
  });
}
