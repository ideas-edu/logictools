# Translation
In this directory you find the translation files for the tools. Each file is named using ISO 639-1 Language Codes. In each file you will find a JSON object with keys defined in the source code and values containing the translated string to be displayed to the user. The keys are in a hierarchy to reduce repetition.
```json
{
	"nested": {
		"key1": "Value 1",
		"key2": "Value 2"
	}
}
```
In this way the values `"Value 1"` and `"Value 2"` can be referenced by the keys `"nested.key1"` and `"nested.key2"` respectively. For this reason we do not allow `.` characters in the JSON keys.
## Parameters
You can include parameters in you translation strings by enclosing them in doubles braces such as `{{param}}`. For example if we have the following key
```json
{
	"greeting": "Hello {{name}}"
}
```
Then in the source code the call
```js
translate('greeting', { name: 'Alan' })
```
will be rendered as `'Hello Alan'`.

## Nested Strings
Parameters can refer to other strings in the translation file by enclosing them in square brackets such as `[[param]]`. For example if we have the following key
```json
{
	"create": "Create [[item]]",
	"item": {
		"exercise": "Exercise",
		"exam": "Exam"
	}
}
```
Then in the source code the call
```js
translate('create', { item: 'item.exercise' })
```
will be rendered as `'Create Exercise'`.
