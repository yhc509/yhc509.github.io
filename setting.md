## gatsby 프로젝트 생성
```shell
npx gatsby-cli new '프로젝트명'

cd '프로젝트명'
gatsby develop
```

---

## 미사용 플러그인 제거 및 Typescript 환경 세팅
```shell
npx yarn remove gatsby-plugin-manifest gatsby-plugin-gatsby-cloud
```

Typescript 환경 구성
```shell
npx yarn add typescript --dev
npx yarn add gatsby-plugin-typescript
```

gatsby-config.js에 plugins array 제일 앞에 아래 내용 추가 및 주석 추가.

```js
module.exports = {
  siteMetadata: {
    title: `Gatsby Default Starter`,
    description: `Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.`,
    author: `@gatsbyjs`,
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-typescript',
      options: {
        isTSX: true,
        allExtensions: true,
      },
    },
    ...
    
    // {
    //   resolve: `gatsby-plugin-manifest`,
    //   options: {
    //     name: `gatsby-starter-default`,
    //     short_name: `starter`,
    //     start_url: `/`,
    //     background_color: `#663399`,
    //     // This will impact how browsers show your PWA/website
    //     // https://css-tricks.com/meta-theme-color-and-trickery/
    //     // theme_color: `#663399`,
    //     display: `minimal-ui`,
    //     icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
    //   },
    // },
```

```shell
npx yarn tsc --init
```

tsconfig.json 수정
```js
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "allowJs": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "baseUrl": "./src",
    "paths": {
      "components/*": ["./components/*"],
      "utils/*": ["./utils/*"],
      "hooks/*": ["./hooks/*"]
    },
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*.tsx"],
  "exclude": ["node_modules"]
}
```

---

## gatsby-node.js에 Webpack Config 정보 추가
```js

const path = require('path');

// Setup Import Alias
exports.onCreateWebpackConfig = ({ getConfig, actions }) => {
  const output = getConfig().output || {};

  actions.setWebpackConfig({
    output,
    resolve: {
      alias: {
        components: path.resolve(__dirname, 'src/components'),
        utils: path.resolve(__dirname, 'src/utils'),
        hooks: path.resolve(__dirname, 'src/hooks'),
      },
    },
  });
};
```

---

## vscode ESLint 플러그인 설치

```라이브러리 설치
npx yarn add eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest --dev
```

루트 디렉토리에 .eslintrc.json 파일 생성 후 아래 내용으로 작성
```js
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:prettier/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 12,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["react", "@typescript-eslint"],
  "ignorePatterns": ["dist/", "node_modules/"],
  "rules": {}
}
```

syntax 무시를 위한 .eslintignore 파일 작성
```js
gatsby-browser.js
gatsby-config.js
gatsby-node.js
gatsby-ssr.js
```

.prettierrc 내용 수정
```js
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

vscode File > Preferences > Settings > Format On Save 체크
json 형태에서 아래 내용으로 변경
```js
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  },
```
---
## 실행
```shell
npx gatsby develop
```