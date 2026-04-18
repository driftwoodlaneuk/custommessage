# Configurable GitHub Pages landing page

This version supports a **finite set of numbered messages, SVG image names, and transitions** through the URL.

## Folder structure

- `index.html`
- `css/style.css`
- `js/main.js`
- `img/`

## URL format

Use numbered scene parameters:

- `msg#` = text for that scene
- `msgt#` = message transition number
- `img#` = image name
- `imgt#` = image transition number

Example:

```text
https://your-site.example/?msg1=I&msgt1=1&img1=circle&imgt1=2&msg2=love&msgt2=3&img2=square&imgt2=4
```

The page also tolerates a comma-separated version like this and converts it automatically:

```text
?msg1=I, msgt1=1, img1=circle, imgt1=2, msg2=love, msgt2=3, img2=square, imgt2=4
```

## Default behaviour

If no numbered scene parameters are provided, the page falls back to:

- message: `I love you lots, but`
- image: `middle-finger-svgrepo-com`
- message transition: `2`
- image transition: `1`

## Allowed image names

- `middle-finger-svgrepo-com`
- `circle`
- `square`
- `triangle`
- `heart`

Add more SVGs by placing them in `img/` and updating `ALLOWED_IMAGES` in `js/main.js`.

## Message transitions

- `1` = fade in
- `2` = zoom in
- `3` = slide up
- `4` = spin in

## Image transitions

- `1` = zoom in
- `2` = zoom out
- `3` = spin clockwise
- `4` = spin counter-clockwise
- `5` = fade in

## Timing

- initial delay before the first scene: `3000ms`
- each scene duration: `2200ms`

You can change those values in `js/main.js`.
