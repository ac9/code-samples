### ``isUrlImageExtension(url)``
Checks if ``url`` ends in `png`, `jpeg`, `gif`, `jpg`, `bmp`, `tif`.

- `url` `<String>`

```js
if (PV.isUrlImageExtension(url)) {
    console.log(`Success`);
} else {
    console.log(`Failure`);
}
```