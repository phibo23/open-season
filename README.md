# open season

This is a small dataviz project hacked together to answer the question: *When was the last time Bayern München was NOT the Bundesliga team with most points in the last 34 matches?* I didn't find this stat on any of the popular football websites.

(Answer: Actually not as long ago as you might expect, on round 4 of the 2019/2020 season.)

![Chart showing the 2019/2020 season](screenshot.png)

## resources and tools

* [OpenLigaDB](https://www.openligadb.de/) provides detailed data for every Bundesliga match
* [D3](https://d3js.org/), because it's the de facto standard for dataviz in javascript and I wanted to learn how to use it in combination with react. This project is mostly based on [this example](https://observablehq.com/@mbostock/cancer-survival-rates).
* [react](https://reactjs.org/), [create-react-app](https://create-react-app.dev/), [react-use](https://github.com/streamich/react-use/), [material-ui](https://material-ui.com/), just because I feel comfortable building stuff with these
* [gh-pages](https://github.com/tschaub/gh-pages) and [GitHub Actions](https://docs.github.com/en/free-pro-team@latest/actions), because this was an opportunity to play around with these features.