import { By, until } from 'selenium-webdriver';
import { Select } from 'selenium-webdriver/lib/select.js';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
export class ParaBank {
  driver: any; username: string; password: string;
  constructor(driver: any) { this.driver=driver; this.username='qa'+randomUUID().replaceAll('-','').slice(0,18); this.password='DemoPass42!'; }
  async element(id: string) { return this.driver.wait(until.elementLocated(By.id(id)),20000); }
  async home() { await this.driver.get((process.env.PARABANK_URL || 'https://parabank.parasoft.com/parabank')+'/index.htm'); }
  async link(name: string) { const e=await this.driver.wait(until.elementLocated(By.linkText(name)),20000); await e.click(); }
  async text(selector: string, expected: string) { const e=await this.driver.wait(until.elementLocated(By.css(selector)),20000); await this.driver.wait(until.elementTextIs(e,expected),20000); assert.equal(await e.getText(),expected); }
  async form(mismatch=false) {
    await this.home(); await this.link('Register');
    for (const [id,value] of Object.entries({"customer.firstName": "Automation", "customer.lastName": "Example", "customer.address.street": "123 Fictional Street", "customer.address.city": "Demo City", "customer.address.state": "CA", "customer.address.zipCode": "90210", "customer.phoneNumber": "5551234567", "customer.ssn": "123456789"})) await (await this.element(id)).sendKeys(value);
    await (await this.element('customer.username')).sendKeys(this.username);
    await (await this.element('customer.password')).sendKeys(this.password);
    await (await this.element('repeatedPassword')).sendKeys(mismatch?'Different42!':this.password);
  }
  async submit() { await this.driver.findElement(By.css('#customerForm input[type=submit]')).click(); }
  async register() { await this.form(); await this.submit(); await this.text('#rightPanel h1','Welcome '+this.username); }
  async login() {
    await this.driver.findElement(By.name('username')).sendKeys(this.username);
    await this.driver.findElement(By.name('password')).sendKeys(this.password);
    await this.driver.findElement(By.css('#loginPanel input[type=submit]')).click();
  }
  async savings() {
    await this.link('Open New Account');
    await this.driver.wait(async()=> (await this.driver.findElements(By.css('#fromAccountId option'))).length>0,20000);
    await new Select(await this.element('type')).selectByValue('1');
    await this.driver.findElement(By.css('#openAccountForm input.button')).click();
    const account=await this.element('newAccountId'); await this.driver.wait(until.elementTextMatches(account,/^\d+$/),20000);
    const id=await account.getText(); await account.click(); await this.text('#accountId',id); await this.text('#accountType','SAVINGS');
  }
}
