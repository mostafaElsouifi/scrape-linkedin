require('dotenv').config();
const puppeteer = require('puppeteer');
const xlsx = require('xlsx');

const wait = (sec)=>{
    return new Promise(resolve=>{
        setTimeout(resolve, sec * 1000)
    })
}

(async()=>{
    const allData = [];
    const allUrls = [];
    const wb = xlsx.readFile('./next75_Mostafa.xlsx');
    const ws = wb.Sheets["First40_Jefferson"];
    const data = xlsx.utils.sheet_to_json(ws);
    for(let url of data){
        allUrls.push(url.allurls)
    }


    const browser = await puppeteer.launch({
        headless:false
    })
    const page = await browser.newPage();
    await page.goto(allUrls[0]);
    await wait(5);
    // log into account 
    await page.click('button[data-tracking-control-name="auth_wall_desktop_company-login-toggle"]');
    await page.type('.login-email', process.env.EMAIL);
    await page.type('.login-password', process.env.PASSWORD)
    await page.click('#login-submit');
    await wait(5);
    try{
        for(let i = 49769; i < 50000; i++){
            await page.goto(allUrls[i]);
            await wait(1);
            let pageHasData = await page.evaluate(()=>{
                if (document.querySelector('.artdeco-empty-state__message') == null){
                    return true;
                }else{
                    return false
                }
            })
            if(pageHasData){
                const data = await page.evaluate((allUrls, i)=>{
                    let description;
                    let employees;
                    let location;
                    let companyName;
                    if(document.querySelector('.org-top-card__primary-content.org-top-card-primary-content--zero-height-logo.org-top-card__primary-content--ia .t-24.t-black.t-bold.full-width')){
                        companyName = document.querySelector('.org-top-card__primary-content.org-top-card-primary-content--zero-height-logo.org-top-card__primary-content--ia .t-24.t-black.t-bold.full-width').textContent.trim(); 
                    }else{
                        companyName = allUrls[i].replace('https://linkedin.com/company/', '')
                    }
                   
                    if(document.querySelector('.inline-block .org-top-card-summary-info-list__info-item')){
                        location = document.querySelector('.inline-block .org-top-card-summary-info-list__info-item').textContent.trim();
                    }else{
                        location = '--------'
                    }
                   
                    if(document.querySelector('.org-top-card-summary-info-list__info-item')){
                        category = document.querySelector('.org-top-card-summary-info-list__info-item').textContent.trim()
                    }else{
                        category = '--------'
                    }
                  
                    if(document.querySelector('.org-top-card-summary__tagline.t-16.t-black')){
                           description = document.querySelector('.org-top-card-summary__tagline.t-16.t-black').textContent.trim();
                    }else{
                        description = ''
                    }
                    if(document.querySelector('.link-without-visited-state.t-bold.t-black--light')){
                         employees = document.querySelector('.link-without-visited-state.t-bold.t-black--light').textContent.trim().replace('View all', '').replace('employees', '').replace('See', '').replace('on LinkedIn', '').replace('employee', '').replace('See all', '').replace('all', '');
                    }else{
                        employees = '------'
                    }
                   
                    return {
                        'company name': companyName,
                        category: category,
                        location: location,
                        description: description,
                        emplyees: employees,
                        'linkedin url': allUrls[i]
                    }
                 
                }, allUrls, i)
                allData.push(data)
                console.log(i)
            }
            
        }   
    }catch(e){

        const newWB = xlsx.utils.book_new();
        const newWS = xlsx.utils.json_to_sheet(allData);
        xlsx.utils.book_append_sheet(newWB, newWS, "allData");
        xlsx.writeFile(newWB, 'last.xlsx');
    }
const newWB = xlsx.utils.book_new();
const newWS = xlsx.utils.json_to_sheet(allData);
xlsx.utils.book_append_sheet(newWB, newWS, "allData");
xlsx.writeFile(newWB, 'last.xlsx');
  
})();