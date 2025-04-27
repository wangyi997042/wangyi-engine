const path = require('path');

module.exports = {
  entry: './src/engine/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js', // CommonJS 格式的文件
    libraryTarget: 'commonjs2', // 输出为 CommonJS 格式
    // filename: 'index.js',
    // library: 'MyLibrary',
    // libraryTarget: 'umd',
    globalObject: 'this',
    clean: true,
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
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
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};