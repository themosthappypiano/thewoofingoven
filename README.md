# thewoofingoven
# Image reliability

Product and marketing images should live under `client/public/images` and be referenced with a URL such as `/images/products/cakes/example.jpg`. Avoid using Postimages, ImgBB, or other free image-hosting links for production assets: the host can remove or replace them without notice.

Run `npm run check:images` to verify that every image referenced in the site exists and that remote URLs still return image content. The **Image health** GitHub Actions workflow also runs this check every Monday and can be started manually. A failed run identifies each broken URL and every source location using it.

The monitor detects and reports a failure; it does not invent or automatically replace a missing photo. Keep the original files in this repository (or in managed object storage) so a host outage cannot remove them from the website.
