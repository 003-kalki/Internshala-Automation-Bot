import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';

dotenv.config();

puppeteer.use(StealthPlugin());

const email = process.env.EMAIL;
const password = process.env.PASSWORD;
const coverLetter = process.env.Co;

const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('https://internshala.com');
    await page.setViewport({ width: 1080, height: 1024 });

    // Login process
    await page.waitForSelector('.nav-cta-container .login-cta', { visible: true });
    await page.click('.nav-cta-container .login-cta');

    await page.waitForSelector('#modal_email', { visible: true });
    await page.type('#modal_email', email, { delay: 100 });

    await page.waitForSelector('#modal_password', { visible: true });
    await page.type('#modal_password', password, { delay: 100 });

    await page.waitForSelector('#modal_login_submit', { visible: true });
    await Promise.all([
      page.waitForNavigation(),
      page.click('#modal_login_submit')
    ]);

    // Navigate to internships page
    await page.goto('https://internshala.com/internships/');

    // Select category and perform search
    await page.waitForSelector('#select_category_chosen');
    await page.click('#select_category_chosen');
    await page.waitForSelector('#select_category_chosen > ul > li > input');
    await page.click('#select_category_chosen > ul > li > input');
    await delay(3000);
    await page.type('#select_category_chosen > ul > li > input', ' Front ', { delay: 150 });
    await page.keyboard.press('Enter');

    await delay(6000);

    // Apply filters
    await page.waitForSelector('#work_from_home', { visible: true });
    await page.evaluate(() => {
      document.querySelector('#work_from_home').click();
    });

    await delay(6000);

    // Wait for internship list to load
    await page.waitForSelector('#internship_list_container_1');

    // Get all internship elements
    const internshipElements = await page.$$('.container-fluid.individual_internship.easy_apply.button_easy_apply_t.visibilityTrackerItem');

    for (let i = 0; i < internshipElements.length; i++) {
      const element = internshipElements[i];
      if (element) {
        const nameElement = await element.$('h3.job-internship-name');
        const internshipName = await page.evaluate(name => name.textContent.trim(), nameElement);

        // Perform actions based on internship name
        if (['Reactjs Development', 'Frontend Development', 'Front End Development', 'Javascript Development', 'Nextjs Development'].includes(internshipName)) {
          await element.click();

          // Increase the timeout and wait for the continue button
          await page.waitForSelector('.continue_container #continue_button', { visible: true, timeout: 30000 });
          await page.evaluate(() => {
            document.querySelector('.continue_container #continue_button').click();
          });

          await page.waitForSelector('#cover_letter_holder > div.ql-editor.ql-blank');
          await page.type('#cover_letter_holder > div.ql-editor.ql-blank', coverLetter, { delay: 100 });

          const textarea1 = await page.$('#text_5569691');
          if (textarea1) {
            await page.type('#text_5569691', 'test answer for textarea1');
          }

          const textarea2 = await page.$('#text_5569692');
          if (textarea2) {
            await page.type('#text_5569692', 'Answer to the second question');
          }

          await page.waitForSelector('.submit_button_container.easy_apply_footer #submit');
          await page.click('.submit_button_container.easy_apply_footer #submit');
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
