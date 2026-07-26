Place `icon-192.png` and `icon-512.png` in this folder for production PWA install.

Quick generation (any OS with ImageMagick):
```bash
magick ../favicon.svg -resize 192x192 icon-192.png
magick ../favicon.svg -resize 512x512 icon-512.png
```

Or use https://realfavicongenerator.net — upload `../favicon.svg` and copy the 192/512 PNGs here.

The manifest already falls back to `/favicon.svg` so the app works without these PNGs.
