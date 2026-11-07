import importlib.util, unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('video_import',Path(__file__).resolve().parents[1]/'scripts/import-video-workbooks.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class VideoImportTest(unittest.TestCase):
 def test_youtube_variants(self):
  urls=['https://youtu.be/abcdefghijk?t=20','https://m.youtube.com/watch?v=abcdefghijk&feature=share','https://www.youtube.com/shorts/abcdefghijk','https://www.youtube.com/embed/abcdefghijk?start=9']
  self.assertEqual(len({m.canonical(u)[0] for u in urls}),1)
 def test_no_guessing_missing_id_or_search(self):
  for u in ['https://www.youtube.com/results?search_query=test','https://www.youtube.com/watch?v=bad','미확인','javascript:alert(1)','https://archives.seoul.go.kr/source.pdf']:
   self.assertIsNone(m.canonical(u)[0])
 def test_official_id_variants(self):
  self.assertEqual(m.canonical('https://archives.seoul.go.kr/item/00004266981?previousUrl=x')[0],m.canonical('https://archives.seoul.go.kr/item/4266981')[0])
  self.assertNotEqual(m.canonical('https://www.ehistory.go.kr/view/movie?mediadtl=1&mediagbn=DH')[0],m.canonical('https://www.ehistory.go.kr/view/movie?mediadtl=2&mediagbn=DH')[0])
 def test_header_and_times_are_read_from_labels(self):
  self.assertEqual(m.header_index([['제목'],[],['자료ID','자료명','영상URL']]),2)
  self.assertEqual(m.seconds('01:02:03'),3723);self.assertIsNone(m.seconds('01:90'));self.assertIsNone(m.seconds('미확인'))
if __name__=='__main__':unittest.main()
