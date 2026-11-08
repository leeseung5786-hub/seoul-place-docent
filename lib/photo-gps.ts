/** Read JPEG EXIF GPS locally. No image pixels or file bytes leave the browser. */
export function readPhotoGps(buffer:ArrayBuffer):{x:number;y:number}|null{
 try{
  const v=new DataView(buffer);if(v.byteLength<4||v.getUint16(0)!==0xffd8)return null;
  let pos=2;
  while(pos+4<=v.byteLength){if(v.getUint8(pos)!==255)return null;const marker=v.getUint8(pos+1);if(marker===0xda||marker===0xd9)break;const size=v.getUint16(pos+2);if(size<2||pos+2+size>v.byteLength)return null;
   if(marker===0xe1&&size>=16&&v.getUint32(pos+4)===0x45786966&&v.getUint16(pos+8)===0){
    const start=pos+10,end=pos+2+size;const little=v.getUint16(start)===0x4949;if(!little&&v.getUint16(start)!==0x4d4d)return null;
    const u16=(p:number)=>{if(p<start||p+2>end)throw Error();return v.getUint16(p,little);};const u32=(p:number)=>{if(p<start||p+4>end)throw Error();return v.getUint32(p,little);};if(u16(start+2)!==42)return null;
    const ifd=start+u32(start+4),count=u16(ifd);if(count>1024)return null;let gps=0;
    for(let i=0;i<count;i++){const p=ifd+2+i*12;if(u16(p)===0x8825&&u16(p+2)===4&&u32(p+4)===1)gps=start+u32(p+8);}
    if(!gps)return null;const n=u16(gps);if(n>64)return null;let lat:number[]|undefined,lon:number[]|undefined,ns='',ew='';
    for(let i=0;i<n;i++){const p=gps+2+i*12,tag=u16(p),type=u16(p+2),cnt=u32(p+4);if([1,3].includes(tag)&&type===2&&cnt===2){const char=String.fromCharCode(v.getUint8(p+8));if(tag===1)ns=char;else ew=char;}
     if([2,4].includes(tag)&&type===5&&cnt===3){const at=start+u32(p+8),a=[];for(let j=0;j<3;j++){const denominator=u32(at+j*8+4);if(!denominator)return null;a.push(u32(at+j*8)/denominator);}if(tag===2)lat=a;else lon=a;}}
    if(!lat||!lon||!['N','S'].includes(ns)||!['E','W'].includes(ew)||lat[1]>=60||lat[2]>=60||lon[1]>=60||lon[2]>=60)return null;
    const y=(lat[0]+lat[1]/60+lat[2]/3600)*(ns==='S'?-1:1),x=(lon[0]+lon[1]/60+lon[2]/3600)*(ew==='W'?-1:1);
    return Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x)<=180&&Math.abs(y)<=90?{x,y}:null;
   }pos+=2+size;
  }return null;
 }catch{return null;}
}

/** Keep the existing JPEG parser; load the HEIF metadata reader only for ISO BMFF files. */
export async function readPhonePhotoGps(buffer: ArrayBuffer): Promise<{x: number; y: number} | null> {
 const view = new DataView(buffer);
 if (view.byteLength < 12 || view.getUint32(4) !== 0x66747970) return readPhotoGps(buffer);
 // Reject malformed top-level boxes before handing the file to the HEIF parser.
 let offset = 0;
 while (offset + 8 <= view.byteLength) {
  const size = view.getUint32(offset);
  if (size < 8 || offset + size > view.byteLength) return null;
  if (view.getUint32(offset + 4) === 0x6d657461) break;
  offset += size;
 }
 if (offset + 12 > view.byteLength || view.getUint32(offset) < 12) return null;
 try {
  const {default: exifr} = await import('exifr');
  const coordinates = await exifr.gps(buffer);
  if (!coordinates) return null;
  const {latitude, longitude} = coordinates;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return {x: longitude, y: latitude};
 } catch {
  return null;
 }
}
