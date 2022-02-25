module.exports = {
    arrowParens: "avoid", // 只有一个参数的箭头函数的参数是否带圆括号（默认avoid）
    bracketSpacing: true, // 对象字面量的大括号间使用空格（默认true）
    cursorOffset: 1, // Print (to stderr) where a cursor at the given position would move to after formatting.\nThis option cannot be used with --range-start and --range-end.
    endOfLine: "lf", // Which end of line characters to apply.
    // htmlWhitespaceSensitivity: "strict",
    // insertPragma: false,
    jsxBracketSameLine: false, // 多行JSX中的>放置在最后一行的结尾，而不是另起一行（默认false）
    jsxSingleQuote: true,
    printWidth: 120, // 每行代码长度（默认80）
    // proseWrap: "preserve",
    // requirePragma: false,
    semi: true, // 声明结尾使用分号(默认true)
    singleQuote: false, // 使用单引号（默认false）
    tabWidth: 4, // 每个tab相当于多少个空格（默认2）
    // trailingComma: 'none', // 多行使用拖尾逗号（默认none）
    useTabs: false, // 是否使用tab进行缩进（默认false）
};
