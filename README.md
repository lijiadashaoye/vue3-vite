
### 用 vite 创建项目
###### 创建项目：npm/pnpm create vite projectName
###### 安装依赖：cd projectName --> cnpm i
###### 启动项目：npm run dev

### 用webpack创建项目：
###### vue create project

### 安装pnpm
###### npm i pnpm -g

### 使用scss
###### vite 不需要配置loader，但必须安装相应的预处理器依赖：cnpm i sass -D

### 使用 http-server
###### 装包 cnpm install http-server -g/-D，全局 -g 或者只在当前项目里安装 -D
###### 在dist文件夹上开启终端，并 http-server -g -o -p 5523，-g表示识别压缩文件，-o表示自动打开页面，-p 5523 表示设置端口号