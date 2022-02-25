// https://eslint.org/docs/rules/
module.exports = {
    root: true,
    env: {
        node: true,
        es6: true,
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        parser: "@typescript-eslint/parser",
        ecmaVersion: 2020,
        sourceType: "module",
        project: ["tsconfig.eslint.json"],
    },
    extends: [
        "airbnb-base",
        "airbnb-typescript/base",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier",
        "plugin:prettier/recommended",
    ],
    ignorePatterns: [
        "src/generate/*",
        "src/config/Config/*.ts",
        "src/common/TEA.ts",
        "src/common/TSTea*",
        "submodules/AkaShareCode/BattleLogic/*",
    ],
    rules: {
        "prettier/prettier": [
            1,
            {
                endOfLine: "lf",
                printWidth: 130,
                tabWidth: 4,
                trailingComma: "all",
            },
        ],
        "no-debugger": process.env.NODE_ENV === "production" ? 2 : 1,
        "import/no-cycle": 0,
        "import/no-dynamic-require": 0,
        "import/order": [
            1,
            {
                groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
                alphabetize: { order: "asc", caseInsensitive: true },
            },
        ],
        "import/prefer-default-export": 0,
        "@typescript-eslint/lines-between-class-members": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-inferrable-types": [1, { ignoreParameters: true, ignoreProperties: true }],
        "@typescript-eslint/no-misused-promises": [2, { checksVoidReturn: false }],
        "@typescript-eslint/no-non-null-assertion": 0,
        "@typescript-eslint/no-unsafe-argument": 0,
        "@typescript-eslint/no-unsafe-assignment": 0,
        "@typescript-eslint/no-unsafe-member-access": 0,
        "@typescript-eslint/no-use-before-define": [
            2,
            {
                classes: false,
                functions: false,
                enums: false,
                typedefs: false,
                ignoreTypeReferences: true,
            },
        ],
        "@typescript-eslint/require-await": 1,
        "@typescript-eslint/no-var-requires": 0,
        "@typescript-eslint/ban-ts-comment": 0,
        "@typescript-eslint/no-unsafe-call": 0,
        "@typescript-eslint/restrict-template-expressions": 0,
        "@typescript-eslint/no-unused-vars": 0,
        "global-require": 0,
        "no-console": 0,
        "no-constant-condition": 0,
        "object-shorthand": 0,
        "class-methods-use-this": 0,
        "comma-dangle": [1, "always-multiline"], // 尾部的","
        "eol-last": 1, // 文件后的空行
        eqeqeq: [2, "smart"],
        "lines-between-class-members": [1, "always", { exceptAfterSingleLine: true }], // Class属性间的换行
        "max-classes-per-file": 0,
        "no-await-in-loop": 0,
        "no-continue": 0,
        "no-param-reassign": 0,
        "no-plusplus": 0,
        "no-restricted-syntax": 0,
        "no-underscore-dangle": 0,
        "no-unused-vars": 0, // 禁止未使用变量
        "no-var": 2, // 禁止var
        "no-void": 0,
        "prefer-const": 2, // 尽量使用const
        "prefer-destructuring": 0,
        "prefer-template": 1,
        "quote-props": [2, "as-needed"], // 属性的引号
        "no-empty": 0,
        "prefer-exponentiation-operator": 0, // Math.pow ==> **
        "no-restricted-properties": 0, // Math.pow ==> **
        "no-bitwise": 0,
        radix: [1, "as-needed"],
        "func-names": 0,
    },
};
