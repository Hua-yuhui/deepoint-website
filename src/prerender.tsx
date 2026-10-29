import { renderToString } from "react-dom/server";
import { App, type Locale, type Page } from "./App";
export const render = (locale: Locale, page: Page) =>
  renderToString(<App locale={locale} page={page} />);
