# Minimal Web Clipper

<table>
  <tr>
    <td>
      <img src="https://raw.githubusercontent.com/fluid-notion/minimal-web-clipper/master/src/img/icon-128.png" alt="Logo"/>
    </td>
    <td>
      <strong>A dead simple :monkey_face: chrome extension for clipping selections from web pages.</strong>
      <hr/>
          It allows selection of parts of a webpage and downloads the clipped content as a standalone HTML file preserving the original look and feel as closely as possible.
      <br/>
          This file can be opened and previewed in any standard web browser.
    </td>
  </tr>
</table>

## Status

**Alpha**

Preliminary version was coded over a few hours while waiting for a delayed flight.

## TODO

- [ ] Automated tests
- [ ] Firefox support
- [ ] Support for shadow dom
- [ ] Support for downloading fonts
- [ ] Support for frames and iframes
- [ ] Annotating clips before download
- [ ] Editing and previewing clips

## Non-goals

:no_entry: Synchronization support.

:no_entry: Integration with proprietary third party services.

## About Fluid Notion

[Fluid Notion](https://github.com/fluid-notion) is a suite of minimal open-source productivity tools.

## Development

This plugin was based on [Samuel Simões](https://twitter.com/samuelsimoes)'s [Chrome extension boilerplate](https://github.com/samuelsimoes/chrome-extension-webpack-boilerplate).

## Local installation during development

1. Clone the repository.
2. Install [yarn](https://yarnpkg.com): `npm install -g yarn`.
3. Run `yarn`.
4. Change the package's name and description on `package.json`.
5. Change the name of your extension on `src/manifest.json`.
6. Run `npm run start`
7. Load your extension on Chrome following:
    1. Access `chrome://extensions/`
    2. Check `Developer mode`
    3. Click on `Load unpacked extension`
    4. Select the `build` folder.
8. Have fun.

## Packing

After the development of your extension run the command

```
$ NODE_ENV=production npm run build
```
Now, the content of `build` folder will be the extension ready to be submitted to the Chrome Web Store. Just take a look at the [official guide](https://developer.chrome.com/webstore/publish) to more information.
