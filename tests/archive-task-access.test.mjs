import test from 'node:test';
import assert from 'node:assert/strict';
import {requirePrivateTaskAccess} from '../lib/archive-task-access.ts';
const url='https://seoul-place-history.xeonire.chatgpt.site/api/archive/task';
test('private task access accepts dispatch-protected service calls and verifies any supplied visitor identity',()=>{
 assert.equal(requirePrivateTaskAccess(new Request(url)),'scheduled-private-service');
 assert.equal(requirePrivateTaskAccess(new Request(url,{headers:{'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'owner@example.com'}}),'owner@example.com'),'owner');
 assert.throws(()=>requirePrivateTaskAccess(new Request(url,{headers:{'oai-authenticated-user-id':'other','oai-authenticated-user-email':'other@example.com'}}),'owner@example.com'),e=>e.code==='ARCHIVE_FORBIDDEN');
 assert.throws(()=>requirePrivateTaskAccess(new Request(url,{headers:{'oai-authenticated-user-email':'owner@example.com'}}),'owner@example.com'),e=>e.code==='ARCHIVE_FORBIDDEN');
});
test('private task access rejects foreign origins and other hosts',()=>{
 assert.throws(()=>requirePrivateTaskAccess(new Request(url,{headers:{origin:'https://foreign.example'}})),e=>e.code==='ARCHIVE_ORIGIN');
 assert.throws(()=>requirePrivateTaskAccess(new Request('https://other.example/api/archive/task')),e=>e.code==='TASK_HOST');
});
