# Druk Logic & Engineering Solutions

Druk Logic & Engineering Solutions is an industrial automation company in Gelephu, Bhutan. This repository powers the company website, engineering catalogue, enquiry form and live PLC lab.

[Live website](https://druk-logix.github.io/druklogic/) · [PLC and SCADA services](https://druk-logix.github.io/druklogic/plc-scada-bhutan.html) · [Live PLC lab](https://druk-logix.github.io/druklogic/lab.html)

## Repository layout

| Path | Purpose |
| --- | --- |
| `index.html`, `plc-scada-bhutan.html` | Company overview, service details and project enquiries |
| `marketplace.html` | Searchable catalogue of hardware, packages and training |
| `portfolio.html` | Engineering experience, demonstrations and deliverables |
| `lab.html` | Browser-based tank and pump simulation with an automated factory acceptance test report |
| `assets/` | Styles, JavaScript, brand assets and the company profile |
| `sitemap.xml` | Public pages submitted to Google Search Console |

The site uses HTML, CSS and JavaScript. It loads live prices and sends enquiries through the Google Apps Script endpoint configured in `assets/js/data.js`.

## Preview locally

From the repository root, start a static server and open the site in your browser. [Local preview](http://localhost:8000/)

```sh
python -m http.server 8000
```

## Deployment

GitHub Pages publishes the root of the `main` branch. Keep internal links relative and update `sitemap.xml` when you add or move a public page.

## Moving to a custom domain

1. After registering the domain, verify it in the GitHub account's Pages settings and add it under this repository's **Settings → Pages → Custom domain**. Point the domain's DNS records to GitHub Pages, then enable **Enforce HTTPS**. [GitHub Pages domain setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
2. Replace the old public base URL in the HTML metadata, organization data and `sitemap.xml` with the new HTTPS URL. Update the homepage contact section and the `company.web` and `company.url` values in `assets/js/data.js`. Keep the homepage's Search Console verification tag.
3. Test that the GitHub Pages address redirects to the matching pages on the new domain. Verify the new domain in Search Console and resubmit the sitemap under that property. [Google's site migration guide](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)

## Contact

Arun Sanyasi, Founder & Chief Executive Officer. [Email](mailto:sanyasiarun220@gmail.com) · [+975 1791 4131](tel:+97517914131) · [Project enquiries](https://druk-logix.github.io/druklogic/#contact)
