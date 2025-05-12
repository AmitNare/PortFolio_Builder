import React from "react";
import SetPortfolio from "./SetPortfolio";
import { Helmet } from "react-helmet";

export default function UserPreview() {
  return (
    <>
      <Helmet>
        <meta name="title" content="Preview | Portify" />
        <meta
          name="description"
          content="Preview your personal portfolio in real-time with Portify. Instantly see how your updates to projects, skills, and experience appear on your live portfolio."
        />
        <meta
          name="keywords"
          content="Portify, portfolio preview, live portfolio updates, real-time changes, personal website preview, responsive portfolio, portfolio editor, instant preview, portfolio design, update preview"
        />

        <meta name="site.name" content="Portify" />

        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Preview Portfolio | Portify - See Live Changes Instantly"
        />
        <meta
          property="og:description"
          content="Get a real-time preview of your personal portfolio. Make updates and instantly visualize how your portfolio will look to visitors."
        />
        <meta
          property="og:image"
          content="https://github.com/AmitNare/PortFolio_Builder/blob/main/public/favicon/website-image.png?raw=true"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:title"
          content="Preview Portfolio | Portify - See Live Changes Instantly"
        />
        <meta
          property="twitter:description"
          content="Experience real-time portfolio editing with Portify. See exactly how your projects, skills, and achievements will appear on your live profile."
        />
        <meta
          property="twitter:image"
          content="https://github.com/AmitNare/PortFolio_Builder/blob/main/public/favicon/website-image.png?raw=true"
        />

        <title>
          Preview | Portify - Make updates and instantly visualize how your
          portfolio will look to visitors.
        </title>
      </Helmet>
      <div>
        <SetPortfolio />
      </div>
    </>
  );
}
