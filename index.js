require('dotenv').config()

const langs = require('./lang_short.json');

const fs = require('fs')
const puppeteer = require('puppeteer')

let url = process.env.url;
let urlStart = process.env.urlStart;
let urlFinish = process.env.urlFinish;

(async () => {
    let occupationCounter = 2501

    try {

        let browser = await puppeteer.launch({
            headless: true,
            slowMo: 70,
            devtools: true,
        })

        let page = await browser.newPage()
        await page.setViewport({
            width: 1400,
            height: 900,
        })

        let data = {}
        let langArr = ["us", "nl", "dk", "de", "fr", "es", "pt", "cz", "fi", "gr", "it", "pl", "ro"]

        while (occupationCounter <= 3000) {

            let occupArr = []
            let occupTitle = ''

            for (let i = 0; i < langArr.length; i++) {

                try {
                    let occupationObj = {}

                    await page.goto(`${urlStart}${langArr[i]}${urlFinish}${occupationCounter}`)
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

                    occupationObj[langArr[i]] = html

                    if (langArr[i] === 'us') {
                        occupTitle = occupationObj[langArr[i]].occupationTitle
                    }

                    occupArr.push(occupationObj)

                    console.log(occupTitle + ' ID =' + occupationCounter + ', ' + langArr[i])
                }

                catch (e) {
                    console.log(e)
                    i = langArr.length - 1
                }

            }

            data[occupTitle] = occupArr
            occupationCounter++
        }



        await fs.writeFile('occup-compet-2501-3000.json', JSON.stringify({'data': data}), err => {
            if (err) throw err
            console.log('file is saved')
            let dataLength = 0
            for (let key in data) {
                dataLength++
            }
            console.log( dataLength + ' elements')
        })
        // await browser.close()

    }
    catch (e) {
        console.log(e)
    }
}) ();