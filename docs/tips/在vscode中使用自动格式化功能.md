---
author: meihuan
date: 2020-01-04
---

# 在vscode保存文件时自动格式化

##  vscode 自带配置格式化

使用如下设置即可：
``` json
{
    "editor.formatOnSave": true
}
```
该配置包含对`javascript`、`less/css`、`html`的格式化支持，其他文件类型未进行测试

## 按照配置文件格式化

通常，每个项目中都有一个eslint配置文件，保证各项目成员的规范统一。对于不熟悉规范的开发者来说，每次保存都会报一大片的错误。
在保存的时候自动格式化， 会比较省时间。

需要安装 `vscode` 的 `eslint` 插件, 且需要安装 `eslint` 包，然后在配置文件配置如下字段：


``` json
{
    "eslint.options": {
        "configFile": ".eslintrc" // 配置文件相对路径
    },
    "editor.codeActionsOnSave": {
        "source.fixAll": false, // 两个配置保证一个为true
        "source.fixAll.eslint": true
    },
}
```
在此配置中， `"editor.formatOnSave"` 需要设置为`false`，不然会格式化两次。
