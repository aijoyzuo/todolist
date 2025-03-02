const path = require("path");

module.exports = {
    entry: "./index.js", // 入口文件（你的 JS 主要檔案）
    output: {
        filename: "bundle.js", // 打包後的 JS 檔案名稱
        path: path.resolve(__dirname, "dist") // 輸出到 dist 資料夾
    },
    mode: "production", // 模式: development（開發模式）或 production（正式模式）
    module: {
        rules: [
            {
                test: /\.js$/, // 針對 .js 檔案
                exclude: /node_modules/, // 排除第三方套件
                use: {
                    loader: "babel-loader" // 讓新語法轉換成瀏覽器可讀的 ES5
                }
            },
            {
                test: /\.scss$/, // 針對 .scss 檔案
                use: ["style-loader", "css-loader", "sass-loader"] // 處理 SCSS
            },
            {
                test: /\.css$/, // 針對 .css 檔案
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "dist"),
        },
        compress: true,
        port: 9000
    }
};
