# Line Filter

![demo of "Filter Active Editor" command](./media/demo.gif)

## Usage

- Add your patterns to the setting `lineFilter.patterns`. Example:

```json
"lineFilter.patterns": {
    "debug": {
        "includes": ["[Debug]"],
        "excludes": ["\"category\": \"telemetry\""]
    }
}
```

- Focus the editor you'd like to focus. This can be an output channel as well.
- Run one of these commands:
    - "Filter Active Editor"
    - "Filter Active Editor In Place"
    - "Filter and Watch Active Editor"
        - Only supported for output channels for now
        - It will only be watched as long as the output channel is visible. The TextDocument is disposed when the output channel is closed, so there is nothing for us to watch.


## Future work

- Regex patterns
- Show patterns in a tree view
- Enable dynamic enabling/disabling of patterns, auto-updating the filtered content
- Hint the number of filtered lines, maybe with an editor annotation or codelens. "x lines filtered, click to show". Or a folding range provider