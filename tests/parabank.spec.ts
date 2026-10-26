import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { ParaBank } from '../pages/parabank.js';
describe('ParaBank customer journeys', function() {
  this.timeout(90000); let driver: any; let bank: ParaBank;
  beforeEach(async function() {
    driver=await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().addArguments('--headless=new','--no-sandbox','--disable-dev-shm-usage','--window-size=1440,900')).build(); bank=new ParaBank(driver);
  });
  afterEach(async function() {
    if (!driver) return;
    try { if (this.currentTest?.state==='failed') { await mkdir('reports',{recursive:true}); await writeFile('reports/'+Date.now()+'.png',await driver.takeScreenshot(),'base64'); } } finally { await driver.quit(); }
  });
  it('register a new customer', async()=> { await bank.register(); });
  it('logout and log in with the same customer', async()=> { await bank.register(); await bank.link('Log Out'); await bank.login(); await bank.text('#rightPanel h1','Accounts Overview'); });
  it('reject missing required fields', async()=> { await bank.home(); await bank.link('Register'); await bank.submit(); await bank.text('[id="customer.firstName.errors"]','First name is required.'); });
  it('reject mismatched passwords', async()=> { await bank.form(true); await bank.submit(); await bank.text('[id="repeatedPassword.errors"]','Passwords did not match.'); });
  it('reject unknown credentials', async()=> { await bank.home(); await bank.login(); await bank.text('#rightPanel .error','The username and password could not be verified.'); });
  it('open and inspect a savings account', async()=> { await bank.register(); await bank.savings(); });
});
