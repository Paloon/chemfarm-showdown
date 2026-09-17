-- Run after schema.sql. All answers are integers and all questions are fixed.

insert into public.quiz_questions (id, type, question_data, answer) values
('10000000-0000-0000-0000-000000000001','rate_table','{"tableData":[{"expId":1,"A":0.1,"B":0.1,"rate":2},{"expId":2,"A":0.2,"B":0.1,"rate":4},{"expId":3,"A":0.1,"B":0.2,"rate":4}]}','{"m":1,"n":1}'),
('10000000-0000-0000-0000-000000000002','rate_table','{"tableData":[{"expId":1,"A":0.1,"B":0.1,"rate":1},{"expId":2,"A":0.2,"B":0.1,"rate":4},{"expId":3,"A":0.1,"B":0.2,"rate":2}]}','{"m":2,"n":1}'),
('10000000-0000-0000-0000-000000000003','rate_table','{"tableData":[{"expId":1,"A":0.1,"B":0.1,"rate":3},{"expId":2,"A":0.2,"B":0.1,"rate":6},{"expId":3,"A":0.1,"B":0.2,"rate":12}]}','{"m":1,"n":2}'),
('10000000-0000-0000-0000-000000000004','rate_table','{"tableData":[{"expId":1,"A":0.1,"B":0.1,"rate":5},{"expId":2,"A":0.2,"B":0.1,"rate":5},{"expId":3,"A":0.1,"B":0.2,"rate":10}]}','{"m":0,"n":1}'),
('10000000-0000-0000-0000-000000000005','rate_table','{"tableData":[{"expId":1,"A":0.1,"B":0.1,"rate":4},{"expId":2,"A":0.2,"B":0.1,"rate":16},{"expId":3,"A":0.1,"B":0.2,"rate":4}]}','{"m":2,"n":0}'),
('10000000-0000-0000-0000-000000000006','rate_table','{"tableData":[{"expId":1,"A":0.1,"B":0.1,"rate":2},{"expId":2,"A":0.2,"B":0.1,"rate":2},{"expId":3,"A":0.1,"B":0.2,"rate":8}]}','{"m":0,"n":2}'),
('10000000-0000-0000-0000-000000000007','rate_table','{"tableData":[{"expId":1,"A":0.1,"B":0.1,"rate":1},{"expId":2,"A":0.2,"B":0.1,"rate":8},{"expId":3,"A":0.1,"B":0.2,"rate":2}]}','{"m":3,"n":1}'),
('10000000-0000-0000-0000-000000000008','rate_table','{"tableData":[{"expId":1,"A":0.1,"B":0.1,"rate":6},{"expId":2,"A":0.2,"B":0.1,"rate":12},{"expId":3,"A":0.1,"B":0.2,"rate":6}]}','{"m":1,"n":0}'),
('10000000-0000-0000-0000-000000000009','rate_table','{"tableData":[{"expId":1,"A":0.1,"B":0.1,"rate":1},{"expId":2,"A":0.2,"B":0.1,"rate":4},{"expId":3,"A":0.1,"B":0.2,"rate":4}]}','{"m":2,"n":2}'),
('10000000-0000-0000-0000-000000000010','rate_table','{"tableData":[{"expId":1,"A":0.1,"B":0.1,"rate":2},{"expId":2,"A":0.2,"B":0.1,"rate":16},{"expId":3,"A":0.1,"B":0.2,"rate":2}]}','{"m":3,"n":0}'),
('20000000-0000-0000-0000-000000000001','energy_graph','{"reactantEnergy":20,"peakEnergy":110,"productEnergy":50}','{"EaForward":90,"EaReverse":60}'),
('20000000-0000-0000-0000-000000000002','energy_graph','{"reactantEnergy":35,"peakEnergy":125,"productEnergy":15}','{"EaForward":90,"EaReverse":110}'),
('20000000-0000-0000-0000-000000000003','energy_graph','{"reactantEnergy":10,"peakEnergy":80,"productEnergy":30}','{"EaForward":70,"EaReverse":50}'),
('20000000-0000-0000-0000-000000000004','energy_graph','{"reactantEnergy":45,"peakEnergy":150,"productEnergy":75}','{"EaForward":105,"EaReverse":75}'),
('20000000-0000-0000-0000-000000000005','energy_graph','{"reactantEnergy":60,"peakEnergy":140,"productEnergy":25}','{"EaForward":80,"EaReverse":115}'),
('20000000-0000-0000-0000-000000000006','energy_graph','{"reactantEnergy":15,"peakEnergy":95,"productEnergy":55}','{"EaForward":80,"EaReverse":40}'),
('20000000-0000-0000-0000-000000000007','energy_graph','{"reactantEnergy":50,"peakEnergy":135,"productEnergy":65}','{"EaForward":85,"EaReverse":70}'),
('20000000-0000-0000-0000-000000000008','energy_graph','{"reactantEnergy":30,"peakEnergy":120,"productEnergy":20}','{"EaForward":90,"EaReverse":100}'),
('20000000-0000-0000-0000-000000000009','energy_graph','{"reactantEnergy":25,"peakEnergy":100,"productEnergy":40}','{"EaForward":75,"EaReverse":60}'),
('20000000-0000-0000-0000-000000000010','energy_graph','{"reactantEnergy":70,"peakEnergy":160,"productEnergy":45}','{"EaForward":90,"EaReverse":115}')
on conflict (id) do update set
  type = excluded.type,
  question_data = excluded.question_data,
  answer = excluded.answer;
