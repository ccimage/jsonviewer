# Change Log
All notable changes to the "jsonviewer" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.5.2] - 2024-8-16
- fix/improve: not render when have ‘ in json key or value

## [1.5.1] - 2024-8-15
- fix/improve: [#11](https://github.com/ccimage/jsonviewer/issues/11) "parseError": "Invalid character '\n' at position "

## [1.5.0] - 2023-9-26
- fix/improve: retain context when hidden tabs.

## [1.4.0] - 2023-8-21
- fix: [#8](https://github.com/ccimage/jsonviewer/issues/8) uint64 numbers are displayed incorrectly
- replace json editor with a version forked by myself. to make long number correct (use bigint) 

## [1.3.3] - 2023-8-18
- fix: [#7](https://github.com/ccimage/jsonviewer/issues/7) Json viewer will break (cannot be rendered properly) if there is a text ```</script>``` in any json strings

## [1.3.2] - 2023-1-5
- fix: comment-json module not found

## [1.3.0] - 2023-1-5
- new: open json with comments by Alex Giddings

## [1.2.5] - 2022-8-31
- update: add some other modes to the editor (open a menu)

## [1.2.4] - 2022-8-31
- update: upgrade version of JSONEditor to v9.9.0

## [1.2.3] - 2022-2-25
- update: dev tools, engine to vscode 1.34 and shift tslint to eslint
- update: use new api of webview

## [1.2.1] - 2018-09-14
- change  js resource link to local file

## [1.2.2] - 2018-10-08
- fixed: See nothing on Dark theme

## [1.1.1] 
- fix bug:  Icons not display

## [1.1.0] - 2018-08-24
- update viwer to JSONEditor's Viewer
- command menu display as 'Open in json viewer'

## [1.0.3]
- add project icon

## [1.0.2] - 2018-05-21
- fix some mistake on the document

## [1.0.0] - 2018-05-20
- First version
- Based on chrome/firefox extension [jsonview](https://github.com/bhollis/jsonview)
- All of the codes are from [jsonview](https://github.com/bhollis/jsonview) excepted the in18 and error message
