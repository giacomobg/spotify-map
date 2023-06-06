NSMG Svelte/Layer Cake Template
===

This is a starter example based on [Layer Cake](https://layercake.graphics). 

It also comes with all the other components from the [guide](https://layercake.graphics), some custom components we wrote and:
* `/graphics/` - boilerplate chart code (wrappers)
* `/components/` - base chart components (in theory, shouldn't need to be edited).

It also contains the boilerplate code needed to include it in our CMS, using [pym.js](http://blog.apps.npr.org/pym.js/). The template.html page shows an example of the iframe being included in a page, use it to check there isn't any issues with our code/svelte communicating with pym. Generally it's covered by sending a message `onMount()`, but if you're resizing after user interaction you might need to pass the pym.js child object around to send messages to the parent. The template.html file is also important when developing scrollies - additional template code for this is [here](https://github.com/nsmediadataunit/nsmg-scrolly-template/).

## How to start
1. install node, [gh](https://cli.github.com/), git
2. [ssh access to github](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
3. copy the setup (unix or win) script from [nsmg-misc](https://github.com/nsmediadataunit/nsmg-misc) to the root of your projects folder (eg. `ns/code`)
4. run `node setup.js`
5. follow prompts
6. enter project directory and use `pnpm run dev`
7. localhost:5000

## Naming

Currently using "nsmg-000" as numbering convention. Substitute for a higher number, check [project list](https://pmgoperations-my.sharepoint.com/:w:/r/personal/josh_rayman_globaldata_com/_layouts/15/Doc.aspx?sourcedoc=%7B1B534EFB-8BFE-4F62-816A-B1FC3E21071E%7D&file=Project%20List%20(NSMG%20and%20GD).docx&wdOrigin=OFFICECOM-WEB.START.REC&ct=1642087857896&action=default&mobileredirect=true) for previously used numbers.

## Developing

```sh
# if you didn't already install, run the install command
pnpm install
pnpm run dev
```

Your app will be running at [localhost:5000](http://localhost:5000).

*Note* - if it crashes with no error message (something that started when we changed rollup version), run `pnpm run build` and it should return an error.

### Additional dependencies required
* pie chart: `d3-shape`
* circle map: `d3-force`

### Storing data
Preferably in `/public/data` and using a fetch to request it on pageload. It means you can push data changes without rebuilding the whole project, it also means you can point to a remote datasource updated by someone else.

You can store data in `/src/data` and load it in, but particularly CSV comes at a high filesize cost (csv is converted to JSON, and packed inline inside the bundle.js).

### Developing multiple embeds in one repo
```
    "buildc": "rollup -c --input",
    "devc": "rollup -c -w --input",
```

`pnpm run devc src/main.js`
`pnpm run buildc src/main.js`

These commands allow you to run custom path projects out of the same repo (eg. nsmg-047 and nsmg-052). 

How to use:
* copy main.js and rename, point this to the different interactive path (eg. `main2.js` and `App2.svelte`)
* modify the deploy scripts to use a subfolder structure (eg. `nsmg-0XX/App2/`), as this assumes that you're deploying to nsmg-0XX/.

## Deploy

* `sh deploy` -> nsmg-projects-public.s3.eu-west-2.amazonaws.com/test/nsmg-000
* `sh deploy-live` -> nsmg-projects-public.s3.eu-west-2.amazonaws.com/live/nsmg-000

The script runs a sync directly on aws using the sdk - you will need the [AWS CLI](https://aws.amazon.com/cli/) installed on your computer and a API key/secret configured.

## Including in CMS
Update `nsmg-000` for your project number. Increment the last number (`-0`) if using multiple versions of an include in one page. Remember to deploy to live.
```
<div id="nsmg-000-0"></div><script type="text/javascript" src="https://pym.nprapps.org/pym.v1.min.js"></script><script>var pymParent = new pym.Parent("nsmg-000-0", "https://nsmg-projects-public.s3.eu-west-2.amazonaws.com/live/nsmg-000/index.html", {});</script>
```

## Misc notes
* Page navigation - you need to use pym.js to send a message from child to parent to scroll on the page (eg. using anchor tags. `pymChild.scrollParentToChildEl('eleId')`)

### Using deckgl map:
* Use npm rather than pnpm (some issue with probe.gl)
* add the following code to package.json
```
"dependencies": {
    "@deck.gl/aggregation-layers": "^8.3.0",
    "@deck.gl/core": "^8.3.0",
    "@deck.gl/geo-layers": "^8.7.8",
    "@deck.gl/layers": "^8.3.0",
    ...
```

```
"peerDependencies": {
    "@deck.gl/core": "^8.3.0"
}
```
* add the following code to rollup
```
    output : {
        ...
		globals: {
			'@deck.gl/core': 'core',
			'@deck.gl/layers': 'layers'
		}
    }
```

```
    commonjs({
        include: ['node_modules/**'],
    }),
```
* for Windows: 
`@probe.gl/log/dist/esm/log.js` is importing `asciify-image` which is breaking it. Comment out the usage of it in `logImageInNode()` for now, keep tabs on this issue on github for possible future fixes: https://github.com/uber-web/probe.gl/issues/196

### Bringing charts from older projects

* topojson is deprecated for topojson-client
* layercake changed how it does calcExtents, moving from:
```
const extentGetters = [
    { field: 'x', accessor: d => d[xField] },
    { field: 'y', accessor: d => d[yField] }
  ];
```
to:
`const extentGetters =  { x: d => d[xField], y: d => d[yField] };`

### Canela text
Occasionally you might need body text. NS uses Canela currently. Add this to the css.

```
@font-face{
	font-family:'Reg. Modn Bold';
	src:url('https://www.newstatesman.com/wp-content/themes/newstatesman/assets/dist/fonts/CanelaText-Regular-Web.woff2') format('woff2');
	font-style:normal;
    font-weight:normal;
}
```