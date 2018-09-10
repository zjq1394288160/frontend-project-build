const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const devMode = process.env.NODE_ENV !=='production';

//需要被打包入口文件数组
//数组元素类型 {string|object}
//string:将以默认规则生成bundle
//object{filename|title|template} 生成的bundle.html的文件名|title标签内容|路径 /public 下的模板文件(需指定文件后缀)
const entryList = [
    'page1',
    'page2'
];


/**
 * @param {array} entryList 
 * @param {object} option:可选  entry常规的配置对象,需自己配置属性名及入口文件名
 */
const createEntry = (entryList=[],option={}) =>{
    let obj = {};
    entryList.forEach(item=>{
        let name = item.filename?'./js/'+item.filename: './js/'+item;
        obj[name] = path.resolve(__dirname,'./src',`./${item}.js`);
    });
    return Object.assign(obj,option);
};


//生成HtmlWebpackPlugin插件的实例
const createPluginInstance = (entryList=[])=>{
    if(typeof HtmlWebpackPlugin!=='function')throw new Error('HtmlWebpackPlugin is not defined!');
    return entryList.map( item =>{
        if(typeof item!=='string'&& typeof item!=='object')throw new Error('参数类型错误');
        return new HtmlWebpackPlugin({
            filename:item.filename?`${item.filename}.html`:`${item}.html`,
            template:item.template?`./public/${item.template}`:'./public/template.html',
            title:item.title?item.title:item,
            chunks:[`./js/${item.filename?item.filename:item}`,'./js/extractedJS','./js/vendors','./js/runtime',devMode?`./css/[id].css`:`./css/[id].[contenthash].css`] 
        });
    });
};




module.exports = {
    entry:createEntry(entryList),
    output:{
        path:path.resolve(__dirname , './build')
    },
    module:{
        rules:[
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test:/\.vue$/,
                use:'vue-loader'
            },
            {
                test: /\.less$/,
                use: [
                    {loader: 'style-loader'}, 
                    {loader: 'css-loader'}, 
                    {loader: 'less-loader'}
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use:'file-loader'
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use:'file-loader'
            }
        ]
    },
    plugins:createPluginInstance(entryList).concat([
        //vue SFCs单文件支持
        new VueLoaderPlugin()
    ]),
    optimization:{
        runtimeChunk:{
            name:'./js/runtime'
        },
        splitChunks:{
            cacheGroups:{
                //引入的包、库
                vendors:{
                    test: /[\\/]node_modules[\\/]/,
                    name: './js/vendors',
                    chunks:'all'
                },
                //业务中可复用的js
                extractedJS:{
                    test:/[\\/]src[\\/].*\.js$/,
                    name:'./js/extractedJS',
                    chunks:'all',
                    minSize:20000
                }
                
            }
        }
    }
};