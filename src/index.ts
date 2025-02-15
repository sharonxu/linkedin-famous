import puppeteer, { Browser, Page } from "puppeteer";

const linkedinSearchQueries = [
  // Technical/AI
  "RAG architecture implementation",
  "vector database education",
  "LLM education implementation",
  "embedding models education",
  "AI tutor architecture",
  "implementing AI tutors",
  "vector search education",
  "education LLM deployment",
  "AI education infrastructure",

  // EdTech
  "personalized learning AI",
  "adaptive learning platform",
  "education technology infrastructure",
  "AI teaching assistant",
  "automated tutoring system",
  "EdTech AI implementation",
  "smart tutoring system",
  "educational AI development",

  // Problem-Focused
  "scaling personalized education",
  "education personalization challenges",
  "tutoring system bottlenecks",
  "AI education problems",
  "tutoring scalability issues",
  "education accessibility AI",

  // Industry/Role
  "EdTech CTO",
  "AI education founder",
  "education startup technology",
  "learning platform engineer",
  "education ML engineer",
  "AI education product manager",

  // Time-Based (with recency terms)
  "tutoring AI new",
  "education technology latest",
  "AI education launched",
  "EdTech building",
  "AI tutor development recent",
  "education AI implementation progress",
];

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

async function performSearch(page: Page, searchQuery: string) {
  // Navigate to search page with the query
  const encodedQuery = encodeURIComponent(searchQuery);
  await page.goto(
    `https://www.linkedin.com/search/results/all/?keywords=${encodedQuery}&origin=GLOBAL_SEARCH_HEADER&sid=vo3`,
    { waitUntil: "domcontentloaded" }
  );

  // Find and click Posts button
  await page.waitForSelector(
    ".artdeco-pill.artdeco-pill--slate.artdeco-pill--choice.artdeco-pill--2"
  );
  const buttonPosition = await page.evaluate(() => {
    const buttons = document.querySelectorAll(
      ".artdeco-pill.artdeco-pill--slate.artdeco-pill--choice.artdeco-pill--2"
    );
    const postsButton = Array.from(buttons).find(
      (button) => button.textContent?.trim() === "Posts"
    );
    const rect = postsButton?.getBoundingClientRect();
    return rect
      ? { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
      : null;
  });

  if (buttonPosition) {
    await page.mouse.click(buttonPosition.x, buttonPosition.y);
    console.log("Clicked Posts button for search:", searchQuery);
  }
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const copiedUrls: string[] = [];

  // Find and click all matching SVGs
  const svgElements = await page.$$("svg");
  for (const svg of svgElements) {
    const hasTargetPath = await svg.evaluate((el) => {
      const targetSvgPath =
        "M3.25 8C3.25 8.69 2.69 9.25 2 9.25C1.31 9.25 0.75 8.69 0.75 8C0.75 7.31 1.31 6.75 2 6.75C2.69 6.75 3.25 7.31 3.25 8ZM14 6.75C13.31 6.75 12.75 7.31 12.75 8C12.75 8.69 13.31 9.25 14 9.25C14.69 9.25 15.25 8.69 15.25 8C15.25 7.31 14.69 6.75 14 6.75ZM8 6.75C7.31 6.75 6.75 7.31 6.75 8C6.75 8.69 7.31 9.25 8 9.25C8.69 9.25 9.25 8.69 9.25 8C9.25 7.31 8.69 6.75 8 6.75Z";
      const path = el.querySelector("path");
      return path && path.getAttribute("d") === targetSvgPath;
    });

    if (hasTargetPath) {
      const position = await svg.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      });

      // Click the SVG
      await page.mouse.click(position.x, position.y);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Click to copy link and ensure page is focused
      await page.bringToFront();
      await page.mouse.click(position.x, position.y + 135);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Get clipboard content
      const url = await page.evaluate(() => {
        return document.hasFocus() ? navigator.clipboard.readText() : null;
      });

      if (url) {
        copiedUrls.push(url);
      }
    }
  }

  console.log("Copied URLs:", copiedUrls);

  // Extract text, likes, and comments from all matching divs
  const posts = await page.evaluate(() => {
    const divs = document.getElementsByClassName(
      "update-components-text relative update-components-update-v2__commentary"
    );
    return Array.from(divs).map((div) => {
      const postContainer = div.closest(".feed-shared-update-v2");
      const likesSpan = postContainer?.querySelector(
        ".social-details-social-counts__reactions-count"
      );
      const commentsSpan = postContainer?.querySelector(
        'span[aria-hidden="true"]'
      );

      const likes = parseInt(likesSpan?.textContent?.trim() || "0");
      const commentsText = commentsSpan?.textContent?.trim() || "";
      const comments = parseInt(commentsText.split(" ")[0] || "0");

      return {
        text: div.textContent?.trim() || "",
        likes,
        comments,
      };
    });
  });

  // Combine posts and links
  const combinedData = posts.map((post, index) => ({
    link: copiedUrls[index] || "",
    post: post.text,
    likes: post.likes,
    comments: post.comments,
  }));

  // Log the extracted text
  console.log("Combined data:", combinedData);

  // Take and save screenshot
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  await page.screenshot({
    path: `linkedin-jobs-${timestamp}.png`,
    fullPage: true,
  });

  console.log(`Screenshot saved as linkedin-jobs-${timestamp}.png`);

  return combinedData;
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
    await new Promise((resolve) => process.stdin.once("data", resolve));

    const allResults = [];

    // Take first 10 queries from the existing array
    const searchQueries = linkedinSearchQueries.slice(0, 10);

    for (const query of searchQueries) {
      console.log(`Performing search for: ${query}`);
      const searchResults = await performSearch(page, query);
      allResults.push(...searchResults);

      // Add a delay between searches to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    // Save results to JSON file
    const fs = require("fs");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `linkedin-results-${timestamp}.json`;

    fs.writeFileSync(filename, JSON.stringify(allResults, null, 2));
    console.log(`Results saved to ${filename}`);

    await browser.close();
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// <span aria-hidden="true" class="social-details-social-counts__reactions-count
//                         ">
// 26                    </span>

// <span aria-hidden="true">
//                               15 comments
//                           </span>

main();
