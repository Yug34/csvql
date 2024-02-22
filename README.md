# CSVQL

A fully client-side app that allows you to make SQL queries on CSV data.

Hosted [here](https://csvql.vercel.app) on Vercel.

## Feature set

- Fully functioning SQL: Real-time queries, Joins, etc.
- Import custom CSV files into the editor and query the file
- Export query results as a CSV file
- Tracking query history
- Theming

## Libraries used

- Built with **React** using **Vite**
- **Tailwind** and  **shadcn** for styling
- **Alasql** as the client-side SQL engine
- **Zustand** for state management
- **react-ace** for the query editor

## Performance and Optimizations

Here's the LightHouse results, the dip in Accessibility is because of the `react-ace-editor`'s input fields not having associated labels.

![perf.png](assets%2Fperf.png)

I had previously stored the CSV files in the `public/` folder before this to fetch them on the client-side, but I decided to just hardcode them as strings in the JS bundle itself in order to keep the number of HTTP requests this app makes down.

The core assets (minus perhaps the Vite Favicon) load fairly quick, and there's no external HTTP requests the app makes.

So there's really no media assets in this app, but in the case there were some, I'd use SVGs if the media was vector art, and compressed WebPs otherwise.

With resource caching disabled, as the Network tab below shows; the DOM content loaded event fires at about `210ms` from request initiation, and the load event fires at about `515ms`.

![waterfall.png](assets%2Fwaterfall.png)

The most impactful optimizations you could do to a website for load time would come from optimizing images, this app didn't really have any but regardless [here's a blog](https://www.10xtech.io/blogs/web-perf) I wrote about using the apt images for performance.

<hr/>

## Walkthrough video

[Walkthrough video](https://github.com/Yug34/csvql/raw/master/assets/screen-capture%20(5).webm)

### Previews

![preview-light.png](assets%2Fpreview-light.png)
![preview-dark.png](assets%2Fpreview-dark.png)

