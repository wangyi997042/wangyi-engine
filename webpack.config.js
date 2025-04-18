const path = require('path');

module.exports = {
  entry: './src/engine/index.tsx', // 入口文件
  output: {
    path: path.resolve(__dirname, 'dist'), // 输出目录
    filename: 'index.js', // 输出文件名
    library: 'Engine', // 导出的库名称
    libraryTarget: 'umd', // 打包为 UMD 格式
    globalObject: 'this', // 兼容 Node.js 和浏览器
  },
  mode: 'production', // 打包模式
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/, // 处理 .ts 和 .tsx 文件
        exclude: /node_modules/, // 排除 node_modules
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env', // 转换 ES6+ 语法
              '@babel/preset-react', // 转换 JSX
              '@babel/preset-typescript', // 转换 TypeScript
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'], // 自动解析扩展名
  },
  externals: {
    react: 'React', // 外部依赖，不打包 React
    'react-dom': 'ReactDOM', // 外部依赖，不打包 ReactDOM
  },
};