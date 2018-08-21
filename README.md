AWS SAM Node.js Hands-on
===================

# 目的 #
AWS サーバーレスアプリケーションモデル (AWS SAM) ハンズオン(Node.js)

# 前提 #
| ソフトウェア   | バージョン   | 備考        |
|:---------------|:-------------|:------------|
| node           |8.10.0    |             |
| sam            |0.3.0  |             |
| docker         |17.06.2  |             |
| docker-compose |1.21.0  |             |
| vagrant        |2.0.3  |             |


# 構成 #
1. [構築](#構築 )
1. [配置](#配置 )
1. [運用](#運用 )
1. [開発](#開発 )

## 構築
### 開発用仮想マシンの起動・プロビジョニング
+ Dockerのインストール
+ docker-composeのインストール
+ pipのインストール
```bash
vagrant up
vagrant ssh
```

### 開発パッケージのインストール
+ aws-sam-cliのインストール
+ nvmのインストール
+ Node.jsのインストール
```bash
pip install aws-sam-cli
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.3/install.sh | bash
source ~/.bashrc 
nvm install v8.10
nvm alias default v8.10
```

**[⬆ back to top](#構成)**

## 配置

**[⬆ back to top](#構成)**

## 運用

**[⬆ back to top](#構成)**

## 開発
### アプリケーションの作成
```bash
cd /vagrant
sam init --runtime nodejs
cd sam-app
```

### ローカルでテストする
```bash
cd hello_world
npm install
npm test
sam local generate-event api > event_file.json
cd ..
sam local invoke HelloWorldFunction --event hello_world/event_file.json
sam local start-api --host 0.0.0.0
```
[http://192.168.33.10:3000/hello](http://192.168.33.10:3000/hello)に接続して確認する

### ESLintのセットアップ
```bash
cd /vagrant/sam-app/hello_world/
npm install eslint --save-dev
```
### eslint-config-airbnbのセットアップ
```bash
cd /vagrant/sam-app/hello_world/
npx install-peerdeps --dev eslint-config-airbnb
./node_modules/.bin/eslint --init
cat <<EOF > .eslintrc
{
  "extends": "airbnb",
  "plugins": [],
  "parserOptions": {},
  "env": {"mocha": true},
  "globals": {},
  "rules": {}
}
EOF
```
package.jsonにnpm-scriptを追加する
```json
"scripts": {
    "test": "mocha tests/unit/",
    "lint": "eslint ./src"
  },
```
lintコマンドを実行する
```bash
npm run lint
```

### huskyのセットアップ
```bash
npm install husky@next --save-dev
```
package.jsonにnpm-scriptを追加する
```bash
"scripts": {
    "test": "mocha tests/unit/",
    "lint": "eslint ./",
    "pre-commit": "npm run lint",
    "pre-push": "npm test"
  },
```
コマンドを確認する
```bash
npm run pre-commit
npm run pre-push
```

### コードカバレッジのセットアップ
```bash
npm install --save-dev nyc
```
package.jsonにnpm-scriptを追加する
```json
"scripts": {
    "test": "mocha tests/unit/",
    "lint": "eslint ./",
    "coverage": "nyc --reporter=html --reporter=text mocha tests/unit/",
    "pre-commit": "npm run lint",
    "pre-push": "npm test"
  },
```

**[⬆ back to top](#構成)**

# 参照 #
+ [Amazon Linux2にDockerをインストールする](https://qiita.com/reoring/items/0d1f556064d363f0ccb8)
+ [Pythonのパッケージ管理システムpipのインストールと使い方](https://uxmilk.jp/12691)
+ [aws-sam-local 改め aws-sam-cli の新機能 sam init を試す](https://qiita.com/hayao_k/items/841026f9675d163b58d5)
+ [nvmを使ったNode.jsのインストール&バージョンアップ手順](https://qiita.com/ffggss/items/94f1c4c5d311db2ec71a)
+ [eslint-config-airbnb](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb)
+ [ESLint 最初の一歩](https://qiita.com/mysticatea/items/f523dab04a25f617c87d)
+ [husky](https://github.com/typicode/husky)
+ [istanbul](https://istanbul.js.org/)  