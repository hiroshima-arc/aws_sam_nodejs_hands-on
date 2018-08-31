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

### ドキュメント環境構築
```bash
cd /vagrant
curl -s api.sdkman.io | bash
source "/home/vagrant/.sdkman/bin/sdkman-init.sh"
sdk list maven
sdk use maven 3.5.4
sdk list java
sdk use java 8.0.181-zulu
sdk list gradle
sdk use gradle 4.9
```
ドキュメントのセットアップ
```
cd /vagrant/
touch build.gradle
```
`build.gradle`を作成して以下のコマンドを実行
```
gradle build
```
ドキュメントの生成
```bash
gradle asciidoctor
gradle livereload
```
[http://192.168.33.10:35729/](http://192.168.33.10:35729/)に接続して確認する

### パイプラインの構築
```
cd /vagrant/ops/code_pipline
./create_stack.sh 
```
`buildspec.yml`とビルド用スクリプトをプロジェクト直下に追加する
```
cd /vagrant/
npm init
npm install npm-run-all mocha chai eslint husky@next nyc --save-dev
npx install-peerdeps --dev eslint-config-airbnb
```
以下のnpmスクリプトを追加する
```
  "scripts": {
    "pre-commit": "npm run lint",
    "pre-push": "npm run coverage",
    "build": "npm-run-all build:*",
    "build:hello_world": "cd sam-app/hello_world ; npm install",
    "lint": "npm-run-all lint:*",
    "lint:hello_world": "eslint sam-app/hello_world/app.js",
    "test": "npm-run-all test:*",
    "test:hello_world": "mocha sam-app/hello_world/tests/*",
    "coverage": "npm-run-all coverage:*",
    "coverage:hello_world": "nyc --reporter=html --reporter=text mocha sam-app/hello_world/tests/*"
   },
```

**[⬆ back to top](#構成)**

## 配置
### AWS認証設定
```bash
cd /vagrant/sam-app
cat <<EOF > .env
#!/usr/bin/env bash
export AWS_ACCESS_KEY_ID=xxxxxxxxxxxx
export AWS_SECRET_ACCESS_KEY=xxxxxxxxxx
export AWS_DEFAULT_REGION=us-east-1
EOF
```
アクセスキーを設定したら以下の操作をする
```bash
source .env
aws ec2 describe-regions
```

### デプロイ
デプロイ用のS3バケットを用意する
```bash
aws s3 mb s3://nodejs-hands-on
```
デプロイを実行する
````bash
cd /vagrant/sam-app
sam validate
sam package --template-file template.yaml --s3-bucket nodejs-hands-on --output-template-file packaged.yaml
sam deploy --template-file packaged.yaml --stack-name nodejs-hands-on-development --capabilities CAPABILITY_IAM
````
デプロイが成功したら動作を確認する
```bash
aws cloudformation describe-stacks --stack-name nodejs-hands-on-development --query 'Stacks[].Outputs[1]'
```

パッケージで以下のエラーが出たら次のコマンドを実行する
```
Unable to upload artifact hello_world/ referenced by CodeUri parameter of HelloWorldFunction resource.
ZIP does not support timestamps before 1980
```
```
find . -mtime +10950 -print -exec touch {} \;
```

**[⬆ back to top](#構成)**

## 運用
### スタックの削除
```bash
aws cloudformation delete-stack --stack-name nodejs-hands-on
```
### S３バケットの削除
```bash
aws s3 rb s3://nodejs-hands-on --force
```

### git-secretsの設定
インストール
```bash
cd /home/vagrant
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets/
make install
cd ..
rm -rf git-secrets/
```
既存プロジェクトにフックを設定
```bash
cd /vagrant
git secrets --install
```
拒否条件を設定
```bash
git secrets --register-aws --global
```
レポジトリをスキャンする
```bash
cd /vagrant
git secrets --scan -r 
```
許可ルールを追加する
```bash
git config --add secrets.allowed sam-app/hello_world/event_file.json
```

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

### テストパッケージのセットアップ
```
npm install --save-dev sinon proxyquire chai-as-promised
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
+ [図入りのAsciiDoc記述からPDFを生成する環境をGradleで簡単に用意する](https://qiita.com/tokumoto/items/d37ab3de5bdbee307769)
+ [Code Deploy - Unhandled exception - ZIP does not support timestamps before 1980](https://github.com/aws/aws-cli/issues/2639)
+ [クラウド破産しないように git-secrets を使う](https://qiita.com/pottava/items/4c602c97aacf10c058f1)
+ [npm-run-all](https://www.npmjs.com/package/npm-run-all)
+ [AWS Startup Kit Serverless Workload](https://github.com/aws-samples/startup-kit-serverless-workload)  