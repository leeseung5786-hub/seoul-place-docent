import {photoResearchBundle} from './photo-research-data';
import raw from '../data/document-research/bundle.json';
import manualPhotos from '../data/manual-photos.json';
import {manualPhotoItems} from './manual-photos';
import {buildDocentStory} from './docent-story';
import type {DocumentBundle} from './document-research';
import {ServiceError} from './providers';
const documents=raw as unknown as DocumentBundle;
const manual=manualPhotoItems(manualPhotos);
export function getDocentStory(district:string,dong:string){
 if(!district||!dong||district.length>20||dong.length>30||!documents.targets.some(t=>t.level==='법정동'&&t.district===district&&t.name===dong))throw new ServiceError('STORY_LOCATION','서울 주소를 먼저 선택해 주세요.',400);
 return buildDocentStory(photoResearchBundle,documents,district,dong,manual);
}
