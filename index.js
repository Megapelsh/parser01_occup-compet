require('dotenv').config()

const langs = require('./lang_short.json');

const fs = require('fs')
const puppeteer = require('puppeteer')

let url = process.env.url;
let urlStart = process.env.urlStart;
let urlFinish = process.env.urlFinish;

(async () => {
    let occupationCounter = 1

    try {

        let browser = await puppeteer.launch({
            headless: false,
            slowMo: 100,
            devtools: true,
        })

        let page = await browser.newPage()
        await page.setViewport({
            width: 1400,
            height: 900,
        })

        let data = {}

        while (occupationCounter <= 1000) {

            let occupArr = []
            let occupTitle = ''

            for (let key in langs.data) {

                let occupationObj = {}

                await page.goto(`${urlStart}${langs.data[key]}${urlFinish}${occupationCounter}`)
                await page.waitForSelector('#copyright')

                let html = await page.evaluate(async () => {
                    try {
                        let occupation = document.querySelector('.text-primary').innerHTML
                        let neededCompetencyHeader = document.querySelector('.heading h4').innerHTML
                        let requiredSkillsHeader = document.querySelector('#RequiredSkills .heading h4').innerHTML
                        let neededCompetenciesArr = document.querySelectorAll('#NCContent .panel-list-group-item')
                        let requiredSkillsArr = document.querySelectorAll('#RequiredSkills .panel-list-group-item')

                        console.log(occupation)
                        console.log(neededCompetencyHeader)
                        console.log(neededCompetenciesArr)
                        console.log(requiredSkillsArr)

                        let neededCompetencies = []
                        let requiredSkills = []

                        for (let elem of neededCompetenciesArr) {
                            neededCompetencies.push(elem.innerHTML.trim())
                        }

                        for (let elem of requiredSkillsArr) {
                            requiredSkills.push(elem.innerText.trim())
                        }

                        let obj = {
                            occupationTitle: occupation,
                            neededCompetencyHeader: neededCompetencyHeader,
                            neededCompetencies: neededCompetencies,
                            requiredSkillsHeader: requiredSkillsHeader,
                            requiredSkills: requiredSkills,
                        }

                        return obj
                    }
                    catch (e) {
                        console.log(e)
                    }
                })

                occupationObj[langs.data[key]] = html

                if (langs.data[key] == 'en') {
                    occupTitle = occupationObj[langs.data[key]].occupationTitle
                }

                occupArr.push(occupationObj)

                console.log(occupTitle + ' ID =' + occupationCounter + ', ' + langs.data[key])

            }

            data[occupTitle] = occupArr
            occupationCounter++
        }



        await fs.writeFile('occup-compet-1-1000.json', JSON.stringify({'data': data}), err => {
            if (err) throw err
            console.log('file is saved')
            console.log( data.length + ' elements')
        })
        // await browser.close()

    }
    catch (e) {
        console.log(e)
    }
}) ();