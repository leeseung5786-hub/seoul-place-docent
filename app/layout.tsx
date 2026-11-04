import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'서울 장소 도슨트 | 사진으로 걷는 서울의 시간',description:'주소 하나 또는 GPS 사진 한 장으로 시작하는 서울의 시간 여행. 사진과 짧은 이야기, 원문 출처로 만나는 장소 도슨트.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
