module.exports = {
    publicPath: process.env.NODE_ENV === "production" ? "/ffcfui/" : "/",
    pages: {
        index: {
            entry: "src/main.js",
            filename: "index.html",
        },
    },
};
