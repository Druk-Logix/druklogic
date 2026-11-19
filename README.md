# Druk Logic & Engineering Solutions

Website of Druk Logic & Engineering Solutions, Gelephu, Bhutan. Static site served by GitHub Pages: https://arunsanyasi2786.github.io/druklogic/

Contact: Arun Sanyasi (Founder & Chief Executive Officer), +975 1791 4131, sanyasiarun220@gmail.com

## Moving to a custom domain

1. After registering the domain, verify it in the GitHub account's Pages settings and add it under this repository's **Settings → Pages → Custom domain**. Point the domain's DNS records to GitHub Pages, then enable **Enforce HTTPS**. [GitHub Pages domain setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
2. Replace the old public base URL in the HTML metadata, organization data and `sitemap.xml` with the new HTTPS URL. Update the homepage contact section and the `company.web` and `company.url` values in `assets/js/data.js`. Keep the homepage's Search Console verification tag.
3. Test that the GitHub Pages address redirects to the matching pages on the new domain. Verify the new domain in Search Console and resubmit the sitemap under that property. [Google's site migration guide](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
