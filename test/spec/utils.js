const {confirmPubspec, getPubspec, getBuildScript, confirmBuildScript} = require("../../lib/compiler/resolver") // Use compiled version
const {getRelevantFiles, buildPath} = require("../../lib/compiler/index")
const assert = require("assert")

describe("Compiler",function(){
    describe("#resolver.js",function(){
        describe(".confirmPubspec",function(){
            it("should return true for 'basic' project",function(){
                assert(confirmPubspec("test/basic"))
            })

            it("should return false for project root",function(){
                assert(confirmPubspec(".")===false)
            })
        })

        describe(".getPubspec",function(){
            const yaml = getPubspec("test/basic")

            it("should have a name field in yaml",function(){
                assert(yaml.name !== undefined)
            })

            it("should have dependencies 'build_runner' and 'build_web_compilers' in yaml",function(){
                assert(yaml.dev_dependencies.build_runner!==undefined)
                assert(yaml.dev_dependencies.build_web_compilers!==undefined)
            })
        })

        describe(".getBuildScript",function(){
            const yaml = getBuildScript("test/basic");

            it("should be empty for basic",function(){
                assert(JSON.stringify(yaml) === "{}")
            })
        })

        describe(".confirmBuildScript",function(){
            const exists = confirmBuildScript("test/basic")

            it("should be false",function(){
                assert(exists === false);
            })
        })
    })

    describe("#compiler.js",function(){
        describe(".getRelevantFiles", async function(){
            const relFiles = await getRelevantFiles("test/basic","main.dart")

            it("should have project files",function(){
                assert(relFiles.project.length > 0)
            })

            it("should have no dependency files",function(){
                assert(relFiles.dependencies.length === 0)
            })
        })
    })
})