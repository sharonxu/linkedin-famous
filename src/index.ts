import puppeteer, { Browser, Page } from "puppeteer";

async function setupBrowser(): Promise<Browser> {
  const browser = await puppeteer.launch({
    headless: false,
    channel: "chrome",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1920,1080",
      "--enable-audio",
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      "--disable-blink-features=AutomationControlled",
    ],
    ignoreDefaultArgs: ["--enable-automation"],
    defaultViewport: null,
  });

  const pages = await browser.pages();
  const page = pages[0];
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    // @ts-ignore
    window.chrome = { runtime: {} };
  });

  return browser;
}

async function main() {
  try {
    const browser = await setupBrowser();
    const page = await browser.newPage();

    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate to LinkedIn login page
    await page.goto("https://www.linkedin.com/login", {
      waitUntil: "domcontentloaded",
    });

    console.log(
      "Please log in manually. Once logged in, press Enter to continue..."
    );

    // Wait for user to press Enter
    await new Promise((resolve) => {
      process.stdin.once("data", (data) => {
        resolve(data);
      });
    });

    // Navigate to jobs search page
    await page.goto(
      "https://www.linkedin.com/search/results/all/?keywords=jobs&origin=GLOBAL_SEARCH_HEADER&sid=vo3",
      {
        waitUntil: "domcontentloaded",
      }
    );

    // Wait for and click the "See all job posts" button
    await page.waitForSelector("text/See all job posts");
    await page.click("text/See all job posts");

    // Wait for 3 seconds after first click
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Wait for and click "Show more results"
    await page.waitForSelector("text/Show more results");
    await page.click("text/Show more results");

    // Wait another 3 seconds after second click
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Take and save screenshot
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    await page.screenshot({
      path: `linkedin-jobs-${timestamp}.png`,
      fullPage: true,
    });

    console.log(`Screenshot saved as linkedin-jobs-${timestamp}.png`);

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
