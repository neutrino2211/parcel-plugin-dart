const {SourceMapConsumer} = require("source-map");
const fs = require("fs")

let map = fs.readFileSync("./proj/build/output.js.map","utf-8");
SourceMapConsumer.with(map,null,(consumer)=>{
    consumer.sources.forEach((c)=>{
        console.log(c)
        console.log(consumer.sourceContentFor(c))
    })
})