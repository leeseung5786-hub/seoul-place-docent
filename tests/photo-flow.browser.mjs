// Optional browser check: run with Playwright installed and a local production server.
import {createRequire} from 'node:module';
import {gpsJpeg} from './fixtures/photo-gps.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>console.log('PAGE_ERROR',e.message));const requests=[];let lookups=0,places=0;
const address={roadAddr:'서울특별시 성동구 마장로42길 16',jibunAddr:'서울특별시 성동구 마장동 784',sggNm:'성동구',emdNm:'마장동',bdMgtSn:'fixture'};
let candidates=[{...address,token:'fixture-token'}];
await page.route('**/api/**',async route=>{const req=route.request(),url=new URL(req.url());requests.push({path:url.pathname,method:req.method(),body:req.postData()});if(url.pathname==='/api/place-photos'){await route.fulfill({json:{photos:[],providers:[]}});return;}if(!['/api/status','/api/map-address','/api/place','/api/place-context'].includes(url.pathname)){await route.continue();return;}let body={};
if(url.pathname==='/api/map-address'){lookups++;assert.ok(+url.searchParams.get('x')>126);assert.ok(+url.searchParams.get('y')<38);body={location:{x:126.96,y:37.56,address,precision:'parcel',administrativeDong:'마장동'},candidates,message:'합성 주소 응답'};}
if(url.pathname==='/api/place'){places++;body={address,history:[],building:{status:'unavailable'},coordinates:{status:'unavailable'},queriedAt:new Date().toISOString()};}
if(url.pathname==='/api/place-context')body={closed:{status:'unavailable'},parcel:{status:'unavailable'}};
if(url.pathname==='/api/status')body={address:true,coordinates:true,map:false,ai:false};
if(url.pathname==='/api/archive/photo-research')body={visuals:{scope:'dong',rows:[],total:0,page:1,pageSize:6,sourceOnlyTotal:0,sourceOnlyRows:[]}};
if(url.pathname==='/api/archive/video-research')body={items:[],total:0,page:1,pageSize:6};
await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});});
await page.goto((process.env.PHOTO_TEST_URL||'http://127.0.0.1:3011/'),{waitUntil:'networkidle'});
await page.locator('input[type=file]').setInputFiles({name:'gps-fixture.jpg',mimeType:'image/jpeg',buffer:Buffer.from(gpsJpeg())});
await page.locator('.candidate-panel .candidate').waitFor();assert.equal(lookups,1);assert.equal(places,0,'must confirm before building lookup');
await page.locator('.candidate-panel .candidate').first().click();await page.getByRole('link',{name:'내 AI로 이 장소의 역사 알아보기 →'}).waitFor();assert.equal(places,1);
await page.locator('input[type=file]').setInputFiles({name:'no-gps.jpg',mimeType:'image/jpeg',buffer:Buffer.from([255,216,255,217])});await page.getByText('GPS를 찾지 못했거나 EXIF가 손상됐어요.',{exact:false}).waitFor();assert.equal(lookups,1);
candidates=[{...address,token:'a'},{...address,roadAddr:address.roadAddr+' 별관',token:'b'}];
await page.locator('input[type=file]').setInputFiles({name:'gps-fixture.jpg',mimeType:'image/jpeg',buffer:Buffer.from(gpsJpeg())});await page.locator('.candidate-panel').waitFor();assert.equal(places,1);assert.equal(await page.locator('.candidate-panel .candidate').count(),2);
candidates=[];await page.locator('input[type=file]').setInputFiles({name:'gps-fixture.jpg',mimeType:'image/jpeg',buffer:Buffer.from(gpsJpeg())});await page.getByRole('button',{name:'이 동네 확인 후 자료 찾기'}).waitFor();assert.equal(places,1);await page.getByRole('button',{name:'이 동네 확인 후 자료 찾기'}).click();await page.getByRole('link',{name:'내 AI로 이 장소의 역사 알아보기 →'}).waitFor();
await page.context().grantPermissions(['geolocation']);await page.context().setGeolocation({latitude:37.56,longitude:126.96});
const beforeLocation=lookups;await page.getByRole('button',{name:'현재 위치 사용'}).click();await page.getByRole('button',{name:'이 동네 확인 후 자료 찾기'}).waitFor();assert.equal(lookups,beforeLocation+1);await page.getByRole('button',{name:'이 동네 확인 후 자료 찾기'}).click();await page.getByText('현재 위치 GPS',{exact:false}).waitFor();
await page.evaluate(()=>Object.defineProperty(navigator,'geolocation',{configurable:true,value:{getCurrentPosition(ok,fail){fail({code:1});}}}));
const beforeDenied=lookups;await page.getByRole('button',{name:'현재 위치 사용'}).click();await page.getByText('위치를 확인하지 못했어요.',{exact:false}).waitFor();assert.equal(lookups,beforeDenied);
assert.ok(requests.every(r=>r.body===null||!r.body.includes('Exif')),'photo bytes never uploaded');
if(process.env.PHOTO_SCREENSHOT)await page.screenshot({path:process.env.PHOTO_SCREENSHOT,fullPage:true});console.log(JSON.stringify({status:'passed',viewport:'390x844',mapLookups:lookups,buildingLookups:places,checks:['single candidate requires confirmation','missing GPS fallback','multiple candidate choice','neighborhood confirmation','current location allowed and denied','coordinates only upload']}));
assert.ok(requests.every(r=>r.path!=='/api/ai-summary'),'photo selection must not automatically invoke operator AI');
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
