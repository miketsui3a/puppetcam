const puppeteer = require("puppeteer");
const Xvfb = require("xvfb");
var width = 1920;
var height = 1080;
var xvfb = new Xvfb({
  silent: true,
  xvfb_args: ["-screen", "0", `${width}x${height}x24`, "-ac"],
});
var options = {
  headless: false,
  args: [
    "--enable-usermedia-screen-capturing",
    "--allow-http-screen-capture",
    "--auto-select-desktop-capture-source=puppetcam",
    "--load-extension=" + __dirname,
    "--disable-extensions-except=" + __dirname,
    "--disable-infobars",
    `--window-size=${width},${height}`,
  ],
};


async function main() {
  xvfb.startSync();
  var url = process.argv[2],
    exportname = process.argv[3];
  if (!url) {
    url = "https://dev.aivo.ai/export/e578b0c8-e3e7-46c0-9250-6a7ffc7981e8?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImYwN2QyMjJjLThhZTQtNGMzZS1hNTU3LTExYmY2YzJlZDM0MCIsInBhc3N3b3JkIjoiJDJhJDEwJC5hQXdubkhvR05UbS50cG9ZQkMydy4wRTJhTUcuSTMwSldtWTdSdlJTY1JndGd2NWdTYVlPIiwiZW1haWwiOiJqaWFzaGVuZ0BwYW50aGVvbmxhYi5haSIsImlhdCI6MTU5Mzc0ODk2MCwiZXhwIjoxNTkzODM1MzYwfQ.Zg6sQ8LRIdVCtLxcv1zLQsqDgBc1EE35iYjkuasFsEE";
  }
  if (!exportname) {
    exportname = "spinner.webm";
  }
  const browser = await puppeteer.launch(options);
  const pages = await browser.pages();
  const page = pages[0];
  

  await page._client.send("Emulation.clearDeviceMetricsOverride");
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.setBypassCSP(true);
  await page.setViewport({ width, height })
  // await page.click('div[class="play-overlay"]');

  // Perform any actions that have to be captured in the exported video
  await page.evaluate(function(){
    document.title = 'puppetcam'
    window.postMessage({ type: 'REC_CLIENT_PLAY', data: { url: window.location.origin } }, '*') 
  })
  await page.waitFor(5000);

  // await page._client.send("Page.setDownloadBehavior", {
  //   behavior: "allow",
  //   downloadPath: './',
  // });

  await page.evaluate((filename) => {
    window.postMessage({ type: "SET_EXPORT_PATH", filename: filename }, "*");
    window.postMessage({ type: "REC_STOP" }, "*");
    console.log(filename)
  }, exportname);

  // Wait for download of webm to complete
  await page.waitForSelector("html.downloadComplete", { timeout: 0 });
  await browser.close();
  xvfb.stopSync();
}

main();
