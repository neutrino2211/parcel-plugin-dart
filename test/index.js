const fileUrl = require("file-url")
let uriNode8 = fileUrl("test/basic/build/index.html")
let uriNodePre8 = fileUrl("test/basic/build-node-pre-8/index.html")
const {Builder, By} = require('selenium-webdriver');
const assert = require("assert")

describe("Basic project page",function(){
    this.slow(20000)
    this.timeout(30000)
    let browser = new Builder().forBrowser('chrome');
    let driver = browser.build();
    describe("Node > 8",()=>{
        it("should have #output text as 'Your Dart app is running.'",async()=>{
            await driver.get(uriNode8);
            var text = await driver.findElement(By.id("output")).getText();
            assert.deepEqual(text,"Your Dart app is running.")
        })
    })

    describe("Node < 8",()=>{
        it("should have #output text as 'Your Dart app is running.'",async()=>{
            await driver.get(uriNode8);
            var text = await driver.findElement(By.id("output")).getText();
            assert.deepEqual(text,"Your Dart app is running.")
        })
    })
    after(async()=>driver.quit())
})