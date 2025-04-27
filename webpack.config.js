const path = require('path');

module.exports = {
  entry: './src/engine/index.tsx', // 指定 engine 文件夹的入口文件
  output: {
    path: path.resolve(__dirname, 'dist'), // 输出目录
    filename: 'index.js', // 输出文件名
    libraryTarget: 'commonjs2', // 输出为 CommonJS 格式
    clean: true, // 清理输出目录
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
              [
                '@babel/preset-typescript',
                {
                  allowDeclareFields: true, // 启用 declare 修饰符支持
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.css$/, // 处理 CSS 文件
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'], // 自动解析扩展名
  },
  externals: {
    react: 'commonjs react', // 将 react 作为外部依赖
    'react-dom': 'commonjs react-dom', // 将 react-dom 作为外部依赖
  },
};