import { defineConfig, splitVendorChunkPlugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import viteCompression from 'vite-plugin-compression'  // gizp 压缩代码插件
// Vite常用基本配置：https://www.weipxiu.com/8649.html

// cnpm i @babel/core @babel/preset-env @rollup/plugin-babel -D
import babel from '@rollup/plugin-babel';
function setConfig(config) {
    let obj = {
        resolve: {
            alias: {
                '@/': `${path.resolve(__dirname, 'src')}/`,
                // 创建自定义元素使用
                'vue': 'vue/dist/vue.esm-bundler.js',
            },

        },
        css: {
            preprocessorOptions: {
                scss: {
                    // 设置全局变量存放空间
                    additionalData: '@import "@/globalScssVar.scss";'
                },
            }
        }
    }
    if (config.mode === 'development') {
        return {
            base: '/',
            server: {
                port: 4444,
                open: true,
                proxy: {
                    '/sse': {
                        target: 'http://localhost:2342',
                        changeOrigin: true,
                        // rewrite: (path) => path.replace(/^\/sse/, '')
                    },
                }
            },
            ...obj,
            plugins: [
                vue({
                    template: {
                        compilerOptions: {
                            // 将所有带短横线的标签名都视为自定义元素，写webComponent用
                            isCustomElement: (tag) => tag.includes('lp-')
                        }
                    }
                }),
                {
                    // 构建一个本地开发环境的服务器通信
                    configureServer(server) {
                        server.ws.on('my:from-client', (data, client) => {
                            console.log('Message from client:', data.msg)
                            server.ws.send('my:greetings', { msg: 'hello' });
                        })
                    },
                }
            ]
        }
    } else {
        return {
            base: './',
            ...obj,
            build: {
                chunkSizeWarningLimit: 1024 * 300,
                // 启用true/禁用false gzip 压缩大小报告
                reportCompressedSize: true,
                rollupOptions: {
                    output: {
                        // 指定打包文件名称
                        assetFileNames: "assets/[hash][extname]",
                        // 压缩 Rollup 产生的额外代码
                        compact: true,
                        // 加上这个可以将打包文件数量减少，以减少http次数
                        manualChunks: id => {
                            if (id.includes('node_modules')) {
                                return 'vender'; // 将库类型的文件提取出来省得多次打包
                            } else {
                                return '[hash]' // 其他文件以哈希方式命名
                            }
                        }
                    },
                },
            },
            esbuild: {
                // 去除 console
                drop: ["console", "debugger"]
            },
            plugins: [
                vue({
                    template: {
                        compilerOptions: {
                            // 将所有带短横线的标签名都视为自定义元素，写webComponent用
                            isCustomElement: (tag) => tag.includes('lp-')
                        }
                    }
                }),
                babel({
                    exclude: 'node_modules/**',
                    babelHelpers: 'bundled',
                    presets: [
                        [
                            '@babel/env',
                            {
                                modules: false,
                                useBuiltIns: 'usage',
                                corejs: 3,
                                targets: {
                                    browsers: '> 1%, IE 11, not op_mini all, not dead',
                                    node: 8
                                },
                            },
                        ],
                    ]
                }),
                // terser 一个Rollup插件，用于生成精简的捆绑包
                // terser(),  // 加上后包会更小一些
                viteCompression({
                    algorithm: 'gzip', // 压缩算法
                    // 启用压缩的文件大小限制
                    threshold: 1024 * 200, // 对大于 200KB 的文件进行压缩
                    deleteOriginFile: true,// 压缩后是否删除原文件，默认为 false
                })
            ]
        }
    }
}
export default defineConfig((config) => setConfig(config))