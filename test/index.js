const fileUrl = require("file-url")
let uri = fileUrl("test/basic/build/index.html")
const {Builder, By, logging} = require('selenium-webdriver');
const {Options} = require('selenium-webdriver/chrome')
const assert = require("assert")

describe("Basic project page",function(){
    this.slow(20000)
    this.timeout(30000)
    let browser = new Builder().forBrowser('chrome');
    let driver = browser.build();
    it("should have #output text as 'Your Dart app is running.'",async()=>{
            await driver.get(uri);
            var text = await driver.findElement(By.id("output")).getText();
            assert.deepEqual(text,"Your Dart app is running.")
    })
    after(async()=>driver.quit())
})