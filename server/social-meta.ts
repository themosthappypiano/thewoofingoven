const CAMPAIGN_PATH = "/paws-for-venezuela";
const CAMPAIGN_TITLE = "Paws for Venezuela | Dog Biscuits for a Cause";
const CAMPAIGN_DESCRIPTION =
  "Every biscuit helps. Support Red de Apoyo Canino and help dogs in Venezuela through Paws for Venezuela.";
const CAMPAIGN_IMAGE =
  "https://www.thewoofingoven.ie/images/paws-for-venezuela/share-poster.png";

function replaceMeta(
  html: string,
  attribute: "property" | "name",
  key: string,
  content: string,
) {
  const tag = new RegExp(
    `<meta\\s+${attribute}="${key}"\\s+content="[^"]*"\\s*/?>`,
    "s",
  );
  return html.replace(tag, `<meta ${attribute}="${key}" content="${content}" />`);
}

export function injectSocialMeta(pathname: string, html: string) {
  if (pathname.replace(/\/+$/, "") !== CAMPAIGN_PATH) return html;

  let page = html.replace(/<title>[^<]*<\/title>/, `<title>${CAMPAIGN_TITLE}</title>`);
  page = replaceMeta(page, "name", "description", CAMPAIGN_DESCRIPTION);
  page = replaceMeta(page, "property", "og:title", CAMPAIGN_TITLE);
  page = replaceMeta(page, "property", "og:description", CAMPAIGN_DESCRIPTION);
  page = replaceMeta(page, "property", "og:url", `https://www.thewoofingoven.ie${CAMPAIGN_PATH}`);
  page = replaceMeta(page, "property", "og:image", CAMPAIGN_IMAGE);
  page = replaceMeta(page, "name", "twitter:title", CAMPAIGN_TITLE);
  page = replaceMeta(page, "name", "twitter:description", CAMPAIGN_DESCRIPTION);
  page = replaceMeta(page, "name", "twitter:image", CAMPAIGN_IMAGE);
  return page;
}
